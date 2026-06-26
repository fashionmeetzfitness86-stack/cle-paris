/**
 * POST /.netlify/functions/admin-invite
 *
 * Creates a real Supabase Auth login for a new admin and links it to
 * an admin_users row. Browsers cannot call supabase.auth.admin.*
 * (it needs the service-role key), so this runs server-side.
 *
 * AUTHZ: the caller must send their own Supabase access token as a
 * Bearer header; we verify that token belongs to an existing admin
 * before doing anything. Without this check the endpoint would be an
 * open admin-creation backdoor.
 *
 * Body: { email, name, role: 'admin' | 'editor' }
 * Header: Authorization: Bearer <caller access_token>
 *
 * Required env (Netlify):
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VITE_SITE_URL (used for CORS origin validation)
 */
import { createClient } from "@supabase/supabase-js";
import { requireOrigin, corsHeaders } from "./_cors.js";

const json = (status: number, body: unknown, req: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  });

export default async (req: Request) => {
  // CORS preflight + origin guard
  const corsResponse = requireOrigin(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, req);

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return json(500, { error: "Not configured" }, req);

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "Missing authorization" }, req);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Resolve the caller from their token.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData.user) return json(401, { error: "Invalid session" }, req);

  // 2. Verify the caller is an admin.
  const { data: callerRow } = await admin
    .from("admin_users")
    .select("role")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();
  if (!callerRow || callerRow.role !== "admin") {
    return json(403, { error: "Admin access required" }, req);
  }

  // 3. Validate body.
  let body: { email?: string; name?: string; role?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json(400, { error: "Invalid body" }, req);
  }
  const email = (body.email || "").trim().toLowerCase();
  const name = (body.name || "").trim();
  const role = body.role === "admin" ? "admin" : "editor";
  if (!email) return json(400, { error: "Email is required" }, req);

  // 4. Invite the auth user.
  //    On "user already exists" errors, look up the existing user directly by email
  //    using getUserByEmail (O(1), does not enumerate all users).
  let authUserId: string | null = null;
  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email);

  if (inviteErr) {
    // Check if this is an "already exists" error — use direct lookup, not listUsers()
    const { data: existingUser, error: lookupErr } =
      await admin.auth.admin.getUserByEmail(email);

    if (lookupErr || !existingUser?.user) {
      // Could not find the user — surface the original invite error
      return json(500, { error: inviteErr.message }, req);
    }
    authUserId = existingUser.user.id;
  } else {
    authUserId = invited.user?.id ?? null;
  }

  if (!authUserId) {
    return json(500, { error: "Could not resolve auth user ID" }, req);
  }

  // 5. Upsert the admin_users row linked to the auth user.
  const { data: row, error: upsertErr } = await admin
    .from("admin_users")
    .upsert(
      { auth_user_id: authUserId, email, name, role },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (upsertErr) return json(500, { error: upsertErr.message }, req);
  return json(200, { user: row }, req);
};
