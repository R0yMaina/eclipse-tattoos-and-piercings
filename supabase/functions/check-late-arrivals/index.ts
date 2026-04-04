// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingSlot {
  slot_date: string;
  start_time: string;
  end_time: string;
}

interface Booking {
  id: string;
  client_name: string;
  phone_number: string;
  late_warning_sent: boolean;
  status: string;
  booking_slots: BookingSlot[];
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time in EAT (East Africa Time, UTC+3)
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Calculate current time in HH:MM format (EAT is UTC+3)
    const eatOffset = 3 * 60; // 3 hours in minutes
    const eatTime = new Date(now.getTime() + (eatOffset * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
    const currentHour = eatTime.getHours().toString().padStart(2, '0');
    const currentMinute = eatTime.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMinute}`;

    console.log(`Checking late arrivals at ${now.toISOString()} (EAT: ${currentTimeStr})`);

    // Fetch today's bookings that are "upcoming" and haven't had late warning sent
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        client_name,
        phone_number,
        late_warning_sent,
        status,
        booking_slots!inner (
          slot_date,
          start_time,
          end_time
        )
      `)
      .eq('status', 'upcoming')
      .eq('late_warning_sent', false)
      .eq('booking_slots.slot_date', today);

    if (fetchError) {
      console.error("Error fetching bookings:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${bookings?.length || 0} upcoming bookings for today`);

    const results = {
      late_warnings_sent: 0,
      errors: [] as string[]
    };

    // Process each booking
    for (const booking of (bookings as unknown as Booking[]) || []) {
      try {
        const slot = booking.booking_slots[0];
        if (!slot) continue;

        // Parse start time and check if 15+ minutes have passed
        const [startHour, startMinute] = slot.start_time.split(':').map(Number);
        const [currentH, currentM] = [parseInt(currentHour), parseInt(currentMinute)];

        // Calculate minutes since appointment start
        const startTotalMinutes = startHour * 60 + startMinute;
        const currentTotalMinutes = currentH * 60 + currentM;
        const minutesLate = currentTotalMinutes - startTotalMinutes;

        console.log(`Booking ${booking.id}: Start ${slot.start_time}, Current ${currentTimeStr}, ${minutesLate} minutes since start`);

        // Send warning if 15-60 minutes late (don't spam after an hour)
        if (minutesLate >= 15 && minutesLate <= 60) {
          console.log(`Client ${booking.client_name} is ${minutesLate} minutes late - sending warning`);

          // Format time for message
          const displayHour = startHour % 12 || 12;
          const ampm = startHour >= 12 ? 'PM' : 'AM';
          const timeFormatted = `${displayHour}:${startMinute.toString().padStart(2, '0')} ${ampm}`;

          // Invoke send-whatsapp function for SMS/WhatsApp
          const { data: result, error: invokeError } = await supabase.functions.invoke('send-whatsapp', {
            body: {
              type: 'late_warning',
              bookingId: booking.id,
              clientName: booking.client_name,
              phoneNumber: booking.phone_number,
              time: timeFormatted,
            },
          });

          if (invokeError || (result && result.error)) {
            console.error(`Messaging error for ${booking.id}:`, invokeError || result.error);
            results.errors.push(`Messaging error for ${booking.id}: ${invokeError?.message || result?.error}`);
          } else {
            console.log(`Late warning sent to ${booking.client_name} via ${result.channel}`);
            results.late_warnings_sent++;
          }
        }
      } catch (err: unknown) {
        console.error(`Error processing booking ${booking.id}:`, err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        results.errors.push(`Processing error for ${booking.id}: ${message}`);
      }
    }

    console.log(`Completed: ${results.late_warnings_sent} late warnings sent, ${results.errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        checked_at: now.toISOString(),
        current_time_eat: currentTimeStr
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in check-late-arrivals function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
