/**
 * Wrap any async operation with exponential-backoff retries.
 * Use for non-critical requests (gallery, reviews, analytics).
 * Do NOT use for payment or booking creation — those need explicit user-facing errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; baseMs?: number; shouldRetry?: (err: unknown) => boolean } = {}
): Promise<T> {
  const { retries = 2, baseMs = 400, shouldRetry = () => true } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries || !shouldRetry(err)) break;
      const delay = baseMs * Math.pow(2, attempt) + Math.random() * 200;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
