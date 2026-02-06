/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  type: 'confirmation' | 'reminder' | 'late_warning' | 'review_request';
  bookingId?: string;
  clientName: string;
  phoneNumber: string;
  date?: string;
  time?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const whatsappAccessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");

    if (!whatsappPhoneNumberId || !whatsappAccessToken) {
      console.log("WhatsApp credentials not configured, skipping message send");
      return new Response(
        JSON.stringify({ success: false, message: "WhatsApp not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: WhatsAppRequest = await req.json();

    console.log(`Sending ${body.type} message to ${body.phoneNumber}`);

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

    // Format phone number (remove non-digits, add country code if needed)
    let formattedPhone = body.phoneNumber.replace(/\D/g, '');
    if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
      formattedPhone = '1' + formattedPhone; // Add US country code
    }

    // Send via WhatsApp Business API
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
      JSON.stringify({ success: true, messageId: whatsappResult.messages?.[0]?.id }),
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
