import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockTestimonials } from "../mockData";
import type { Testimonial } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listTestimonials(): R<Testimonial[]> {
  if (!isSupabaseConfigured()) return { data: mockTestimonials, error: null };
  const { data, error } = await supabase.from("testimonials").select("*");
  return { data: data as Testimonial[] | null, error };
}

export async function upsertTestimonial(
  t: Omit<Testimonial, "id"> & { id?: string }
): R<Testimonial> {
  if (!isSupabaseConfigured()) {
    return { data: { id: `test-${Date.now()}`, ...t }, error: null };
  }
  const isNew = !t.id;
  const query = isNew
    ? supabase.from("testimonials").insert(t).select().single()
    : supabase.from("testimonials").update(t).eq("id", t.id!).select().single();
  const { data, error } = await query;
  if (!error) await logActivity(isNew ? "create" : "update", "testimonial", (data as Testimonial)?.id);
  return { data: data as Testimonial | null, error };
}

export async function deleteTestimonial(id: string): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (!error) await logActivity("delete", "testimonial", id);
  return { data: null, error };
}
