import { corsHeaders } from "npm:@supabase/supabase-js@2.80.0/cors";
import { createClient } from "npm:@supabase/supabase-js@2.80.0";
import { isBookingUploadAuthorized, isValidClientToken } from "./auth.ts";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UploadKind = "inspiration" | "payment";

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sniffImage(bytes: Uint8Array): { contentType: string; extension: string } | null {
  const ascii = (offset: number, length: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + length));

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    ascii(1, 3) === "PNG" &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { contentType: "image/png", extension: "png" };
  }
  if (bytes.length >= 12 && (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a")) {
    return { contentType: "image/gif", extension: "gif" };
  }
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    return { contentType: "image/webp", extension: "webp" };
  }
  if (bytes.length >= 12 && ascii(4, 4) === "ftyp" && ["avif", "avis"].includes(ascii(8, 4))) {
    return { contentType: "image/avif", extension: "avif" };
  }

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { success: false, error: "Method not allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { success: false, error: "Upload service is unavailable" });
  }

  try {
    const form = await req.formData();
    const bookingId = form.get("booking_id");
    const clientToken = form.get("client_token");
    const uploadKind = form.get("upload_kind");
    const file = form.get("file");

    if (
      typeof bookingId !== "string" ||
      !UUID_PATTERN.test(bookingId) ||
      typeof clientToken !== "string" ||
      !isValidClientToken(clientToken) ||
      (uploadKind !== "inspiration" && uploadKind !== "payment") ||
      !(file instanceof File)
    ) {
      return jsonResponse(400, { success: false, error: "Invalid upload details" });
    }

    if (file.size < 1 || file.size > MAX_FILE_BYTES) {
      return jsonResponse(400, { success: false, error: "Images must be 5 MB or smaller" });
    }

    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const imageType = sniffImage(fileBytes);
    if (!imageType) {
      return jsonResponse(400, { success: false, error: "Use a JPEG, PNG, GIF, WebP, or AVIF image" });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, client_token, status, payment_status")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) {
      console.error("Booking lookup failed:", bookingError.message);
      return jsonResponse(500, { success: false, error: "Could not verify this booking" });
    }
    if (!isBookingUploadAuthorized(booking, clientToken)) {
      return jsonResponse(403, { success: false, error: "Booking token is invalid or booking is closed" });
    }

    const activeStatuses = ["pending_payment", "pending_verification"];
    const bucket = uploadKind === "inspiration" ? "inspiration-images" : "payment-screenshots";
    const objectPath = `${bookingId}/${uploadKind}.${imageType.extension}`;
    const uploadBody = new Blob([fileBytes], { type: imageType.contentType });
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, uploadBody, {
        contentType: imageType.contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Private booking upload failed:", uploadError.message);
      return jsonResponse(500, { success: false, error: "Could not save this image" });
    }

    const update = uploadKind === "inspiration"
      ? { inspiration_image_url: objectPath }
      : { payment_screenshot_url: objectPath };
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update(update)
      .eq("id", bookingId)
      .eq("client_token", clientToken)
      .in("status", activeStatuses)
      .in("payment_status", activeStatuses)
      .select("id")
      .maybeSingle();

    if (updateError || !updatedBooking) {
      if (updateError) console.error("Booking image link update failed:", updateError.message);
      return jsonResponse(409, { success: false, error: "This booking can no longer accept uploads" });
    }

    return jsonResponse(200, { success: true, path: objectPath });
  } catch (error) {
    console.error("Secure booking upload failed:", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse(400, { success: false, error: "Invalid upload request" });
  }
});