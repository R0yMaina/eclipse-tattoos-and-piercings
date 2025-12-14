-- Create security events table for monitoring
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  ip_address TEXT,
  user_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events"
ON public.security_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert (from edge functions)
CREATE POLICY "Service role can insert security events"
ON public.security_events
FOR INSERT
WITH CHECK (true);

-- Create index for efficient querying
CREATE INDEX idx_security_events_type_created ON public.security_events(event_type, created_at DESC);
CREATE INDEX idx_security_events_ip ON public.security_events(ip_address, created_at DESC);

-- Function to get security event summary for admin dashboard
CREATE OR REPLACE FUNCTION public.get_security_summary(hours_back integer DEFAULT 24)
RETURNS TABLE(
  event_type TEXT,
  severity TEXT,
  count BIGINT,
  unique_ips BIGINT,
  latest_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    event_type,
    severity,
    COUNT(*) as count,
    COUNT(DISTINCT ip_address) as unique_ips,
    MAX(created_at) as latest_at
  FROM security_events
  WHERE created_at >= now() - (hours_back || ' hours')::interval
  GROUP BY event_type, severity
  ORDER BY count DESC
$$;