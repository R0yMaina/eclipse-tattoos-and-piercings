-- Ensure slot configuration exists
INSERT INTO public.slot_configuration (slot_number, start_time, end_time, is_active) VALUES
(1, '09:00', '10:00', true),
(2, '10:00', '11:00', true),
(3, '11:00', '12:00', true),
(4, '12:00', '13:00', true),
(5, '13:00', '14:00', true),
(6, '14:00', '15:00', true),
(7, '15:00', '16:00', true),
(8, '16:00', '17:00', true),
(9, '17:00', '18:00', true),
(10, '18:00', '19:00', true),
(11, '19:00', '20:00', true),
(12, '20:00', '21:00', true),
(13, '21:00', '22:00', true),
(14, '22:00', '23:00', true),
(15, '23:00', '00:00', true)
ON CONFLICT (slot_number) DO NOTHING;
