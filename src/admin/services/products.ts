import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockProducts, mockColors, mockVariants, mockProductMedia } from "../mockData";
import type { Product, ProductColor, ProductVariant, ProductMedia } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

// ─── Products ─────────────────────────────────────────────────
export async function listProducts(opts?: {
  from?: number;
  to?: number;
  search?: string;
}): R<Product[]> {
  if (!isSupabaseConfigured()) {
    let results = [...mockProducts];
    if (opts?.search) {
      const q = opts.search.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (opts?.from !== undefined && opts.to !== undefined) {
      results = results.slice(opts.from, opts.to + 1);
    }
    return { data: results, error: null };
  }
  let query = supabase.from("products").select("*").order("sort_order");
  if (opts?.search) query = query.ilike("name", `%${opts.search}%`);
  if (opts?.from !== undefined && opts.to !== undefined) {
    query = query.range(opts.from, opts.to);
  }
  const { data, error } = await query;
  return { data: data as Product[] | null, error };
}

export async function getProduct(id: string): R<Product> {
  if (!isSupabaseConfigured()) {
    return { data: mockProducts.find((p) => p.id === id) ?? null, error: null };
  }
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  return { data: data as Product | null, error };
}

export async function upsertProduct(
  product: Omit<Product, "id" | "created_at"> & { id?: string }
): R<Product> {
  if (!isSupabaseConfigured()) {
    return { data: { id: `prod-${Date.now()}`, created_at: new Date().toISOString(), ...product }, error: null };
  }
  const isNew = !product.id;
  const query = isNew
    ? supabase.from("products").insert(product).select().single()
    : supabase.from("products").update(product).eq("id", product.id!).select().single();
  const { data, error } = await query;
  if (!error) await logActivity(isNew ? "create" : "update", "product", (data as Product)?.id, { name: product.name });
  return { data: data as Product | null, error };
}

export async function deleteProduct(id: string): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (!error) await logActivity("delete", "product", id);
  return { data: null, error };
}

// ─── Product Colors ───────────────────────────────────────────
export async function listProductColors(productId: string): R<ProductColor[]> {
  if (!isSupabaseConfigured()) {
    return { data: mockColors.filter((c) => c.product_id === productId), error: null };
  }
  const { data, error } = await supabase
    .from("product_colors")
    .select("*")
    .eq("product_id", productId);
  return { data: data as ProductColor[] | null, error };
}

export async function upsertProductColor(color: Omit<ProductColor, "id"> & { id?: string }): R<ProductColor> {
  if (!isSupabaseConfigured()) {
    return { data: { id: `color-${Date.now()}`, ...color }, error: null };
  }
  const isNew = !color.id;
  const query = isNew
    ? supabase.from("product_colors").insert(color).select().single()
    : supabase.from("product_colors").update(color).eq("id", color.id!).select().single();
  const { data, error } = await query;
  return { data: data as ProductColor | null, error };
}

export async function deleteProductColor(id: string): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { error } = await supabase.from("product_colors").delete().eq("id", id);
  return { data: null, error };
}

// ─── Product Variants ─────────────────────────────────────────
export async function listProductVariants(productId: string): R<ProductVariant[]> {
  if (!isSupabaseConfigured()) {
    return { data: mockVariants.filter((v) => v.product_id === productId), error: null };
  }
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId);
  return { data: data as ProductVariant[] | null, error };
}

export async function upsertProductVariant(v: Omit<ProductVariant, "id"> & { id?: string }): R<ProductVariant> {
  if (!isSupabaseConfigured()) {
    return { data: { id: `var-${Date.now()}`, ...v }, error: null };
  }
  const isNew = !v.id;
  const query = isNew
    ? supabase.from("product_variants").insert(v).select().single()
    : supabase.from("product_variants").update(v).eq("id", v.id!).select().single();
  const { data, error } = await query;
  return { data: data as ProductVariant | null, error };
}

export async function replaceProductVariants(
  productId: string,
  colorId: string,
  variants: Omit<ProductVariant, "id">[]
): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  await supabase.from("product_variants").delete().eq("product_id", productId).eq("color_id", colorId);
  if (variants.length > 0) {
    const { error } = await supabase.from("product_variants").insert(variants);
    return { data: null, error };
  }
  return { data: null, error: null };
}

// ─── Product Media ────────────────────────────────────────────
export async function listProductMedia(productId: string): R<ProductMedia[]> {
  if (!isSupabaseConfigured()) {
    return { data: mockProductMedia.filter((m) => m.product_id === productId), error: null };
  }
  const { data, error } = await supabase
    .from("product_media")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");
  return { data: data as ProductMedia[] | null, error };
}

export async function insertProductMedia(item: Omit<ProductMedia, "id">): R<ProductMedia> {
  if (!isSupabaseConfigured()) {
    return { data: { id: `media-${Date.now()}`, ...item }, error: null };
  }
  const { data, error } = await supabase.from("product_media").insert(item).select().single();
  return { data: data as ProductMedia | null, error };
}

export async function deleteProductMedia(id: string): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { error } = await supabase.from("product_media").delete().eq("id", id);
  return { data: null, error };
}
