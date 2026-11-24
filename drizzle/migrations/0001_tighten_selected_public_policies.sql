DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

DROP POLICY IF EXISTS "Anyone can view booking slots" ON public.booking_slots;

DROP POLICY IF EXISTS "Anyone can view slot configuration" ON public.slot_configuration;

DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;
CREATE POLICY "Anyone can create valid unapproved reviews"
  ON public.reviews
  FOR INSERT
  TO public
  WITH CHECK (
    rating BETWEEN 1 AND 5
    AND is_approved = false
    AND booking_id IS NULL
    AND review_text IS NOT NULL
    AND length(btrim(review_text)) BETWEEN 1 AND 1000
    AND (client_name IS NULL OR length(client_name) <= 100)
  );

DROP POLICY IF EXISTS "Service role can insert security events" ON public.security_events;
CREATE POLICY "Service role can insert security events"
  ON public.security_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view inspiration images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;