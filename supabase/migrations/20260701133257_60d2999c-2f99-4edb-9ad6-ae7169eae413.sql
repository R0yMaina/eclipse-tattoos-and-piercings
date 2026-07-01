
UPDATE public.slot_configuration
SET duration_minutes = 60,
    end_time = (start_time + interval '1 hour')::time;

UPDATE public.booking_slots
SET end_time = (start_time + interval '1 hour')::time
WHERE end_time <> (start_time + interval '1 hour')::time;
