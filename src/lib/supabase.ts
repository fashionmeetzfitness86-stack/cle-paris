import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const PLACEHOLDER_URL = "https://placeholder.supabase.co";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[CLÉ PARIS] Supabase environment variables are not set. " +
      "Copy .env.example to .env and fill in your credentials. " +
      "The app will run with static/mock data until connected."
  );
}

export const supabase = createClient(
  supabaseUrl || PLACEHOLDER_URL,
  supabaseAnonKey || "placeholder-anon-key"
);

/** Returns true only when real Supabase credentials are present */
export function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== PLACEHOLDER_URL
  );
}

/**
 * Mock mode = no Supabase AND a local dev build.
 * SECURITY: never true in a production build, so the credential-less
 * admin bypass can never ship. If a prod deploy is missing its env
 * vars, the admin simply cannot log in (fails closed) instead of
 * granting full access to anyone.
 */
export function isMockMode(): boolean {
  return !isSupabaseConfigured() && import.meta.env.DEV;
}

export default supabase;
