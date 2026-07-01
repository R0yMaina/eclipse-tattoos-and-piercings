
-- Add new booking statuses
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'pending_payment';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'pending_verification';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'confirmed';

-- Add unique constraint on transaction_code to prevent duplicates (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS bookings_transaction_code_unique ON public.bookings (transaction_code) WHERE transaction_code IS NOT NULL;
