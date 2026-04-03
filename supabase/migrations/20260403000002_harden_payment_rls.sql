
-- 1. Ensure the column is correctly named (payment_screenshot_url)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_screenshot_url text;

-- 2. Add an alias column (screenshot_payment_url) just in case, to prevent any further "could not find" errors
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS screenshot_payment_url text;

-- 3. FORCE PostgREST to reload the schema cache immediately
-- This is what usually fixes the "could not find column in schema cache" error
NOTIFY pgrst, 'reload schema';

-- 4. Re-apply the robust RLS update policy to include the new columns
DROP POLICY IF EXISTS "Allow manual payment submission" ON public.bookings;
CREATE POLICY "Allow manual payment submission"
  ON public.bookings
  FOR UPDATE
  USING (
    payment_status IN ('pending', 'pending_payment', 'pending_verification', 'confirmed')
    OR status IN ('upcoming', 'pending_payment', 'pending_verification', 'confirmed')
  )
  WITH CHECK (true);

-- 5. Re-grant permissions just in case
GRANT ALL ON TABLE public.bookings TO anon;
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON TABLE public.bookings TO service_role;
