
-- Update bookings table with manual payment tracking fields
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS transaction_code text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_phone text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_screenshot_url text DEFAULT NULL;

-- Add a unique constraint to transaction_code, but only when it's not null
-- Note: In Postgres, multiple NULLs are allowed under a UNIQUE constraint.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_transaction_code_unique ON public.bookings (transaction_code) WHERE transaction_code IS NOT NULL;

-- Optional: Update enum or text values for payment_status if we want to be strict
-- For now, let's just make sure we use the new status strings as per requirement.
-- The requirements specify: pending_payment, pending_verification, confirmed, rejected.
-- Existing statuses in code were 'pending', 'paid', 'failed'. 
-- We'll transition to the new labels.

-- Add a check constraint to ensure only valid payment statuses are used (Self-documenting schema)
-- Removing existing check if it exists or just adding it.
-- ALTER TABLE public.bookings 
--   ADD CONSTRAINT check_payment_status 
--   CHECK (payment_status IN ('pending_payment', 'pending_verification', 'confirmed', 'rejected', 'cancelled', 'pending', 'paid', 'failed'));
