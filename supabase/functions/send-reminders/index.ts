/// <reference lib="deno.ns" />
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
  reminder_sent: boolean;
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

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Running reminder check at ${now.toISOString()}`);
    console.log(`Today: ${today}, Tomorrow: ${tomorrow}`);

    // Fetch upcoming bookings that need reminders (appointments tomorrow or later today)
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        client_name,
        phone_number,
        reminder_sent,
        late_warning_sent,
        status,
        booking_slots!inner (
          slot_date,
          start_time,
          end_time
        )
      `)
      .eq('status', 'upcoming')
      .eq('reminder_sent', false)
      .in('booking_slots.slot_date', [today, tomorrow]);

    if (fetchError) {
      console.error("Error fetching bookings:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${bookings?.length || 0} bookings needing reminders`);

    const results = {
      reminders_sent: 0,
      errors: [] as string[]
    };

    // Process each booking
    for (const booking of (bookings as unknown as Booking[]) || []) {
      try {
        const slot = booking.booking_slots[0];
        if (!slot) continue;
        const appointmentDate = new Date(`${slot.slot_date}T${slot.start_time}`);
        const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        console.log(`Booking ${booking.id}: ${hoursUntilAppointment.toFixed(1)} hours until appointment`);

        // Send reminder if appointment is within 24 hours but more than 1 hour away
        if (hoursUntilAppointment <= 24 && hoursUntilAppointment > 1) {
          // Format date and time for message
          const dateFormatted = new Date(slot.slot_date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          });

          const [hours, minutes] = slot.start_time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 || 12;
          const timeFormatted = `${displayHour}:${minutes} ${ampm}`;

          // Fetch reminder template
          const { data: template, error: templateError } = await supabase
            .from('message_templates')
            .select('template_content')
            .eq('template_type', 'reminder')
            .eq('is_active', true)
            .single();

          if (templateError) {
            console.error("Error fetching template:", templateError);
            results.errors.push(`Template error for ${booking.id}: ${templateError.message}`);
            continue;
          }

          // Replace placeholders
          const message = template.template_content
            .replace('{client_name}', booking.client_name)
            .replace('{date}', dateFormatted)
            .replace('{time}', timeFormatted);

          // Send WhatsApp message
          const whatsappPhoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
          const whatsappToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");

          if (whatsappPhoneId && whatsappToken) {
            // Format phone number
            const phone = booking.phone_number.replace(/[\s\-()]/g, '').replace(/^\+/, '');

            const whatsappResponse = await fetch(
              `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${whatsappToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: phone,
                  type: 'text',
                  text: { body: message }
                }),
              }
            );

            if (!whatsappResponse.ok) {
              const errorText = await whatsappResponse.text();
              console.error(`WhatsApp error for ${booking.id}:`, errorText);
              results.errors.push(`WhatsApp error for ${booking.id}: ${errorText}`);
            } else {
              console.log(`Reminder sent to ${booking.client_name}`);
            }
          } else {
            console.log(`WhatsApp not configured, would send: "${message}"`);
          }

          // Update booking to mark reminder as sent
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ reminder_sent: true })
            .eq('id', booking.id);

          if (updateError) {
            console.error(`Update error for ${booking.id}:`, updateError);
            results.errors.push(`Update error for ${booking.id}: ${updateError.message}`);
          } else {
            results.reminders_sent++;
          }
        }
      } catch (err: unknown) {
        console.error(`Error processing booking ${booking.id}:`, err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        results.errors.push(`Processing error for ${booking.id}: ${message}`);
      }
    }

    console.log(`Completed: ${results.reminders_sent} reminders sent, ${results.errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        processed_at: now.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-reminders function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
