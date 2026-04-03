INSERT INTO public.message_templates (template_type, template_content, is_active)
VALUES 
  ('payment_confirmed', 'Hi {{client_name}}! ✅ Your M-Pesa deposit for your appointment on {{date}} at {{time}} has been verified and your booking is now CONFIRMED. See you then! – Eclipse Tattoos & Piercings', true),
  ('payment_rejected', 'Hi {{client_name}}, ❌ Unfortunately we could not verify your M-Pesa deposit for your appointment on {{date}} at {{time}}. Please contact us or rebook. – Eclipse Tattoos & Piercings', true)
ON CONFLICT DO NOTHING;