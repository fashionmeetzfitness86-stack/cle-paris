import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockCategories } from "../mockData";
import type { Category } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listCategories(): R<Category[]> {
  if (!isSupabaseConfigured()) return { data: mockCategories, error: null };
  const { data, error } = await supabase.from("categories").select("*").order("name_fr");
  return { data: data as Category[] | null, error };
}

export async function upsertCategory(
  cat: Omit<Category, "id"> & { id?: string }
): R<Category> {
  if (!isSupabaseConfigured()) {
    const result: Category = { id: `cat-${Date.now()}`, ...cat };
    return { data: result, error: null };
  }
  const isNew = !cat.id;
  const payload = isNew
    ? { slug: cat.slug, name_fr: cat.name_fr, name_en: cat.name_en }
    : cat;
  const query = isNew
    ? supabase.from("categories").insert(payload).select().single()
    : supabase.from("categories").update(payload).eq("id", cat.id!).select().single();
  const { data, error } = await query;
  if (!error) await logActivity(isNew ? "create" : "update", "category", (data as Category)?.id);
  return { data: data as Category | null, error };
}

export async function deleteCategory(id: string): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (!error) await logActivity("delete", "category", id);
  return { data: null, error };
}
