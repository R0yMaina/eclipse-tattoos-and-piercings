-- Fix RLS policy to allow anonymous clients to update their bookings with payment details
CREATE POLICY "Anyone can submit payment details"
  ON public.bookings
  FOR UPDATE
  USING (payment_status = 'pending_payment')
  WITH CHECK (payment_status = 'pending_verification' OR payment_status = 'pending_payment');
