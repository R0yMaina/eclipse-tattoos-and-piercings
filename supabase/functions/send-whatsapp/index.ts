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
      console.error("Neither WhatsApp nor Twilio configured.");
      return new Response(
        JSON.stringify({ success: false, error: "No messaging channel configured (WhatsApp/Twilio)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: WhatsAppRequest = await req.json();

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
      .replace(/\{client_name\}/g, body.clientName)
      .replace(/\{\{date\}\}/g, body.date || '')
      .replace(/\{date\}/g, body.date || '')
      .replace(/\{\{time\}\}/g, body.time || '')
      .replace(/\{time\}/g, body.time || '');

    // Format phone number
    let formattedPhone = body.phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.length === 9) {
      formattedPhone = '254' + formattedPhone;
    }

    let messageId: string | undefined;
    let channel: string = 'none';
    let whatsappFailed = false;

    // Try WhatsApp first
    if (hasWhatsApp) {
      try {
        console.log(`Attempting WhatsApp to ${formattedPhone}`);
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

        if (whatsappResponse.ok) {
          messageId = whatsappResult.messages?.[0]?.id;
          channel = 'whatsapp';
          console.log("WhatsApp sent successfully, messageId:", messageId);
        } else {
          console.error("WhatsApp API error, will try SMS fallback:", JSON.stringify(whatsappResult));
          whatsappFailed = true;
        }
      } catch (e) {
        console.error("WhatsApp request failed, will try SMS fallback:", e);
        whatsappFailed = true;
      }
    }

    // Fallback to Twilio SMS if WhatsApp wasn't available or failed
    if ((whatsappFailed || !hasWhatsApp) && hasTwilio) {
      console.log(`Sending SMS via Twilio to +${formattedPhone}`);
      const twilioFromNumber = Deno.env.get("TWILIO_FROM_NUMBER") || '+254700000000';

      const twilioParams = new URLSearchParams({
        To: `+${formattedPhone}`,
        From: twilioFromNumber,
        Body: message,
      });

      console.log(`Sending Twilio SMS via gateway. To: +${formattedPhone}, From: ${twilioFromNumber}`);
      
      const smsResponse = await fetch(`${TWILIO_GATEWAY_URL}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'X-Connection-Api-Key': twilioApiKey!,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: twilioParams,
      });

      const smsResult = await smsResponse.json();
      console.log("Twilio SMS response:", JSON.stringify(smsResult));

      if (!smsResponse.ok) {
        console.error("Twilio SMS error:", smsResult);
        throw new Error(`Twilio API error [${smsResponse.status}]. Content: "${message}". From: ${twilioFromNumber}. Error detail: ${JSON.stringify(smsResult)}`);
      }

      messageId = smsResult.sid;
      channel = 'sms';
    }

    // If neither channel worked
    if (channel === 'none') {
      throw new Error("All messaging channels failed");
    }

    // Update booking flags if applicable
    if (body.bookingId) {
      console.log(`Updating booking ${body.bookingId} tracking flags for type ${body.type}`);
      const updateField = (body.type === 'confirmation' || body.type === 'payment_confirmed')
        ? { confirmation_sent: true }
        : body.type === 'reminder'
          ? { reminder_sent: true }
          : body.type === 'late_warning'
            ? { late_warning_sent: true }
            : {};

      if (Object.keys(updateField).length > 0) {
        const { error: updateError } = await supabase
          .from('bookings')
          .update(updateField)
          .eq('id', body.bookingId);
        
        if (updateError) console.error("Error updating booking flags:", updateError);
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
