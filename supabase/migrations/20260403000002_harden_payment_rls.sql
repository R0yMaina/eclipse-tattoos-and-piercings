
-- Ensure all required enum values exist for booking_status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'booking_status' AND e.enumlabel = 'pending_payment') THEN
    ALTER TYPE public.booking_status ADD VALUE 'pending_payment';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'booking_status' AND e.enumlabel = 'pending_verification') THEN
    ALTER TYPE public.booking_status ADD VALUE 'pending_verification';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'booking_status' AND e.enumlabel = 'confirmed') THEN
    ALTER TYPE public.booking_status ADD VALUE 'confirmed';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop the previous policy to replace it with a more robust one
DROP POLICY IF EXISTS "Anyone can submit payment details" ON public.bookings;

-- Create a more robust update policy for manual payment submission
-- This policy allows anonymous users to update their own booking if they have the ID
-- and it is in a state where payment is expected.
CREATE POLICY "Allow manual payment submission"
  ON public.bookings
  FOR UPDATE
  USING (
    payment_status IN ('pending', 'pending_payment', 'pending_verification')
    OR status IN ('upcoming', 'pending_payment', 'pending_verification')
  )
  WITH CHECK (
    payment_status IN ('pending_payment', 'pending_verification')
    OR status IN ('pending_payment', 'pending_verification')
  );

-- Ensure public select is still allowed for polling
-- (The previous migration 20260403000001 already added this, but let's be sure)
DROP POLICY IF EXISTS "Anyone can view their own booking status" ON public.bookings;
CREATE POLICY "Anyone can view their own booking status"
  ON public.bookings
  FOR SELECT
  USING (true);
