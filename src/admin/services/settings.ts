import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockStoreSettings } from "../mockData";
import type { StoreSetting } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listSettings(): R<StoreSetting[]> {
  if (!isSupabaseConfigured()) return { data: mockStoreSettings, error: null };
  const { data, error } = await supabase.from("store_settings").select("*").order("key");
  return { data: data as StoreSetting[] | null, error };
}

export async function updateSetting(setting: StoreSetting): R<StoreSetting> {
  if (!isSupabaseConfigured()) return { data: setting, error: null };
  const { data, error } = await supabase
    .from("store_settings")
    .update({ value: setting.value })
    .eq("key", setting.key)
    .select()
    .single();
  return { data: data as StoreSetting | null, error };
}

export async function bulkUpdateSettings(
  settings: StoreSetting[]
): Promise<{ error: PostgrestError | null }> {
  if (!isSupabaseConfigured()) return { error: null };
  for (const s of settings) {
    const { error } = await supabase
      .from("store_settings")
      .update({ value: s.value })
      .eq("key", s.key);
    if (error) return { error };
  }
  await logActivity("bulk_update", "store_settings");
  return { error: null };
}
