// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Normalize Kenyan numbers to E.164 without leading +
function normalizePhone(raw: string): string {
  let p = (raw || "").replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (p.startsWith("7") || p.startsWith("1")) p = "254" + p;
  return p;
}

function buildMessage(type: string, data: Record<string, any>): string {
  const name = data.clientName || "there";
  switch (type) {
    case "booking_created":
      return `Hi ${name}! 🎉 Your booking with Eclipse Tattoos & Piercings is received.\n\nDate: ${data.date ?? "TBD"}\nTime: ${data.time ?? "TBD"}\nDeposit due: KES ${data.depositAmount ?? ""}\n\nPlease complete your 15% deposit within 24 hours to confirm your slot. Reply here if you have questions.`;
    case "confirmation":
      return `Hi ${name}! ✅ Your booking is confirmed.\n\nDate: ${data.date ?? ""}\nTime: ${data.time ?? ""}\n${data.depositAmount ? `Payment: ${data.depositAmount}\n` : ""}\nSee you soon at Eclipse Tattoos & Piercings!`;
    case "cancellation":
      return `Hi ${name}, your booking has been cancelled. ${data.reason ?? ""}\n\nFeel free to rebook anytime at Eclipse Tattoos & Piercings.`;
    default:
      return data.message || `Hello from Eclipse Tattoos & Piercings.`;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    if (!accessToken || !phoneNumberId) {
      console.error("Missing WhatsApp credentials");
      return new Response(JSON.stringify({ error: "WhatsApp not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { type, phoneNumber, ...data } = body;
    if (!phoneNumber) {
      return new Response(JSON.stringify({ error: "phoneNumber required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const to = normalizePhone(phoneNumber);
    const text = buildMessage(type, data);

    console.log(`Sending WhatsApp [${type}] to ${to}`);

    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("WhatsApp API error:", JSON.stringify(result));
      return new Response(JSON.stringify({ error: result }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("WhatsApp sent:", result?.messages?.[0]?.id);
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("send-whatsapp error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
