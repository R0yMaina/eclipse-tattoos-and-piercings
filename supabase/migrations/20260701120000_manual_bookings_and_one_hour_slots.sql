ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_source text NOT NULL DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'mpesa',
  ADD COLUMN IF NOT EXISTS service_type text,
  ADD COLUMN IF NOT EXISTS appointment_date date,
  ADD COLUMN IF NOT EXISTS appointment_time time without time zone,
  ADD COLUMN IF NOT EXISTS is_walk_in boolean NOT NULL DEFAULT false;

ALTER TABLE public.bookings
  ALTER COLUMN slot_id DROP NOT NULL;

UPDATE public.bookings
SET booking_source = COALESCE(NULLIF(booking_source, ''), 'online'),
    payment_method = COALESCE(NULLIF(payment_method, ''), 'mpesa')
WHERE booking_source IS NULL OR payment_method IS NULL;

UPDATE public.bookings b
SET appointment_date = bs.slot_date,
    appointment_time = bs.start_time
FROM public.booking_slots bs
WHERE b.slot_id = bs.id
  AND b.appointment_date IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_id_unique
ON public.bookings (slot_id)
WHERE slot_id IS NOT NULL;

DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR booking_source = 'online' OR booking_source IS NULL);

DELETE FROM public.slot_configuration;

INSERT INTO public.slot_configuration (slot_number, start_time, end_time, is_active, day_of_week, duration_minutes) VALUES
(1, '10:00', '11:00', true, 1, 60),
(2, '11:00', '12:00', true, 1, 60),
(3, '12:00', '13:00', true, 1, 60),
(4, '13:00', '14:00', true, 1, 60),
(5, '14:00', '15:00', true, 1, 60),
(6, '15:00', '16:00', true, 1, 60),
(7, '16:00', '17:00', true, 1, 60),
(8, '17:00', '18:00', true, 1, 60),
(9, '18:00', '19:00', true, 1, 60),
(10, '19:00', '20:00', true, 1, 60),
(1, '10:00', '11:00', true, 2, 60),
(2, '11:00', '12:00', true, 2, 60),
(3, '12:00', '13:00', true, 2, 60),
(4, '13:00', '14:00', true, 2, 60),
(5, '14:00', '15:00', true, 2, 60),
(6, '15:00', '16:00', true, 2, 60),
(7, '16:00', '17:00', true, 2, 60),
(8, '17:00', '18:00', true, 2, 60),
(9, '18:00', '19:00', true, 2, 60),
(10, '19:00', '20:00', true, 2, 60),
(1, '10:00', '11:00', true, 3, 60),
(2, '11:00', '12:00', true, 3, 60),
(3, '12:00', '13:00', true, 3, 60),
(4, '13:00', '14:00', true, 3, 60),
(5, '14:00', '15:00', true, 3, 60),
(6, '15:00', '16:00', true, 3, 60),
(7, '16:00', '17:00', true, 3, 60),
(8, '17:00', '18:00', true, 3, 60),
(9, '18:00', '19:00', true, 3, 60),
(10, '19:00', '20:00', true, 3, 60),
(1, '10:00', '11:00', true, 4, 60),
(2, '11:00', '12:00', true, 4, 60),
(3, '12:00', '13:00', true, 4, 60),
(4, '13:00', '14:00', true, 4, 60),
(5, '14:00', '15:00', true, 4, 60),
(6, '15:00', '16:00', true, 4, 60),
(7, '16:00', '17:00', true, 4, 60),
(8, '17:00', '18:00', true, 4, 60),
(9, '18:00', '19:00', true, 4, 60),
(10, '19:00', '20:00', true, 4, 60),
(1, '10:00', '11:00', true, 5, 60),
(2, '11:00', '12:00', true, 5, 60),
(3, '12:00', '13:00', true, 5, 60),
(4, '13:00', '14:00', true, 5, 60),
(5, '14:00', '15:00', true, 5, 60),
(6, '15:00', '16:00', true, 5, 60),
(7, '16:00', '17:00', true, 5, 60),
(8, '17:00', '18:00', true, 5, 60),
(9, '18:00', '19:00', true, 5, 60),
(10, '19:00', '20:00', true, 5, 60),
(1, '11:00', '12:00', true, 6, 60),
(2, '12:00', '13:00', true, 6, 60),
(3, '13:00', '14:00', true, 6, 60),
(4, '14:00', '15:00', true, 6, 60),
(5, '15:00', '16:00', true, 6, 60),
(6, '16:00', '17:00', true, 6, 60),
(7, '17:00', '18:00', true, 6, 60),
(8, '18:00', '19:00', true, 6, 60);

CREATE OR REPLACE FUNCTION public.generate_slots_for_date(target_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_day_of_week integer;
BEGIN
  target_day_of_week := EXTRACT(DOW FROM target_date)::integer;

  IF target_day_of_week = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.booking_slots (slot_date, slot_number, start_time, end_time)
  SELECT
    target_date,
    sc.slot_number,
    sc.start_time,
    sc.end_time
  FROM public.slot_configuration sc
  WHERE sc.is_active = true
    AND sc.day_of_week = target_day_of_week
  ON CONFLICT (slot_date, slot_number) DO UPDATE
    SET start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time;
END;
$$;
