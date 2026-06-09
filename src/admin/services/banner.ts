import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockBanner } from "../mockData";
import type { Banner } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function getBanner(): R<Banner> {
  if (!isSupabaseConfigured()) return { data: mockBanner, error: null };
  const { data, error } = await supabase
    .from("banner")
    .select("*")
    .limit(1)
    .single();
  return { data: data as Banner | null, error };
}

export async function updateBanner(banner: Banner): R<Banner> {
  if (!isSupabaseConfigured()) return { data: banner, error: null };
  const { data, error } = await supabase
    .from("banner")
    .update(banner)
    .eq("id", banner.id)
    .select()
    .single();
  if (!error) await logActivity("update", "banner", banner.id);
  return { data: data as Banner | null, error };
}
