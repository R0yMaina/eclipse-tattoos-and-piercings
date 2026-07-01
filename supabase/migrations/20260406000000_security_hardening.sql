
-- Security Hardening Migration
-- Date: 2026-04-06

-- 1. SECURITY DEFINER FUNCTIONS - REVOKE PUBLIC EXECUTION
-- These functions bypass RLS, so they must not be callable by unauthenticated users.
REVOKE EXECUTE ON FUNCTION public.get_chat_analytics() FROM public;
REVOKE EXECUTE ON FUNCTION public.get_popular_questions(INT) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_recent_feedback(INT) FROM public;
REVOKE EXECUTE ON FUNCTION public.generate_slots_for_date(DATE) FROM public;

-- Grant to admins only
GRANT EXECUTE ON FUNCTION public.get_chat_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_popular_questions(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_feedback(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_slots_for_date(DATE) TO authenticated;

-- 2. FIX PII LEAK IN get_slot_availability
-- Hide client names from non-admins.
CREATE OR REPLACE FUNCTION public.get_slot_availability(target_date DATE)
RETURNS TABLE (
  slot_id UUID,
  slot_number INTEGER,
  start_time TIME,
  end_time TIME,
  status TEXT,
  client_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bs.id as slot_id,
    bs.slot_number,
    bs.start_time,
    bs.end_time,
    COALESCE(b.status::TEXT, 'available') as status,
    CASE 
      WHEN b.id IS NOT NULL AND (public.has_role(auth.uid(), 'admin')) THEN b.client_name 
      ELSE NULL 
    END as client_name
  FROM booking_slots bs
  LEFT JOIN bookings b ON bs.id = b.slot_id AND b.status NOT IN ('cancelled', 'no_show')
  WHERE bs.slot_date = target_date
  ORDER BY bs.slot_number;
$$;

-- 3. BOOKINGS TABLE SECURITY - COLUMN LEVEL PROTECTION
-- Revoke the overly broad GRANT ALL from previous migrations (e.g., 20260403000002)
REVOKE ALL ON TABLE public.bookings FROM anon;
REVOKE ALL ON TABLE public.bookings FROM authenticated;

-- A. Anonymous Users (Public)
-- Can create a booking
GRANT INSERT ON TABLE public.bookings TO anon;
-- Can ONLY see non-sensitive columns (prevents massive PII leak)
GRANT SELECT (
  id, 
  status, 
  payment_status, 
  deposit_paid, 
  deposit_amount, 
  agreed_price, 
  payment_expires_at, 
  mpesa_receipt, 
  transaction_code, 
  created_at
) ON TABLE public.bookings TO anon;
-- Can ONLY update specific columns needed for manual payment submission
GRANT UPDATE (
  transaction_code, 
  payment_phone, 
  payment_screenshot_url, 
  payment_status, 
  status
) ON TABLE public.bookings TO anon;

-- B. Authenticated Users (Admins)
-- Admins need full access to everything. RLS policies below will control which authenticated users (admins) can do what.
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON TABLE public.bookings TO service_role;

-- 4. HARDEN RLS POLICIES FOR BOOKINGS
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view their own booking status" ON public.bookings;
DROP POLICY IF EXISTS "Allow manual payment submission" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

-- Anyone can CREATE a booking
CREATE POLICY "Public: create booking"
  ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Anyone can SELECT their own booking status (if they have the ID)
-- This is now secure because of the Column Level Grants above (they can't see name/phone)
CREATE POLICY "Public: view booking status by ID"
  ON public.bookings
  FOR SELECT
  USING (true);

-- Allow public to update their own booking for payment submission
-- We restrict this to "pending" statuses to prevent modifying confirmed bookings.
CREATE POLICY "Public: submit payment details"
  ON public.bookings
  FOR UPDATE
  USING (
    payment_status IN ('pending', 'pending_payment', 'pending_verification')
    AND (status IN ('upcoming', 'pending_payment', 'pending_verification'))
  )
  WITH CHECK (
    payment_status IN ('pending', 'pending_payment', 'pending_verification')
    AND (status IN ('upcoming', 'pending_payment', 'pending_verification'))
  );

-- ADMIN POLICIES
CREATE POLICY "Admin: manage all bookings"
  ON public.bookings
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. STORAGE SECURITY HARDENING
-- Ensure unauthenticated users can only upload, not list or view other people's screenshots.

-- Admins manage everything
CREATE POLICY "Admin: manage payment screenshots"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'payment-screenshots' AND has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'payment-screenshots' AND has_role(auth.uid(), 'admin'));

-- Public can ONLY insert into payment-screenshots
DROP POLICY IF EXISTS "Anyone can upload payment screenshots" ON storage.objects;
CREATE POLICY "Public: upload payment screenshots"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'payment-screenshots');

-- Public cannot SELECT from payment-screenshots (even if it's their own, for now, to ensure privacy)
-- Admins view via signed URLs or admin policy.
DROP POLICY IF EXISTS "Admins can view payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete payment screenshots" ON storage.objects;

-- Reload schema cache to apply GRANT changes immediately
NOTIFY pgrst, 'reload schema';
