
-- ============================================================
-- PHASE 2: BOOKING INTEGRITY + INDEXES
-- ============================================================

-- Prevent double-booking at the database level (defense in depth)
CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_slot_unique
  ON public.bookings (slot_id)
  WHERE status NOT IN ('cancelled', 'no_show');

-- Hot-path indexes
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status);
CREATE INDEX IF NOT EXISTS bookings_payment_status_idx ON public.bookings (payment_status);
CREATE INDEX IF NOT EXISTS bookings_client_token_idx ON public.bookings (client_token);
CREATE INDEX IF NOT EXISTS bookings_payment_expires_idx ON public.bookings (payment_expires_at) WHERE payment_status IN ('pending', 'pending_payment', 'pending_verification');
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON public.bookings (created_at DESC);

CREATE INDEX IF NOT EXISTS booking_slots_date_idx ON public.booking_slots (slot_date);
CREATE INDEX IF NOT EXISTS gallery_images_type_sort_idx ON public.gallery_images (gallery_type, sort_order);
CREATE INDEX IF NOT EXISTS chat_messages_session_created_idx ON public.chat_messages (session_id, created_at);
CREATE INDEX IF NOT EXISTS chat_sessions_token_idx ON public.chat_sessions (client_token);
CREATE INDEX IF NOT EXISTS security_events_created_idx ON public.security_events (created_at DESC);
CREATE INDEX IF NOT EXISTS security_events_type_severity_idx ON public.security_events (event_type, severity);
CREATE INDEX IF NOT EXISTS contact_submissions_created_idx ON public.contact_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_approved_created_idx ON public.reviews (is_approved, created_at DESC);

-- Atomic booking creation: validates, locks the slot, prevents races
CREATE OR REPLACE FUNCTION public.create_booking(
  p_slot_id uuid,
  p_client_name text,
  p_phone_number text,
  p_agreed_price numeric,
  p_inspiration_image_url text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_honeypot text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot RECORD;
  v_existing_count integer;
  v_new_id uuid;
  v_client_token text;
  v_deposit numeric;
BEGIN
  -- Bot honeypot: silently succeed-looking but never inserts
  IF p_honeypot IS NOT NULL AND length(p_honeypot) > 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid submission');
  END IF;

  -- Input validation (mirrors RLS CHECK + server-side)
  IF p_client_name IS NULL OR length(trim(p_client_name)) < 2 OR length(p_client_name) > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid name');
  END IF;
  IF p_client_name ~ '<[^>]*>' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid characters in name');
  END IF;
  IF p_phone_number IS NULL OR p_phone_number !~ '^\+?[0-9]{10,15}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid phone number');
  END IF;
  IF p_agreed_price IS NULL OR p_agreed_price <= 0 OR p_agreed_price >= 1000000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid price');
  END IF;
  IF p_notes IS NOT NULL AND (length(p_notes) > 500 OR p_notes ~ '<script') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid notes');
  END IF;

  -- Lock the slot row to serialize concurrent bookings on the same slot
  SELECT id, slot_date INTO v_slot
  FROM booking_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
  END IF;

  -- Reject past-dated slots
  IF v_slot.slot_date < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot is in the past');
  END IF;

  -- Atomic duplicate check (the unique partial index is the ultimate guarantee)
  SELECT COUNT(*) INTO v_existing_count
  FROM bookings
  WHERE slot_id = p_slot_id
    AND status NOT IN ('cancelled', 'no_show');

  IF v_existing_count > 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'This slot is no longer available');
  END IF;

  v_new_id := gen_random_uuid();
  v_client_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  v_deposit := ceil(p_agreed_price * 0.15);

  INSERT INTO bookings (
    id, slot_id, client_name, phone_number, inspiration_image_url, notes,
    status, agreed_price, deposit_amount, payment_status, deposit_paid,
    payment_expires_at, client_token
  ) VALUES (
    v_new_id, p_slot_id, trim(p_client_name), trim(p_phone_number),
    p_inspiration_image_url, NULLIF(trim(p_notes), ''),
    'pending_payment', p_agreed_price, v_deposit, 'pending_payment', false,
    now() + interval '24 hours', v_client_token
  );

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_new_id,
    'client_token', v_client_token,
    'deposit_amount', v_deposit
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'This slot is no longer available');
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking(uuid, text, text, numeric, text, text, text) TO anon, authenticated;

-- ============================================================
-- PHASE 1: ADMIN AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert audit log"
  ON public.admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND actor_user_id = auth.uid());

CREATE INDEX admin_audit_log_created_idx ON public.admin_audit_log (created_at DESC);
CREATE INDEX admin_audit_log_actor_idx ON public.admin_audit_log (actor_user_id, created_at DESC);
CREATE INDEX admin_audit_log_entity_idx ON public.admin_audit_log (entity_type, entity_id);

-- ============================================================
-- PHASE 4: CLIENT ERROR REPORTING
-- ============================================================

CREATE TABLE IF NOT EXISTS public.client_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  stack text,
  url text,
  user_agent text,
  ip_address text,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.client_errors TO anon, authenticated;
GRANT SELECT ON public.client_errors TO authenticated;
GRANT ALL ON public.client_errors TO service_role;

ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;

-- Anyone can report an error, but message size is enforced
CREATE POLICY "Anyone can report client errors"
  ON public.client_errors FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(message) BETWEEN 1 AND 2000
    AND (stack IS NULL OR length(stack) <= 8000)
    AND (url IS NULL OR length(url) <= 500)
    AND (user_agent IS NULL OR length(user_agent) <= 500)
  );

CREATE POLICY "Admins can view client errors"
  ON public.client_errors FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX client_errors_created_idx ON public.client_errors (created_at DESC);

-- ============================================================
-- PHASE 4: HEALTH CHECK
-- ============================================================

CREATE OR REPLACE FUNCTION public.health_check()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'status', 'ok',
    'db_time', now(),
    'version', '1.0'
  );
$$;

GRANT EXECUTE ON FUNCTION public.health_check() TO anon, authenticated;
