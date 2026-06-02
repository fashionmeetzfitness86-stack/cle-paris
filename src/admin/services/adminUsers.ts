import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockAdminUsers } from "../mockData";
import type { AdminUser } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listAdminUsers(): R<AdminUser[]> {
  if (!isSupabaseConfigured()) return { data: mockAdminUsers, error: null };
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at");
  return { data: data as AdminUser[] | null, error };
}

export async function upsertAdminUser(
  user: Partial<AdminUser> & { email: string; name: string; role: "admin" | "editor" }
): R<AdminUser> {
  if (!isSupabaseConfigured()) {
    return {
      data: {
        id: `admin-${Date.now()}`,
        last_login: null,
        created_at: new Date().toISOString(),
        ...user,
      } as AdminUser,
      error: null,
    };
  }
  const isNew = !user.id;
  const payload = { name: user.name, email: user.email, role: user.role };
  const query = isNew
    ? supabase.from("admin_users").insert(payload).select().single()
    : supabase
        .from("admin_users")
        .update(payload)
        .eq("id", user.id!)
        .select()
        .single();
  const { data, error } = await query;
  if (!error)
    await logActivity(isNew ? "create" : "update", "admin_user", (data as AdminUser)?.id, {
      email: user.email,
      role: user.role,
    });
  return { data: data as AdminUser | null, error };
}

export async function deleteAdminUser(id: string): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (!error) await logActivity("delete", "admin_user", id);
  return { data: null, error };
}

export async function updateLastLogin(authUserId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase
    .from("admin_users")
    .update({ last_login: new Date().toISOString() })
    .eq("auth_user_id", authUserId);
}
