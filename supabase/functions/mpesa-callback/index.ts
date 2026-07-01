// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("M-Pesa callback received:", JSON.stringify(body));

    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      console.error("Invalid callback body - no stkCallback found");
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    console.log(`Callback for CheckoutRequestID: ${CheckoutRequestID}, ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}`);

    // Find the booking by checkout ID. Only accept callbacks for bookings that
    // are currently awaiting payment — this blocks forged/duplicate callbacks
    // from flipping an already-processed booking.
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, client_name, phone_number, slot_id, payment_status, deposit_paid")
      .eq("mpesa_checkout_id", CheckoutRequestID)
      .single();

    if (fetchError || !booking) {
      console.error("Booking not found for CheckoutRequestID:", CheckoutRequestID, fetchError);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (booking.deposit_paid || booking.payment_status === "paid" || booking.payment_status === "failed") {
      console.warn(`Ignoring duplicate/late callback for booking ${booking.id} (status=${booking.payment_status})`);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (ResultCode === 0) {
      // Payment successful
      let mpesaReceipt = "";

      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          if (item.Name === "MpesaReceiptNumber") {
            mpesaReceipt = item.Value;
          }
        }
      }

      console.log(`Payment successful for booking ${booking.id}. Receipt: ${mpesaReceipt}`);

      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          deposit_paid: true,
          payment_status: "paid",
          mpesa_receipt: mpesaReceipt,
          confirmation_sent: false,
        })
        .eq("id", booking.id);

      if (updateError) {
        console.error("Error updating booking after payment:", updateError);
      }

      // Send confirmation WhatsApp message
      try {
        // Get the slot details for the confirmation message
        const { data: slotData } = await supabase
          .from("booking_slots")
          .select("slot_date, start_time")
          .eq("id", booking.slot_id)
          .single();

        if (slotData) {
          await supabase.functions.invoke("send-whatsapp", {
            headers: { "x-internal-secret": supabaseServiceKey },
            body: {
              type: "confirmation",
              bookingId: booking.id,
              clientName: booking.client_name,
              phoneNumber: booking.phone_number,
              date: slotData.slot_date,
              time: slotData.start_time,
              depositAmount: mpesaReceipt ? `Receipt: ${mpesaReceipt}` : undefined,
            },
          });
          console.log("Confirmation message sent for booking:", booking.id);
        }
      } catch (whatsappError) {
        console.error("Failed to send WhatsApp confirmation:", whatsappError);
        // Don't fail the callback for WhatsApp errors
      }
    } else {
      // Payment failed or cancelled
      console.log(`Payment failed for booking ${booking.id}. ResultCode: ${ResultCode}`);

      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "failed",
        })
        .eq("id", booking.id);

      if (updateError) {
        console.error("Error updating booking after payment failure:", updateError);
      }
    }

    // Always respond with success to M-Pesa
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in mpesa-callback:", error);
    // Always respond with success to avoid M-Pesa retries
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
