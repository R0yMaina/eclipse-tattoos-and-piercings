-- Drop the unique constraint on slot_number to allow same slot number for different days
ALTER TABLE public.slot_configuration DROP CONSTRAINT IF EXISTS slot_configuration_slot_number_key;

-- Add day_of_week column to slot_configuration for day-specific slots
ALTER TABLE public.slot_configuration 
ADD COLUMN IF NOT EXISTS day_of_week integer NOT NULL DEFAULT 1;

-- Add duration column for adjustable slot duration (30-45 mins)
ALTER TABLE public.slot_configuration 
ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 45;

-- Add composite unique constraint for slot_number + day_of_week
ALTER TABLE public.slot_configuration 
ADD CONSTRAINT slot_configuration_slot_day_unique UNIQUE (slot_number, day_of_week);

-- Delete old slot configuration
DELETE FROM public.slot_configuration;

-- Monday to Friday slots (10:00 AM - 6:30 PM, 45-min slots = 11 slots)
INSERT INTO public.slot_configuration (slot_number, start_time, end_time, is_active, day_of_week, duration_minutes) VALUES
-- Monday (day 1)
(1, '10:00', '10:45', true, 1, 45),
(2, '10:45', '11:30', true, 1, 45),
(3, '11:30', '12:15', true, 1, 45),
(4, '12:15', '13:00', true, 1, 45),
(5, '13:00', '13:45', true, 1, 45),
(6, '13:45', '14:30', true, 1, 45),
(7, '14:30', '15:15', true, 1, 45),
(8, '15:15', '16:00', true, 1, 45),
(9, '16:00', '16:45', true, 1, 45),
(10, '16:45', '17:30', true, 1, 45),
(11, '17:30', '18:15', true, 1, 45),
-- Tuesday (day 2)
(1, '10:00', '10:45', true, 2, 45),
(2, '10:45', '11:30', true, 2, 45),
(3, '11:30', '12:15', true, 2, 45),
(4, '12:15', '13:00', true, 2, 45),
(5, '13:00', '13:45', true, 2, 45),
(6, '13:45', '14:30', true, 2, 45),
(7, '14:30', '15:15', true, 2, 45),
(8, '15:15', '16:00', true, 2, 45),
(9, '16:00', '16:45', true, 2, 45),
(10, '16:45', '17:30', true, 2, 45),
(11, '17:30', '18:15', true, 2, 45),
-- Wednesday (day 3)
(1, '10:00', '10:45', true, 3, 45),
(2, '10:45', '11:30', true, 3, 45),
(3, '11:30', '12:15', true, 3, 45),
(4, '12:15', '13:00', true, 3, 45),
(5, '13:00', '13:45', true, 3, 45),
(6, '13:45', '14:30', true, 3, 45),
(7, '14:30', '15:15', true, 3, 45),
(8, '15:15', '16:00', true, 3, 45),
(9, '16:00', '16:45', true, 3, 45),
(10, '16:45', '17:30', true, 3, 45),
(11, '17:30', '18:15', true, 3, 45),
-- Thursday (day 4)
(1, '10:00', '10:45', true, 4, 45),
(2, '10:45', '11:30', true, 4, 45),
(3, '11:30', '12:15', true, 4, 45),
(4, '12:15', '13:00', true, 4, 45),
(5, '13:00', '13:45', true, 4, 45),
(6, '13:45', '14:30', true, 4, 45),
(7, '14:30', '15:15', true, 4, 45),
(8, '15:15', '16:00', true, 4, 45),
(9, '16:00', '16:45', true, 4, 45),
(10, '16:45', '17:30', true, 4, 45),
(11, '17:30', '18:15', true, 4, 45),
-- Friday (day 5)
(1, '10:00', '10:45', true, 5, 45),
(2, '10:45', '11:30', true, 5, 45),
(3, '11:30', '12:15', true, 5, 45),
(4, '12:15', '13:00', true, 5, 45),
(5, '13:00', '13:45', true, 5, 45),
(6, '13:45', '14:30', true, 5, 45),
(7, '14:30', '15:15', true, 5, 45),
(8, '15:15', '16:00', true, 5, 45),
(9, '16:00', '16:45', true, 5, 45),
(10, '16:45', '17:30', true, 5, 45),
(11, '17:30', '18:15', true, 5, 45),
-- Saturday (day 6): 11:00 AM - 5:30 PM = 9 slots
(1, '11:00', '11:45', true, 6, 45),
(2, '11:45', '12:30', true, 6, 45),
(3, '12:30', '13:15', true, 6, 45),
(4, '13:15', '14:00', true, 6, 45),
(5, '14:00', '14:45', true, 6, 45),
(6, '14:45', '15:30', true, 6, 45),
(7, '15:30', '16:15', true, 6, 45),
(8, '16:15', '17:00', true, 6, 45),
(9, '17:00', '17:45', true, 6, 45);

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