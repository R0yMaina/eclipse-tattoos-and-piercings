-- Improve submit_payment to reject duplicate transaction codes before the unique index is hit
CREATE OR REPLACE FUNCTION public.submit_payment(
  p_booking_id uuid,
  p_client_token text,
  p_transaction_code text,
  p_payment_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking RECORD;
  v_conflict RECORD;
BEGIN
  -- Validate inputs
  IF p_booking_id IS NULL OR p_client_token IS NULL OR p_transaction_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields');
  END IF;

  p_transaction_code := upper(trim(p_transaction_code));

  IF length(p_transaction_code) > 20 OR p_transaction_code !~ '^[A-Z0-9]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid transaction code format');
  END IF;

  IF p_payment_phone IS NOT NULL AND p_payment_phone !~ '^\+?[0-9]{10,15}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid phone number format');
  END IF;

  SELECT id, client_token, payment_status, status
  INTO v_booking
  FROM bookings
  WHERE id = p_booking_id
    AND client_token = p_client_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking not found or invalid token');
  END IF;

  IF v_booking.payment_status NOT IN ('pending', 'pending_payment')
     OR v_booking.status NOT IN ('upcoming', 'pending_payment', 'pending_verification') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking is not in a payable state');
  END IF;

  SELECT id
  INTO v_conflict
  FROM bookings
  WHERE transaction_code = p_transaction_code
    AND id <> p_booking_id
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'This transaction code is already in use for another booking. Please verify and try again.');
  END IF;

  UPDATE bookings
  SET transaction_code = p_transaction_code,
      payment_phone = COALESCE(p_payment_phone, payment_phone),
      payment_status = 'pending_verification',
      status = 'pending_verification',
      updated_at = now()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'This transaction code is already in use. Please try another code or contact support.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_payment(uuid, text, text, text) TO anon, authenticated;
