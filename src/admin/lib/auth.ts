import type { AuthError, Session, User } from "@supabase/supabase-js";
import supabase from "../../lib/supabase";

export type { Session, User };

// ─── Sign in ──────────────────────────────────────────────────
export async function signIn(
  email: string,
  password: string
): Promise<{ session: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { session: data.session, error };
}

// ─── Sign out ─────────────────────────────────────────────────
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ─── Get current session ──────────────────────────────────────
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Listen to auth state changes ─────────────────────────────
export function onAuthStateChange(
  callback: (session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}

// ─── Invite a new admin user ──────────────────────────────────
export async function inviteAdminUser(
  email: string
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.admin.inviteUserByEmail(email);
  return { error };
}
