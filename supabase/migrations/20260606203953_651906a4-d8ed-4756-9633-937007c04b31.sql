CREATE OR REPLACE FUNCTION public.create_booking(
  p_slot_id uuid,
  p_client_name text,
  p_phone_number text,
  p_agreed_price numeric,
  p_notes text DEFAULT NULL,
  p_inspiration_image_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot booking_slots%ROWTYPE;
  v_existing uuid;
  v_booking_id uuid;
  v_client_token text;
  v_deposit numeric;
BEGIN
  IF p_client_name IS NULL OR length(trim(p_client_name)) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid client name');
  END IF;
  IF p_phone_number !~ '^\+?[0-9]{10,15}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid phone number');
  END IF;
  IF p_agreed_price IS NULL OR p_agreed_price <= 0 OR p_agreed_price >= 1000000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid agreed price');
  END IF;

  SELECT * INTO v_slot FROM booking_slots WHERE id = p_slot_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
  END IF;

  SELECT id INTO v_existing FROM bookings
   WHERE slot_id = p_slot_id
     AND status NOT IN ('cancelled','no_show')
   LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot already booked');
  END IF;

  v_client_token := encode(gen_random_bytes(24), 'hex');
  v_deposit := ceil(p_agreed_price * 0.30);

  INSERT INTO bookings (
    slot_id, client_name, phone_number, notes, inspiration_image_url,
    appointment_date, appointment_time,
    status, agreed_price, deposit_amount, payment_status, deposit_paid,
    client_token, payment_expires_at
  ) VALUES (
    p_slot_id, p_client_name, p_phone_number, p_notes, p_inspiration_image_url,
    v_slot.slot_date, v_slot.start_time,
    'pending_payment', p_agreed_price, v_deposit, 'pending_payment', false,
    v_client_token, now() + interval '24 hours'
  ) RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'client_token', v_client_token,
    'deposit_amount', v_deposit
  );
END;
$$;