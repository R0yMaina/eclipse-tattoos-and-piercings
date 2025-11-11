import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  serviceType?: string;
  projectDetails?: string;
  preferredContact?: string;
  message: string;
  consent: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();
    
    console.log("Received contact form submission:", { 
      name: formData.name, 
      email: formData.email 
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store submission in database
    const { data: submission, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.serviceType,
        project_details: formData.projectDetails,
        preferred_contact: formData.preferredContact,
        message: formData.message,
        consent: formData.consent,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Failed to store submission: ${dbError.message}`);
    }

    console.log("Submission stored successfully:", submission.id);

    // Send email notification to studio
    const studioEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">New Contact Form Submission</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Contact Information</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
          ${formData.serviceType ? `<p><strong>Service Type:</strong> ${formData.serviceType}</p>` : ''}
          ${formData.preferredContact ? `<p><strong>Preferred Contact:</strong> ${formData.preferredContact}</p>` : ''}
        </div>
        ${formData.projectDetails ? `
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Project Details</h2>
            <p>${formData.projectDetails}</p>
          </div>
        ` : ''}
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Message</h2>
          <p>${formData.message}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Submission ID: ${submission.id}<br>
          Received: ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "Eclipse Tattoo <onboarding@resend.dev>",
      to: ["jamingtonbuluma17@gmail.com"],
      subject: `New Contact Form Submission from ${formData.name}`,
      html: studioEmailContent,
    });

    if (emailError) {
      console.error("Email sending error:", emailError);
      // Don't throw - we still stored it in DB
    } else {
      console.log("Email sent successfully");
    }

    // Send confirmation email to customer
    const customerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">Thank You for Contacting Eclipse Tattoo & Piercings</h1>
        <p style="font-size: 16px; line-height: 1.6;">Hi ${formData.name},</p>
        <p style="font-size: 16px; line-height: 1.6;">
          We've received your message and our team will get back to you as soon as possible.
        </p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Your Message</h2>
          <p>${formData.message}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">
          In the meantime, feel free to reach out to us at:<br>
          <strong>Phone:</strong> +254 705 025 961<br>
          <strong>Email:</strong> jamingtonbuluma17@gmail.com
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
          Best regards,<br>
          <strong>Eclipse Tattoo & Piercings</strong><br>
          <em>Perfection is the aim</em>
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "Eclipse Tattoo <onboarding@resend.dev>",
      to: [formData.email],
      subject: "We've received your message - Eclipse Tattoo & Piercings",
      html: customerEmailContent,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Form submitted successfully",
        submissionId: submission.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-contact-form function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to submit form" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
