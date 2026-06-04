import { supabase } from "@/integrations/supabase/client";

/**
 * Record an administrative action for accountability.
 * Call after a successful admin mutation (booking edit, payment verify,
 * gallery change, role change, etc.). Failures are swallowed — never block
 * the user action on audit logging.
 */
export async function logAdminAction(
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_audit_log").insert([{
      actor_user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details: details ?? null,
    }]);
  } catch (err) {
    console.warn("audit log failed", err);
  }
}
