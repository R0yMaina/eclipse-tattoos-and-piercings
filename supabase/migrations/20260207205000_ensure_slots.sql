-- Ensure slot configuration exists
INSERT INTO public.slot_configuration (slot_number, start_time, end_time, is_active, duration_minutes) VALUES
(1, '09:00', '10:00', true, 60),
(2, '10:00', '11:00', true, 60),
(3, '11:00', '12:00', true, 60),
(4, '12:00', '13:00', true, 60),
(5, '13:00', '14:00', true, 60),
(6, '14:00', '15:00', true, 60),
(7, '15:00', '16:00', true, 60),
(8, '16:00', '17:00', true, 60),
(9, '17:00', '18:00', true, 60),
(10, '18:00', '19:00', true, 60),
(11, '19:00', '20:00', true, 60),
(12, '20:00', '21:00', true, 60),
(13, '21:00', '22:00', true, 60),
(14, '22:00', '23:00', true, 60),
(15, '23:00', '00:00', true, 60)
ON CONFLICT (slot_number) DO NOTHING;
