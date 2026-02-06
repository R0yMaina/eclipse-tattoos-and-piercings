/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Zod schema for server-side validation
const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().max(20, "Phone must be less than 20 characters").optional().nullable(),
  serviceType: z.string().max(50, "Service type must be less than 50 characters").optional().nullable(),
  projectDetails: z.string().max(2000, "Project details must be less than 2000 characters").optional().nullable(),
  preferredContact: z.string().max(20, "Preferred contact must be less than 20 characters").optional().nullable(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
  consent: z.boolean().refine(val => val === true, "You must agree to be contacted"),
});

// HTML sanitization function to prevent XSS
function sanitizeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();

    // Validate input with zod
    const validationResult = contactFormSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.flatten());
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const formData = validationResult.data;

    console.log("Received valid contact form submission:", {
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

    // Sanitize all user inputs before including in email HTML
    const safeName = sanitizeHtml(formData.name);
    const safeEmail = sanitizeHtml(formData.email);
    const safePhone = sanitizeHtml(formData.phone);
    const safeServiceType = sanitizeHtml(formData.serviceType);
    const safePreferredContact = sanitizeHtml(formData.preferredContact);
    const safeProjectDetails = sanitizeHtml(formData.projectDetails);
    const safeMessage = sanitizeHtml(formData.message);

    // Send email notification to studio
    const studioEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">New Contact Form Submission</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Contact Information</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
          ${safeServiceType ? `<p><strong>Service Type:</strong> ${safeServiceType}</p>` : ''}
          ${safePreferredContact ? `<p><strong>Preferred Contact:</strong> ${safePreferredContact}</p>` : ''}
        </div>
        ${safeProjectDetails ? `
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Project Details</h2>
            <p>${safeProjectDetails}</p>
          </div>
        ` : ''}
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Message</h2>
          <p>${safeMessage}</p>
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
      subject: `New Contact Form Submission from ${safeName}`,
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
        <h1 style="color: #D4AF37;">Thank You for Contacting Eclipse Tattoo &amp; Piercings</h1>
        <p style="font-size: 16px; line-height: 1.6;">Hi ${safeName},</p>
        <p style="font-size: 16px; line-height: 1.6;">
          We've received your message and our team will get back to you as soon as possible.
        </p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Your Message</h2>
          <p>${safeMessage}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">
          In the meantime, feel free to reach out to us at:<br>
          <strong>Phone:</strong> +254 705 025 961<br>
          <strong>Email:</strong> jamingtonbuluma17@gmail.com
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
          Best regards,<br>
          <strong>Eclipse Tattoo &amp; Piercings</strong><br>
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit form";
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
