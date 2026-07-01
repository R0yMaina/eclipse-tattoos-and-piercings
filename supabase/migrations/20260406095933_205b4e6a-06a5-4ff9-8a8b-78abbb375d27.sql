CREATE OR REPLACE FUNCTION public.check_booking_status(booking_id uuid)
RETURNS TABLE(id uuid, payment_status text, status text, deposit_paid boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.payment_status,
    b.status::text,
    b.deposit_paid
  FROM bookings b
  WHERE b.id = booking_id;
END;
$$;