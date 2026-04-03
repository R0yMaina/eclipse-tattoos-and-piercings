// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';

interface WhatsAppRequest {
  type: 'confirmation' | 'reminder' | 'late_warning' | 'review_request' | 'payment_confirmed' | 'payment_rejected';
  bookingId?: string;
  clientName: string;
  phoneNumber: string;
  date?: string;
  time?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const whatsappAccessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const twilioApiKey = Deno.env.get("TWILIO_API_KEY");

    const hasWhatsApp = !!(whatsappPhoneNumberId && whatsappAccessToken);
    const hasTwilio = !!(lovableApiKey && twilioApiKey);

    if (!hasWhatsApp && !hasTwilio) {
      console.log("Neither WhatsApp nor Twilio configured, skipping notification");
      return new Response(
        JSON.stringify({ success: false, message: "No messaging channel configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: WhatsAppRequest = await req.json();

    console.log(`Sending ${body.type} message to ${body.phoneNumber} via ${hasWhatsApp ? 'WhatsApp' : 'Twilio SMS'}`);

    // Get message template
    const { data: template } = await supabase
      .from('message_templates')
      .select('template_content, is_active')
      .eq('template_type', body.type)
      .single();

    if (!template || !template.is_active) {
      console.log(`Template ${body.type} not found or inactive`);
      return new Response(
        JSON.stringify({ success: false, message: "Template not active" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Replace placeholders
    const message = template.template_content
      .replace(/\{\{client_name\}\}/g, body.clientName)
      .replace(/\{\{date\}\}/g, body.date || '')
      .replace(/\{\{time\}\}/g, body.time || '');

    // Format phone number
    let formattedPhone = body.phoneNumber.replace(/\D/g, '');
    if (!formattedPhone.startsWith('254') && formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1); // Kenya country code
    }

    let messageId: string | undefined;
    let channel: string;

    if (hasWhatsApp) {
      // ── WhatsApp Business API ──
      channel = 'whatsapp';
      const whatsappResponse = await fetch(
        `https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'text',
            text: { body: message }
          }),
        }
      );

      const whatsappResult = await whatsappResponse.json();
      console.log("WhatsApp API response:", JSON.stringify(whatsappResult));

      if (!whatsappResponse.ok) {
        console.error("WhatsApp API error:", whatsappResult);
        throw new Error(whatsappResult.error?.message || "WhatsApp API error");
      }

      messageId = whatsappResult.messages?.[0]?.id;
    } else {
      // ── Twilio SMS Fallback ──
      channel = 'sms';
      const twilioFromNumber = Deno.env.get("TWILIO_FROM_NUMBER") || '+254700000000';

      const smsResponse = await fetch(`${TWILIO_GATEWAY_URL}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'X-Connection-Api-Key': twilioApiKey!,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `+${formattedPhone}`,
          From: twilioFromNumber,
          Body: message,
        }),
      });

      const smsResult = await smsResponse.json();
      console.log("Twilio SMS response:", JSON.stringify(smsResult));

      if (!smsResponse.ok) {
        console.error("Twilio SMS error:", smsResult);
        throw new Error(`Twilio API error [${smsResponse.status}]: ${JSON.stringify(smsResult)}`);
      }

      messageId = smsResult.sid;
    }

    // Update booking flags if applicable
    if (body.bookingId) {
      const updateField = body.type === 'confirmation'
        ? { confirmation_sent: true }
        : body.type === 'reminder'
          ? { reminder_sent: true }
          : body.type === 'late_warning'
            ? { late_warning_sent: true }
            : {};

      if (Object.keys(updateField).length > 0) {
        await supabase
          .from('bookings')
          .update(updateField)
          .eq('id', body.bookingId);
      }
    }

    return new Response(
      JSON.stringify({ success: true, messageId, channel }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-whatsapp function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
