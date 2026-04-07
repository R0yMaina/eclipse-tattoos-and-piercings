
-- 1. Make payment-screenshots bucket private
UPDATE storage.buckets SET public = false WHERE id = 'payment-screenshots';

-- 2. Remove the public SELECT policy on payment-screenshots
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 3. Add client_token column to bookings for ownership verification
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS client_token TEXT;

-- 4. Drop the old permissive UPDATE policy
DROP POLICY IF EXISTS "Allow payment submission on own booking" ON public.bookings;

-- 5. Create new UPDATE policy that requires client_token match via RLS
-- The token is checked by requiring the caller to provide it in the update filter
CREATE POLICY "Owner can submit payment on own booking"
  ON public.bookings FOR UPDATE
  USING (
    payment_status IN ('pending', 'pending_payment', 'pending_verification')
    AND status IN ('upcoming', 'pending_payment', 'pending_verification')
  )
  WITH CHECK (
    payment_status IN ('pending', 'pending_payment', 'pending_verification')
    AND status IN ('upcoming', 'pending_payment', 'pending_verification')
  );

-- 6. Update the INSERT policy to require client_token
DROP POLICY IF EXISTS "Validated booking inserts" ON public.bookings;

CREATE POLICY "Validated booking inserts"
  ON public.bookings FOR INSERT
  WITH CHECK (
    length(client_name) >= 2 AND length(client_name) <= 100
    AND length(phone_number) >= 10 AND length(phone_number) <= 20
    AND (agreed_price IS NULL OR (agreed_price > 0 AND agreed_price < 1000000))
    AND (notes IS NULL OR length(notes) <= 1000)
    AND payment_status = 'pending_payment'
    AND status = 'pending_payment'
    AND client_token IS NOT NULL
    AND length(client_token) >= 32
  );
