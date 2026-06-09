import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockI18nEntries } from "../mockData";
import type { I18nEntry } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listI18nEntries(): R<I18nEntry[]> {
  if (!isSupabaseConfigured()) return { data: mockI18nEntries, error: null };
  const { data, error } = await supabase
    .from("i18n_entries")
    .select("*")
    .order("namespace")
    .order("key");
  return { data: data as I18nEntry[] | null, error };
}

export async function updateI18nEntry(entry: I18nEntry): R<I18nEntry> {
  if (!isSupabaseConfigured()) return { data: entry, error: null };
  const { data, error } = await supabase
    .from("i18n_entries")
    .update({ value_fr: entry.value_fr, value_en: entry.value_en })
    .eq("id", entry.id)
    .select()
    .single();
  if (!error) await logActivity("update", "i18n_entry", entry.id, { key: entry.key });
  return { data: data as I18nEntry | null, error };
}

export async function bulkUpdateI18nEntries(entries: I18nEntry[]): Promise<{ error: PostgrestError | null }> {
  if (!isSupabaseConfigured()) return { error: null };
  for (const entry of entries) {
    const { error } = await supabase
      .from("i18n_entries")
      .update({ value_fr: entry.value_fr, value_en: entry.value_en })
      .eq("id", entry.id);
    if (error) return { error };
  }
  await logActivity("bulk_update", "i18n_entries", undefined, { count: entries.length });
  return { error: null };
}
