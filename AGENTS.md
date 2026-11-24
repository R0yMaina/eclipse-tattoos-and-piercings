# Project Engineering Rules

- Store Lovable Cloud schema changes as additive, journaled Drizzle migrations; regenerate client database types after each schema change so application queries stay aligned.