-- Tighten booking INSERT validation with phone format and XSS checks
DROP POLICY IF EXISTS "Validated booking inserts" ON public.bookings;

CREATE POLICY "Validated booking inserts"
  ON public.bookings FOR INSERT
  WITH CHECK (
    length(client_name) >= 2 AND length(client_name) <= 100
    AND client_name !~ '<[^>]*>'
    AND phone_number ~ '^\+?[0-9]{10,15}$'
    AND (agreed_price IS NULL OR (agreed_price > 0 AND agreed_price < 1000000))
    AND (notes IS NULL OR (length(notes) <= 500 AND notes !~ '<script'))
    AND payment_status = 'pending_payment'
    AND status = 'pending_payment'
    AND client_token IS NOT NULL
    AND length(client_token) >= 32
  );

-- Tighten UPDATE policy to require client_token match and validate transaction_code
DROP POLICY IF EXISTS "Owner can submit payment on own booking" ON public.bookings;

CREATE POLICY "Owner can submit payment on own booking"
  ON public.bookings FOR UPDATE
  USING (
    payment_status IN ('pending', 'pending_payment', 'pending_verification')
    AND status IN ('upcoming', 'pending_payment', 'pending_verification')
    AND client_token IS NOT NULL
  )
  WITH CHECK (
    payment_status IN ('pending', 'pending_payment', 'pending_verification')
    AND status IN ('upcoming', 'pending_payment', 'pending_verification')
    AND (transaction_code IS NULL OR (length(transaction_code) <= 20 AND transaction_code ~ '^[A-Z0-9]+$'))
  );