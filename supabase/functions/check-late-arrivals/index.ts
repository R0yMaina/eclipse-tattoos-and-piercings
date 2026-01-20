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

          // Fetch late warning template
          const { data: template, error: templateError } = await supabase
            .from('message_templates')
            .select('template_content')
            .eq('template_type', 'late_warning')
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
            .replace('{time}', timeFormatted)
            .replace('{minutes_late}', minutesLate.toString());

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
              await whatsappResponse.text(); // Consume response
              console.log(`Late warning sent to ${booking.client_name}`);
            }
          } else {
            console.log(`WhatsApp not configured, would send: "${message}"`);
          }

          // Update booking to mark late warning as sent
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ late_warning_sent: true })
            .eq('id', booking.id);

          if (updateError) {
            console.error(`Update error for ${booking.id}:`, updateError);
            results.errors.push(`Update error for ${booking.id}: ${updateError.message}`);
          } else {
            results.late_warnings_sent++;
          }
        }
      } catch (err: any) {
        console.error(`Error processing booking ${booking.id}:`, err);
        results.errors.push(`Processing error for ${booking.id}: ${err.message}`);
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
  } catch (error: any) {
    console.error("Error in check-late-arrivals function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
