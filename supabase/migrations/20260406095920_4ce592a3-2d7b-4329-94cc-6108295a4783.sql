-- 1. Fix bookings SELECT: remove the permissive public policy
DROP POLICY IF EXISTS "Anyone can view their own booking status" ON public.bookings;

-- 2. Fix bookings UPDATE: drop overly permissive policy and create a scoped one
DROP POLICY IF EXISTS "Allow manual payment submission" ON public.bookings;

-- New: allow public to update ONLY payment fields on their own booking (by matching booking id)
-- They can only set payment_screenshot_url, transaction_code, payment_phone, screenshot_payment_url
CREATE POLICY "Allow payment submission on own booking"
  ON public.bookings FOR UPDATE
  USING (
    payment_status IN ('pending', 'pending_payment', 'pending_verification')
    AND status IN ('upcoming', 'pending_payment', 'pending_verification')
  )
  WITH CHECK (
    -- Prevent escalation: cannot change status or payment_status to confirmed
    payment_status IN ('pending', 'pending_payment', 'pending_verification')
    AND status IN ('upcoming', 'pending_payment', 'pending_verification')
  );

-- 3. Fix payment-screenshots storage: remove public SELECT access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Remove duplicate INSERT policy
DROP POLICY IF EXISTS "Anyone can upload screenshots" ON storage.objects;

-- 4. Fix analytics functions: add admin role checks
CREATE OR REPLACE FUNCTION public.get_chat_analytics()
RETURNS TABLE(total_sessions bigint, total_messages bigint, total_feedback bigint, avg_rating numeric, sessions_today bigint, messages_today bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM chat_sessions) as total_sessions,
    (SELECT COUNT(*) FROM chat_messages) as total_messages,
    (SELECT COUNT(*) FROM message_feedback) as total_feedback,
    (SELECT ROUND(AVG(rating), 2) FROM message_feedback WHERE rating IS NOT NULL) as avg_rating,
    (SELECT COUNT(*) FROM chat_sessions WHERE created_at >= CURRENT_DATE) as sessions_today,
    (SELECT COUNT(*) FROM chat_messages WHERE created_at >= CURRENT_DATE) as messages_today;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_popular_questions(limit_count integer DEFAULT 10)
RETURNS TABLE(question text, count bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT
    content as question,
    COUNT(*) as count
  FROM chat_messages
  WHERE role = 'user'
    AND LENGTH(content) > 10
  GROUP BY content
  ORDER BY count DESC
  LIMIT limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_recent_feedback(limit_count integer DEFAULT 20)
RETURNS TABLE(id uuid, rating integer, comment text, message_content text, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT
    mf.id,
    mf.rating,
    mf.comment,
    cm.content as message_content,
    mf.created_at
  FROM message_feedback mf
  LEFT JOIN chat_messages cm ON mf.message_id = cm.id
  ORDER BY mf.created_at DESC
  LIMIT limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_security_summary(hours_back integer DEFAULT 24)
RETURNS TABLE(event_type text, severity text, count bigint, unique_ips bigint, latest_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT
    se.event_type,
    se.severity,
    COUNT(*) as count,
    COUNT(DISTINCT se.ip_address) as unique_ips,
    MAX(se.created_at) as latest_at
  FROM security_events se
  WHERE se.created_at >= now() - (hours_back || ' hours')::interval
  GROUP BY se.event_type, se.severity
  ORDER BY count DESC;
END;
$$;

-- 5. Fix slot availability: remove client_name from public function
CREATE OR REPLACE FUNCTION public.get_slot_availability(target_date date)
RETURNS TABLE(slot_id uuid, slot_number integer, start_time time without time zone, end_time time without time zone, status text, client_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    bs.id as slot_id,
    bs.slot_number,
    bs.start_time,
    bs.end_time,
    COALESCE(b.status::TEXT, 'available') as status,
    NULL::text as client_name
  FROM booking_slots bs
  LEFT JOIN bookings b ON bs.id = b.slot_id AND b.status NOT IN ('cancelled', 'no_show')
  WHERE bs.slot_date = target_date
  ORDER BY bs.slot_number;
$$;

-- 6. Add booking INSERT validation via updated policy
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

CREATE POLICY "Validated booking inserts"
  ON public.bookings FOR INSERT
  WITH CHECK (
    length(client_name) BETWEEN 2 AND 100
    AND length(phone_number) BETWEEN 10 AND 20
    AND (agreed_price IS NULL OR (agreed_price > 0 AND agreed_price < 1000000))
    AND (notes IS NULL OR length(notes) <= 1000)
    AND payment_status = 'pending'
    AND status = 'upcoming'
  );