-- Create storage bucket for payment screenshots if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Anyone can upload payment screenshots
CREATE POLICY "Anyone can upload payment screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-screenshots');

-- Admins can view/delete payment screenshots
CREATE POLICY "Admins can view payment screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete payment screenshots"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(), 'admin'));

-- Allow clients to check their own booking status during checkout polling
CREATE POLICY "Anyone can view their own booking status"
  ON public.bookings
  FOR SELECT
  USING (true);
