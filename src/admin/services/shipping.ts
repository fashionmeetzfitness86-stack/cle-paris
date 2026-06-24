import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { logActivity } from "./activity";

export interface ShippingSettings {
  id?: string;
  national_countries: string[];
  national_price: number;
  international_price: number;
  free_shipping_threshold: number | null;
}

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

const MOCK: ShippingSettings = {
  national_countries: ["FR"],
  national_price: 5,
  international_price: 15,
  free_shipping_threshold: 150,
};

export async function getShipping(): R<ShippingSettings> {
  if (!isSupabaseConfigured()) return { data: MOCK, error: null };
  const { data, error } = await supabase
    .from("shipping_settings")
    .select("id, national_countries, national_price, international_price, free_shipping_threshold")
    .limit(1)
    .single();
  return { data: data as ShippingSettings | null, error };
}

export async function updateShipping(s: ShippingSettings): R<ShippingSettings> {
  if (!isSupabaseConfigured()) return { data: { ...MOCK, ...s }, error: null };

  const payload = {
    national_countries: s.national_countries,
    national_price: s.national_price,
    international_price: s.international_price,
    free_shipping_threshold: s.free_shipping_threshold,
    updated_at: new Date().toISOString(),
  };

  // Single-row config: update the existing row, or insert if none exists.
  const { data: existing } = await supabase.from("shipping_settings").select("id").limit(1).single();
  const query = existing?.id
    ? supabase.from("shipping_settings").update(payload).eq("id", existing.id).select().single()
    : supabase.from("shipping_settings").insert(payload).select().single();

  const { data, error } = await query;
  if (!error) await logActivity("update", "shipping_settings", (data as ShippingSettings)?.id);
  return { data: data as ShippingSettings | null, error };
}
