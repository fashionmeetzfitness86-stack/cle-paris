import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockHomepageSections } from "../mockData";
import type { HomepageSection } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listHomepageSections(): R<HomepageSection[]> {
  if (!isSupabaseConfigured()) return { data: mockHomepageSections, error: null };
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .order("sort_order");
  return { data: data as HomepageSection[] | null, error };
}

export async function updateHomepageSection(section: HomepageSection): R<HomepageSection> {
  if (!isSupabaseConfigured()) return { data: section, error: null };
  const { data, error } = await supabase
    .from("homepage_sections")
    .update(section)
    .eq("id", section.id)
    .select()
    .single();
  if (!error) await logActivity("update", "homepage_section", section.id, { key: section.key });
  return { data: data as HomepageSection | null, error };
}

export async function reorderHomepageSections(
  orderedIds: string[]
): Promise<{ error: PostgrestError | null }> {
  if (!isSupabaseConfigured()) return { error: null };
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("homepage_sections")
      .update({ sort_order: i + 1 })
      .eq("id", orderedIds[i]);
    if (error) return { error };
  }
  await logActivity("reorder", "homepage_sections");
  return { error: null };
}
