# Project Engineering Rules

- Store Lovable Cloud schema changes as additive, journaled Drizzle migrations; regenerate client database types after each schema change so application queries stay aligned.
- Route anonymous booking-media uploads through an edge function that verifies the booking token before writing to private storage, so bucket writes stay restricted.