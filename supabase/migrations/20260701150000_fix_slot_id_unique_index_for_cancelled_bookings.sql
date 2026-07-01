-- Fix booking slot reuse for cancelled or no-show bookings
DROP INDEX IF EXISTS bookings_slot_id_unique;
CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_id_unique
  ON public.bookings (slot_id)
  WHERE slot_id IS NOT NULL
    AND status NOT IN ('cancelled', 'no_show');
