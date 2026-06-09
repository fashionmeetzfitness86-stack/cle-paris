import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { PRODUCTS as LOCAL_PRODUCTS, getProductBySlug as getLocalBySlug } from "./products";
import type { Product, ProductColor, ProductVariant } from "../types";

type DbProduct = {
  slug: string;
  name: string;
  category: Product["category"];
  price_cents: number;
  currency: "EUR" | "USD";
  description_fr: string;
  description_en: string;
  material_fr: string;
  material_en: string;
  archived: boolean;
  display_order: number;
  product_variants: { color_id: string; size: string; stock: number }[];
  product_images: { url: string; position: number; alt: string | null }[];
};

type DbColor = { id: string; label_fr: string; label_en: string; hex: string };

async function loadColors(): Promise<Map<string, ProductColor>> {
  if (!supabase) return new Map();
  const { data, error } = await supabase.from("product_colors").select("*");
  if (error || !data) return new Map();
  const map = new Map<string, ProductColor>();
  (data as DbColor[]).forEach((c) =>
    map.set(c.id, { id: c.id, label: { fr: c.label_fr, en: c.label_en }, hex: c.hex }),
  );
  return map;
}

function rowToProduct(row: DbProduct, colorMap: Map<string, ProductColor>): Product {
  const usedColorIds = Array.from(new Set(row.product_variants.map((v) => v.color_id)));
  const colors = usedColorIds
    .map((id) => colorMap.get(id))
    .filter((c): c is ProductColor => Boolean(c));

  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price_cents / 100,
    currency: row.currency,
    description: { fr: row.description_fr, en: row.description_en },
    material: { fr: row.material_fr, en: row.material_en },
    colors,
    variants: row.product_variants.map(
      (v) => ({ size: v.size as ProductVariant["size"], colorId: v.color_id, stock: v.stock }),
    ),
    images: row.product_images
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((i) => i.url),
    archived: row.archived,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured() || !supabase) return LOCAL_PRODUCTS;

  try {
    const [colorMap, { data, error }] = await Promise.all([
      loadColors(),
      supabase
        .from("products")
        .select("*, product_variants(*), product_images(*)")
        .order("display_order"),
    ]);

    if (error || !data || data.length === 0) {
      if (error && import.meta.env.DEV) console.warn("[supabase] fetchProducts fallback:", error.message);
      return LOCAL_PRODUCTS;
    }

    return (data as DbProduct[]).map((row) => rowToProduct(row, colorMap));
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[supabase] fetchProducts threw, falling back:", e);
    return LOCAL_PRODUCTS;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  if (!isSupabaseConfigured() || !supabase) return getLocalBySlug(slug);

  try {
    const [colorMap, { data, error }] = await Promise.all([
      loadColors(),
      supabase
        .from("products")
        .select("*, product_variants(*), product_images(*)")
        .eq("slug", slug)
        .maybeSingle(),
    ]);

    if (error || !data) return getLocalBySlug(slug);
    return rowToProduct(data as DbProduct, colorMap);
  } catch {
    return getLocalBySlug(slug);
  }
}
