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

    const now = new Date().toISOString();

    console.log(`Checking for unpaid bookings to cancel at ${now}`);

    // Find bookings where payment is pending and expiry has passed
    const { data: expiredBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("id, client_name, phone_number, slot_id")
      .eq("payment_status", "pending")
      .eq("deposit_paid", false)
      .lt("payment_expires_at", now)
      .neq("status", "cancelled");

    if (fetchError) {
      console.error("Error fetching expired bookings:", fetchError);
      throw fetchError;
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      console.log("No unpaid bookings to cancel");
      return new Response(
        JSON.stringify({ success: true, cancelled: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${expiredBookings.length} unpaid booking(s) to cancel`);

    let cancelledCount = 0;

    for (const booking of expiredBookings) {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          payment_status: "expired",
          admin_notes: "Auto-cancelled: deposit not paid within 24 hours",
        })
        .eq("id", booking.id);

      if (updateError) {
        console.error(`Error cancelling booking ${booking.id}:`, updateError);
        continue;
      }

      cancelledCount++;
      console.log(`Cancelled booking ${booking.id} for client ${booking.client_name}`);

      // Optionally notify client via WhatsApp
      try {
        await supabase.functions.invoke("send-whatsapp", {
          body: {
            type: "cancellation",
            bookingId: booking.id,
            clientName: booking.client_name,
            phoneNumber: booking.phone_number,
            reason: "Deposit was not received within 24 hours. Please rebook and complete payment.",
          },
        });
      } catch (whatsappError) {
        console.error(`Failed to send cancellation notice for booking ${booking.id}:`, whatsappError);
      }
    }

    console.log(`Successfully cancelled ${cancelledCount} booking(s)`);

    return new Response(
      JSON.stringify({ success: true, cancelled: cancelledCount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in cancel-unpaid-bookings:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
