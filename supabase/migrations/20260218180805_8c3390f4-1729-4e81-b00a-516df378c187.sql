
-- Fix 1: Remove overly permissive bookings SELECT policy
DROP POLICY IF EXISTS "Anyone can view their booking by phone" ON public.bookings;

-- Fix 2: Make inspiration-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'inspiration-images';

-- Fix 3: Update storage policies - keep upload open (unauthenticated booking flow) but restrict viewing to admins
DROP POLICY IF EXISTS "Anyone can view inspiration images" ON storage.objects;
CREATE POLICY "Admins can view inspiration images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inspiration-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));
