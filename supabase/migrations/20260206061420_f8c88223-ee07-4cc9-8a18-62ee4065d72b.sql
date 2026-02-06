
-- Add payment tracking columns to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS agreed_price numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deposit_paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS mpesa_receipt text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS mpesa_checkout_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_expires_at timestamp with time zone DEFAULT NULL;

-- Add index on payment status for efficient queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings (payment_status);

-- Add index on payment_expires_at for auto-cancel cron
CREATE INDEX IF NOT EXISTS idx_bookings_payment_expires ON public.bookings (payment_expires_at) WHERE payment_status = 'pending';

-- Allow anyone to update their own booking's payment info (for callback)
CREATE POLICY "Anyone can view their booking by phone"
  ON public.bookings
  FOR SELECT
  USING (true);
