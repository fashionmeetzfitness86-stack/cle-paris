import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockSeoSettings } from "../mockData";
import type { SeoSetting } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listSeoSettings(): R<SeoSetting[]> {
  if (!isSupabaseConfigured()) return { data: mockSeoSettings, error: null };
  const { data, error } = await supabase.from("seo_settings").select("*").order("page");
  return { data: data as SeoSetting[] | null, error };
}

export async function updateSeoSetting(setting: SeoSetting): R<SeoSetting> {
  if (!isSupabaseConfigured()) return { data: setting, error: null };
  const { data, error } = await supabase
    .from("seo_settings")
    .update(setting)
    .eq("id", setting.id)
    .select()
    .single();
  if (!error) await logActivity("update", "seo_setting", setting.id, { page: setting.page });
  return { data: data as SeoSetting | null, error };
}
