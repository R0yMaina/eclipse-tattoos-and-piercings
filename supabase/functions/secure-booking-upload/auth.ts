const CLIENT_TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const ACTIVE_BOOKING_STATES = new Set(["pending_payment", "pending_verification"]);

export type BookingUploadAuthorizationRecord = {
  client_token: unknown;
  status: unknown;
  payment_status: unknown;
};

export function isValidClientToken(token: unknown): token is string {
  return typeof token === "string" && CLIENT_TOKEN_PATTERN.test(token);
}

export function isBookingUploadAuthorized(
  booking: BookingUploadAuthorizationRecord | null,
  suppliedToken: unknown,
): boolean {
  return Boolean(
    booking &&
    isValidClientToken(booking.client_token) &&
    isValidClientToken(suppliedToken) &&
    booking.client_token === suppliedToken &&
    typeof booking.status === "string" &&
    ACTIVE_BOOKING_STATES.has(booking.status) &&
    typeof booking.payment_status === "string" &&
    ACTIVE_BOOKING_STATES.has(booking.payment_status),
  );
}