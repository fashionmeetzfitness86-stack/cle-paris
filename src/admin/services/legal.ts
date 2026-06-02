import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockLegalPages } from "../mockData";
import type { LegalPage } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listLegalPages(): R<LegalPage[]> {
  if (!isSupabaseConfigured()) return { data: mockLegalPages, error: null };
  const { data, error } = await supabase.from("legal_pages").select("*").order("slug");
  return { data: data as LegalPage[] | null, error };
}

export async function updateLegalPage(page: LegalPage): R<LegalPage> {
  if (!isSupabaseConfigured()) return { data: page, error: null };
  const { data, error } = await supabase
    .from("legal_pages")
    .update(page)
    .eq("id", page.id)
    .select()
    .single();
  if (!error) await logActivity("update", "legal_page", page.id, { slug: page.slug });
  return { data: data as LegalPage | null, error };
}
