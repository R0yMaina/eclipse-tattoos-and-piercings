-- Ensure slot configuration exists
INSERT INTO public.slot_configuration (slot_number, start_time, end_time, is_active, duration_minutes) VALUES
(1, '10:00', '11:00', true, 60),
(2, '11:00', '12:00', true, 60),
(3, '12:00', '13:00', true, 60),
(4, '13:00', '14:00', true, 60),
(5, '14:00', '15:00', true, 60),
(6, '15:00', '16:00', true, 60),
(7, '16:00', '17:00', true, 60),
(8, '17:00', '18:00', true, 60),
(9, '18:00', '19:00', true, 60),
(10, '19:00', '20:00', true, 60)
ON CONFLICT (slot_number) DO NOTHING;
