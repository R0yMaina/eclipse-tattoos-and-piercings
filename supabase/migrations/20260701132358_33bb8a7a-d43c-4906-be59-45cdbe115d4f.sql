
-- 1. Drop the duplicate overload that causes "function is not unique" for normal bookings
DROP FUNCTION IF EXISTS public.create_booking(uuid, text, text, numeric, text, text);

-- 2. Update honeypot version to use 30% deposit
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
SET search_path TO 'public'
AS $function$
DECLARE
  v_slot RECORD;
  v_existing_count integer;
  v_new_id uuid;
  v_client_token text;
  v_deposit numeric;
BEGIN
  IF p_honeypot IS NOT NULL AND length(p_honeypot) > 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid submission');
  END IF;
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

  SELECT id, slot_date INTO v_slot FROM booking_slots WHERE id = p_slot_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
  END IF;
  IF v_slot.slot_date < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot is in the past');
  END IF;

  SELECT COUNT(*) INTO v_existing_count FROM bookings
    WHERE slot_id = p_slot_id AND status NOT IN ('cancelled', 'no_show');
  IF v_existing_count > 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'This slot is no longer available');
  END IF;

  v_new_id := gen_random_uuid();
  v_client_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  v_deposit := ceil(p_agreed_price * 0.30);

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
    'success', true, 'booking_id', v_new_id,
    'client_token', v_client_token, 'deposit_amount', v_deposit
  );
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('success', false, 'error', 'This slot is no longer available');
END;
$function$;

-- 3. Add manual-booking columns
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS service_type text,
  ADD COLUMN IF NOT EXISTS appointment_date date,
  ADD COLUMN IF NOT EXISTS appointment_time time,
  ADD COLUMN IF NOT EXISTS booking_source text NOT NULL DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS is_walk_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS amount_paid numeric;

-- 4. Allow walk-ins without a slot
ALTER TABLE public.bookings ALTER COLUMN slot_id DROP NOT NULL;

-- 5. Add admin INSERT policy for manual bookings (existing "Validated booking inserts" still applies to public)
DROP POLICY IF EXISTS "Admins can insert bookings" ON public.bookings;
CREATE POLICY "Admins can insert bookings" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
