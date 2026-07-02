// One-shot owner provisioning: sets the initial password for the business owner
// account and (idempotently) ensures both owner emails have the admin role.
// Protected by an internal secret so it cannot be abused.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bootstrap-secret",
};

const OWNER_EMAILS = ["roymaina395@gmail.com", "jamingtonbuluma17@gmail.com"];
const OWNER_WITH_PASSWORD = "jamingtonbuluma17@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const provided = req.headers.get("x-bootstrap-secret") ?? "";
    const expected = Deno.env.get("BOOTSTRAP_SECRET") ?? "";
    if (!expected || provided !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const newPassword: string = body.password ?? "";
    if (!newPassword || newPassword.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const results: Record<string, unknown> = {};

    // Look up both owner user ids (paginating listUsers).
    const emailToId: Record<string, string> = {};
    let page = 1;
    while (page < 20) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      for (const u of data.users) {
        if (u.email && OWNER_EMAILS.includes(u.email.toLowerCase())) {
          emailToId[u.email.toLowerCase()] = u.id;
        }
      }
      if (data.users.length < 200) break;
      page += 1;
    }
    results.foundUsers = Object.keys(emailToId);

    // Set password for jamington + confirm his email if pending.
    const targetId = emailToId[OWNER_WITH_PASSWORD];
    if (targetId) {
      const { error: updErr } = await admin.auth.admin.updateUserById(targetId, {
        password: newPassword,
        email_confirm: true,
      });
      if (updErr) throw updErr;
      results.passwordSetFor = OWNER_WITH_PASSWORD;
    } else {
      results.passwordSetFor = null;
    }

    // Ensure admin role for every owner user we found.
    for (const [email, id] of Object.entries(emailToId)) {
      await admin
        .from("user_roles")
        .upsert({ user_id: id, role: "admin" }, { onConflict: "user_id" });
    }
    results.adminRolesEnsured = Object.keys(emailToId);

    return new Response(JSON.stringify({ ok: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
