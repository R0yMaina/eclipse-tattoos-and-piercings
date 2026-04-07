-- Create secure RPC for payment submission that validates ownership
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
BEGIN
  -- Validate inputs
  IF p_booking_id IS NULL OR p_client_token IS NULL OR p_transaction_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields');
  END IF;

  -- Validate transaction code format
  IF length(p_transaction_code) > 20 OR p_transaction_code !~ '^[A-Z0-9]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid transaction code format');
  END IF;

  -- Validate payment phone if provided
  IF p_payment_phone IS NOT NULL AND p_payment_phone !~ '^\+?[0-9]{10,15}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid phone number format');
  END IF;

  -- Find booking and verify ownership via client_token
  SELECT id, client_token, payment_status, status
  INTO v_booking
  FROM bookings
  WHERE id = p_booking_id
    AND client_token = p_client_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking not found or invalid token');
  END IF;

  -- Check booking is in a valid state for payment
  IF v_booking.payment_status NOT IN ('pending', 'pending_payment') 
     OR v_booking.status NOT IN ('upcoming', 'pending_payment') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking is not in a payable state');
  END IF;

  -- Perform the update
  UPDATE bookings
  SET transaction_code = p_transaction_code,
      payment_phone = COALESCE(p_payment_phone, payment_phone),
      payment_status = 'pending_verification',
      status = 'pending_verification',
      updated_at = now()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Remove the permissive anonymous UPDATE policy
DROP POLICY IF EXISTS "Owner can submit payment on own booking" ON public.bookings;