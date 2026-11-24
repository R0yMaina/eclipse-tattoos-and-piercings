import { isBookingUploadAuthorized, isValidClientToken } from "./auth.ts";

const clientToken = "a".repeat(64);
const pendingBooking = {
  client_token: clientToken,
  status: "pending_payment",
  payment_status: "pending_payment",
};

Deno.test("matching client token authorizes an active booking upload", () => {
  if (!isBookingUploadAuthorized(pendingBooking, clientToken)) {
    throw new Error("Matching client token should authorize an active booking");
  }
});

Deno.test("a different client token cannot authorize an upload", () => {
  if (isBookingUploadAuthorized(pendingBooking, "b".repeat(64))) {
    throw new Error("A different client token must be rejected");
  }
});

Deno.test("completed bookings cannot accept uploads", () => {
  if (isBookingUploadAuthorized({ ...pendingBooking, status: "completed" }, clientToken)) {
    throw new Error("Completed bookings must reject uploads");
  }
});

Deno.test("paid bookings cannot accept uploads", () => {
  if (isBookingUploadAuthorized({ ...pendingBooking, payment_status: "paid" }, clientToken)) {
    throw new Error("Paid bookings must reject uploads");
  }
});

Deno.test("malformed client tokens are rejected", () => {
  if (isValidClientToken("not-a-client-token")) {
    throw new Error("Malformed client tokens must be rejected");
  }
});