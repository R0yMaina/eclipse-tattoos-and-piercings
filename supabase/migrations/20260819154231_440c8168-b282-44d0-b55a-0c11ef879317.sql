DROP POLICY IF EXISTS "Public Access" ON storage.objects;

CREATE TABLE public.daily_service_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  service_type text NOT NULL,
  client_name text NOT NULL,
  phone_number text,
  amount_paid numeric NOT NULL DEFAULT 0,
  payment_method text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_service_log TO authenticated;
GRANT ALL ON public.daily_service_log TO service_role;

ALTER TABLE public.daily_service_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage daily service log"
ON public.daily_service_log FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_daily_service_log_date ON public.daily_service_log (log_date DESC);

CREATE TRIGGER update_daily_service_log_updated_at
BEFORE UPDATE ON public.daily_service_log
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();