import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockCollections } from "../mockData";
import type { Collection } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listCollections(): R<Collection[]> {
  if (!isSupabaseConfigured()) return { data: mockCollections, error: null };
  const { data, error } = await supabase.from("collections").select("*").order("name_fr");
  return { data: data as Collection[] | null, error };
}

export async function upsertCollection(
  col: Omit<Collection, "id"> & { id?: string }
): R<Collection> {
  if (!isSupabaseConfigured()) {
    return { data: { id: `col-${Date.now()}`, ...col }, error: null };
  }
  const isNew = !col.id;
  const query = isNew
    ? supabase.from("collections").insert(col).select().single()
    : supabase.from("collections").update(col).eq("id", col.id!).select().single();
  const { data, error } = await query;
  if (!error) await logActivity(isNew ? "create" : "update", "collection", (data as Collection)?.id);
  return { data: data as Collection | null, error };
}

export async function deleteCollection(id: string): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (!error) await logActivity("delete", "collection", id);
  return { data: null, error };
}
