-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled', 'no_show');

-- Create booking slots table (15 slots per day with configurable times)
CREATE TABLE public.booking_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 15),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (slot_date, slot_number)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES public.booking_slots(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  inspiration_image_url TEXT,
  notes TEXT,
  status booking_status NOT NULL DEFAULT 'upcoming',
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  price_charged NUMERIC(10, 2),
  admin_notes TEXT,
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  late_warning_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message templates table
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_type TEXT NOT NULL UNIQUE,
  template_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  client_name TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create review queue table
CREATE TABLE public.review_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_phone TEXT NOT NULL,
  request_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);

-- Create slot configuration table for admin
CREATE TABLE public.slot_configuration (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_number INTEGER NOT NULL UNIQUE CHECK (slot_number >= 1 AND slot_number <= 15),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_configuration ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_slots (public read, admin write)
CREATE POLICY "Anyone can view booking slots"
  ON public.booking_slots FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage booking slots"
  ON public.booking_slots FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for bookings (public insert, admin manage)
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for message_templates (admin only)
CREATE POLICY "Admins can manage message templates"
  ON public.message_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for reviews (public read approved, admin manage)
CREATE POLICY "Anyone can view approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for review_queue (admin only)
CREATE POLICY "Admins can manage review queue"
  ON public.review_queue FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for slot_configuration (public read, admin write)
CREATE POLICY "Anyone can view slot configuration"
  ON public.slot_configuration FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage slot configuration"
  ON public.slot_configuration FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default message templates
INSERT INTO public.message_templates (template_type, template_content) VALUES
('confirmation', 'Hi {{client_name}}! Your appointment at Eclipse Tattoo & Piercings is confirmed for {{date}} at {{time}}. We look forward to seeing you! Reply CANCEL to cancel.'),
('reminder', 'Reminder: {{client_name}}, your appointment at Eclipse Tattoo & Piercings is coming up on {{date}} at {{time}}. Please arrive on time!'),
('late_warning', 'Hi {{client_name}}, we noticed you''re running late for your {{time}} appointment. Please let us know if you need to reschedule. Your slot may be released after 15 minutes.');

-- Insert default slot configuration (9 AM to 6 PM, 1 hour slots = 9 slots, we'll use configurable times)
INSERT INTO public.slot_configuration (slot_number, start_time, end_time) VALUES
(1, '09:00', '10:00'),
(2, '10:00', '11:00'),
(3, '11:00', '12:00'),
(4, '12:00', '13:00'),
(5, '13:00', '14:00'),
(6, '14:00', '15:00'),
(7, '15:00', '16:00'),
(8, '16:00', '17:00'),
(9, '17:00', '18:00'),
(10, '18:00', '19:00'),
(11, '19:00', '20:00'),
(12, '20:00', '21:00'),
(13, '21:00', '22:00'),
(14, '22:00', '23:00'),
(15, '23:00', '00:00');

-- Create function to generate slots for a date
CREATE OR REPLACE FUNCTION public.generate_slots_for_date(target_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO booking_slots (slot_date, start_time, end_time, slot_number)
  SELECT 
    target_date,
    sc.start_time,
    sc.end_time,
    sc.slot_number
  FROM slot_configuration sc
  WHERE sc.is_active = true
  ON CONFLICT (slot_date, slot_number) DO NOTHING;
END;
$$;

-- Create function to get slot availability for a date
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
    CASE WHEN b.id IS NOT NULL THEN b.client_name ELSE NULL END as client_name
  FROM booking_slots bs
  LEFT JOIN bookings b ON bs.id = b.slot_id AND b.status NOT IN ('cancelled', 'no_show')
  WHERE bs.slot_date = target_date
  ORDER BY bs.slot_number;
$$;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_slot_configuration_updated_at
  BEFORE UPDATE ON public.slot_configuration
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for inspiration images
INSERT INTO storage.buckets (id, name, public) VALUES ('inspiration-images', 'inspiration-images', true);

-- Storage policies for inspiration images
CREATE POLICY "Anyone can upload inspiration images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'inspiration-images');

CREATE POLICY "Anyone can view inspiration images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inspiration-images');

CREATE POLICY "Admins can delete inspiration images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'inspiration-images' AND has_role(auth.uid(), 'admin'));