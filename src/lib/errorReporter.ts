import { supabase } from "@/integrations/supabase/client";

// Throttle: never send more than 5 errors per minute per session
const RECENT_ERRORS: number[] = [];
const MAX_PER_MINUTE = 5;
const seen = new Set<string>();

function shouldSend(signature: string): boolean {
  const now = Date.now();
  while (RECENT_ERRORS.length && now - RECENT_ERRORS[0] > 60_000) RECENT_ERRORS.shift();
  if (RECENT_ERRORS.length >= MAX_PER_MINUTE) return false;
  if (seen.has(signature)) return false;
  seen.add(signature);
  RECENT_ERRORS.push(now);
  return true;
}

export async function reportClientError(
  message: string,
  stack?: string,
  context?: Record<string, unknown>
): Promise<void> {
  try {
    const sig = `${message}::${(stack || "").slice(0, 200)}`;
    if (!shouldSend(sig)) return;

    await supabase.from("client_errors").insert([{
      message: String(message).slice(0, 2000),
      stack: stack ? String(stack).slice(0, 8000) : null,
      url: typeof window !== "undefined" ? window.location.href.slice(0, 500) : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      context: context ?? null,
    }]);
  } catch {
    // Never let error reporting itself throw
  }
}

export function installGlobalErrorHandlers() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (e) => {
    // Ignore ResizeObserver noise and benign script-load errors
    if (e.message?.includes("ResizeObserver")) return;
    reportClientError(e.message || "Unknown error", e.error?.stack, {
      type: "window.error",
      filename: e.filename,
      lineno: e.lineno,
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    const msg = reason?.message || String(reason);
    reportClientError(msg, reason?.stack, { type: "unhandledrejection" });
  });
}
