-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policy: Users can view their own role
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policy: Only admins can insert/update/delete roles
CREATE POLICY "Admins manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create function to get chat analytics
CREATE OR REPLACE FUNCTION public.get_chat_analytics()
RETURNS TABLE (
  total_sessions BIGINT,
  total_messages BIGINT,
  total_feedback BIGINT,
  avg_rating NUMERIC,
  sessions_today BIGINT,
  messages_today BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (SELECT COUNT(*) FROM chat_sessions) as total_sessions,
    (SELECT COUNT(*) FROM chat_messages) as total_messages,
    (SELECT COUNT(*) FROM message_feedback) as total_feedback,
    (SELECT ROUND(AVG(rating), 2) FROM message_feedback WHERE rating IS NOT NULL) as avg_rating,
    (SELECT COUNT(*) FROM chat_sessions WHERE created_at >= CURRENT_DATE) as sessions_today,
    (SELECT COUNT(*) FROM chat_messages WHERE created_at >= CURRENT_DATE) as messages_today
$$;

-- Create function to get popular questions
CREATE OR REPLACE FUNCTION public.get_popular_questions(limit_count INT DEFAULT 10)
RETURNS TABLE (
  question TEXT,
  count BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    content as question,
    COUNT(*) as count
  FROM chat_messages
  WHERE role = 'user'
    AND LENGTH(content) > 10
  GROUP BY content
  ORDER BY count DESC
  LIMIT limit_count
$$;

-- Create function to get recent feedback
CREATE OR REPLACE FUNCTION public.get_recent_feedback(limit_count INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  rating INT,
  comment TEXT,
  message_content TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mf.id,
    mf.rating,
    mf.comment,
    cm.content as message_content,
    mf.created_at
  FROM message_feedback mf
  LEFT JOIN chat_messages cm ON mf.message_id = cm.id
  ORDER BY mf.created_at DESC
  LIMIT limit_count
$$;

-- RLS policies for analytics functions
CREATE POLICY "Admins can view chat_messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view chat_sessions"
ON public.chat_sessions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view message_feedback"
ON public.message_feedback
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));