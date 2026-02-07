/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const rawEnv = Deno.env.get("MPESA_ENVIRONMENT") || "";
const MPESA_ENV = rawEnv.trim().toLowerCase() || "production";
const IS_SANDBOX = MPESA_ENV === "sandbox";
console.log(`M-Pesa environment: "${MPESA_ENV}" (raw length: ${rawEnv.length}, IS_SANDBOX: ${IS_SANDBOX})`);

// M-Pesa Daraja API endpoints
const MPESA_AUTH_URL = IS_SANDBOX
  ? "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
  : "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

const MPESA_STK_URL = IS_SANDBOX
  ? "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
  : "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

async function getMpesaToken(): Promise<string> {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa credentials (MPESA_CONSUMER_KEY/SECRET) not configured");
  }

  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const response = await fetch(MPESA_AUTH_URL, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`M-Pesa auth failed (${MPESA_ENV}):`, errorText);
    throw new Error(`M-Pesa authentication failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle different formats
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("+254")) {
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned;
  }

  return cleaned;
}

function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingId, phoneNumber, agreedPrice } = await req.json();

    if (!bookingId || !phoneNumber || !agreedPrice) {
      return new Response(
        JSON.stringify({ error: "bookingId, phoneNumber, and agreedPrice are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const depositAmount = Math.ceil(agreedPrice * 0.15);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Check for shortcode in multiple possible env var names
    const shortcode = Deno.env.get("MPESA_SHORTCODE") || Deno.env.get("MPESA_BUSINESS_SHORTCODE");
    const passkey = Deno.env.get("MPESA_PASSKEY");

    if (!shortcode || !passkey) {
      console.error("Missing M-Pesa config: shortcode or passkey");
      throw new Error(`M-Pesa configuration error: ${!shortcode ? 'Shortcode' : 'Passkey'} is missing`);
    }

    const timestamp = generateTimestamp();
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Get callback URL
    const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-callback`;

    console.log(`Initiating STK push (${MPESA_ENV}) for booking ${bookingId}, amount: ${depositAmount} KES, phone: ${formattedPhone}`);

    // Get M-Pesa access token
    const token = await getMpesaToken();

    // Initiate STK Push
    const stkResponse = await fetch(MPESA_STK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: IS_SANDBOX ? "CustomerPayBillOnline" : "CustomerPayBillOnline", // Usually same for STK push
        Amount: depositAmount,
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: `Eclipse-${bookingId.substring(0, 8)}`,
        TransactionDesc: `Booking deposit for Eclipse Tattoo`,
      }),
    });

    const stkData = await stkResponse.json();
    console.log("STK Push response:", JSON.stringify(stkData));

    // M-Pesa response handling
    if (stkData.ResponseCode !== "0") {
      const errorMessage = stkData.errorMessage || stkData.ResponseDescription || "STK push failed";
      console.error(`M-Pesa error (Code ${stkData.ResponseCode}): ${errorMessage}`);
      throw new Error(`M-Pesa error: ${errorMessage} (Status: ${stkData.ResponseCode})`);
    }

    const checkoutRequestId = stkData.CheckoutRequestID;

    // Update booking with payment details
    const paymentExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        agreed_price: agreedPrice,
        deposit_amount: depositAmount,
        payment_status: "pending",
        mpesa_checkout_id: checkoutRequestId,
        payment_expires_at: paymentExpiresAt,
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      throw updateError;
    }

    console.log(`STK push initiated successfully. CheckoutRequestID: ${checkoutRequestId}`);

    return new Response(
      JSON.stringify({
        success: true,
        checkoutRequestId,
        depositAmount,
        message: "Please check your phone to complete the M-Pesa payment",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in mpesa-stk-push:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
