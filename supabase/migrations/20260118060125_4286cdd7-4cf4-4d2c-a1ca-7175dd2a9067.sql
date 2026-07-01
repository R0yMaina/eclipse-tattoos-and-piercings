-- Drop the unique constraint on slot_number to allow same slot number for different days
ALTER TABLE public.slot_configuration DROP CONSTRAINT IF EXISTS slot_configuration_slot_number_key;

-- Add day_of_week column to slot_configuration for day-specific slots
ALTER TABLE public.slot_configuration 
ADD COLUMN IF NOT EXISTS day_of_week integer NOT NULL DEFAULT 1;

-- Add duration column for fixed 1-hour slots
ALTER TABLE public.slot_configuration 
ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 60;

-- Add composite unique constraint for slot_number + day_of_week
ALTER TABLE public.slot_configuration 
ADD CONSTRAINT slot_configuration_slot_day_unique UNIQUE (slot_number, day_of_week);

-- Delete old slot configuration
DELETE FROM public.slot_configuration;

-- Monday to Friday slots (10:00 AM - 8:00 PM, 1-hour slots = 10 slots)
INSERT INTO public.slot_configuration (slot_number, start_time, end_time, is_active, day_of_week, duration_minutes) VALUES
-- Monday (day 1)
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
-- Tuesday (day 2)
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
-- Wednesday (day 3)
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
-- Thursday (day 4)
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
-- Friday (day 5)
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
-- Saturday (day 6): 11:00 AM - 7:00 PM = 8 slots
(1, '11:00', '12:00', true, 6, 60),
(2, '12:00', '13:00', true, 6, 60),
(3, '13:00', '14:00', true, 6, 60),
(4, '14:00', '15:00', true, 6, 60),
(5, '15:00', '16:00', true, 6, 60),
(6, '16:00', '17:00', true, 6, 60),
(7, '17:00', '18:00', true, 6, 60),
(8, '18:00', '19:00', true, 6, 60);

-- Update the generate_slots_for_date function to use day_of_week
CREATE OR REPLACE FUNCTION public.generate_slots_for_date(target_date date)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  target_day_of_week integer;
BEGIN
  -- Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  target_day_of_week := EXTRACT(DOW FROM target_date)::integer;
  
  -- Don't generate slots for Sunday (day 0)
  IF target_day_of_week = 0 THEN
    RETURN;
  END IF;
  
  -- Insert slots for this date if they don't exist
  INSERT INTO public.booking_slots (slot_date, slot_number, start_time, end_time)
  SELECT 
    target_date,
    sc.slot_number,
    sc.start_time,
    sc.end_time
  FROM public.slot_configuration sc
  WHERE sc.is_active = true
    AND sc.day_of_week = target_day_of_week
    AND NOT EXISTS (
      SELECT 1 FROM public.booking_slots bs 
      WHERE bs.slot_date = target_date 
        AND bs.slot_number = sc.slot_number
    );
END;
$$;