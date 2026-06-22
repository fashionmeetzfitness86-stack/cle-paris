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
 */
import { createClient } from "@supabase/supabase-js";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return json(500, { error: "Not configured" });

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "Missing authorization" });

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Resolve the caller from their token.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData.user) return json(401, { error: "Invalid session" });

  // 2. Verify the caller is an admin.
  const { data: callerRow } = await admin
    .from("admin_users")
    .select("role")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();
  if (!callerRow || callerRow.role !== "admin") {
    return json(403, { error: "Admin access required" });
  }

  // 3. Validate body.
  let body: { email?: string; name?: string; role?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json(400, { error: "Invalid body" });
  }
  const email = (body.email || "").trim().toLowerCase();
  const name = (body.name || "").trim();
  const role = body.role === "admin" ? "admin" : "editor";
  if (!email) return json(400, { error: "Email is required" });

  // 4. Invite the auth user (idempotent-ish: handle already-exists).
  let authUserId: string | null = null;
  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email);
  if (inviteErr) {
    // If the user already exists in auth, look them up and proceed to link.
    const { data: list } = await admin.auth.admin.listUsers();
    const found = (list?.users ?? []).find(
      (u: { id: string; email?: string }) => u.email?.toLowerCase() === email
    );
    if (!found) return json(500, { error: inviteErr.message });
    authUserId = found.id;
  } else {
    authUserId = invited.user?.id ?? null;
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

  if (upsertErr) return json(500, { error: upsertErr.message });
  return json(200, { user: row });
};
