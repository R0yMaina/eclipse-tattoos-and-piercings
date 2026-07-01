// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

// Normalize Kenyan numbers to E.164 without leading +
function normalizePhone(raw: string): string {
  let p = (raw || "").replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (p.startsWith("7") || p.startsWith("1")) p = "254" + p;
  return p;
}

function templateFor(type: string, data: Record<string, any>) {
  const name = data.clientName || "Customer";
  switch (type) {
    case "booking_created":
      return {
        name: "booking_created",
        params: [name, data.date ?? "TBD", data.time ?? "TBD", String(data.depositAmount ?? "")],
      };
    case "confirmation":
      return {
        name: "booking_confirmed",
        params: [name, data.date ?? "", data.time ?? "", String(data.depositAmount ?? "Received")],
      };
    case "cancellation":
      return {
        name: "booking_cancelled",
        params: [name, data.reason ?? "Not specified"],
      };
    default:
      return null;
  }
}

function fallbackText(type: string, data: Record<string, any>): string {
  const name = data.clientName || "there";
  switch (type) {
    case "booking_created":
      return `Hi ${name}! 🎉 Your booking with Eclipse Tattoos & Piercings is received.\n\nDate: ${data.date ?? "TBD"}\nTime: ${data.time ?? "TBD"}\nDeposit due: KES ${data.depositAmount ?? ""}\n\nPlease complete your 30% deposit (Pochi la Biashara 0769138198) within 24 hours to confirm your slot.`;
    case "confirmation":
      return `Hi ${name}! ✅ Your booking is confirmed.\nDate: ${data.date ?? ""}\nTime: ${data.time ?? ""}\n${data.depositAmount ? `Payment: ${data.depositAmount}\n` : ""}See you soon at Eclipse Tattoos & Piercings!`;
    case "cancellation":
      return `Hi ${name}, your booking has been cancelled. ${data.reason ?? ""}\n\nFeel free to rebook anytime.`;
    default:
      return data.message || `Hello from Eclipse Tattoos & Piercings.`;
  }
}

async function sendWhatsApp(payload: Record<string, any>, phoneNumberId: string, accessToken: string) {
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

// Authorize either via x-internal-secret matching the service role key
// (used by other edge functions) or via a valid admin JWT.
async function isAuthorized(req: Request): Promise<boolean> {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const internalSecret = req.headers.get("x-internal-secret");
  if (internalSecret && serviceKey && internalSecret === serviceKey) return true;

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (token === serviceKey) return true;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const anon = createClient(supabaseUrl, anonKey);
    const { data: { user }, error } = await anon.auth.getUser(token);
    if (error || !user) return false;
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: role } = await admin
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();
    return !!role;
  } catch {
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!(await isAuthorized(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const lang = Deno.env.get("WHATSAPP_TEMPLATE_LANG") || "en";

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
    const tpl = templateFor(type, data);

    if (tpl) {
      const payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: tpl.name,
          language: { code: lang },
          components: tpl.params.length > 0 ? [{
            type: "body",
            parameters: tpl.params.map((v) => ({ type: "text", text: String(v) })),
          }] : [],
        },
      };
      console.log(`Sending WhatsApp template [${tpl.name}] to ${to}`);
      const r = await sendWhatsApp(payload, phoneNumberId, accessToken);
      if (r.ok) {
        return new Response(JSON.stringify({ success: true, mode: "template", result: r.json }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.warn(`Template ${tpl.name} failed (${r.status}), falling back to text`);
    }

    const textPayload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: fallbackText(type, data) },
    };
    const r = await sendWhatsApp(textPayload, phoneNumberId, accessToken);
    if (!r.ok) {
      return new Response(JSON.stringify({ error: r.json }), {
        status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true, mode: "text", result: r.json }), {
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
