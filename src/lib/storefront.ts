/**
 * Storefront data bridge — async helpers that fetch from Supabase
 * and fall back to static data when Supabase is not configured.
 *
 * These functions return data in the SAME shape as src/data/products.ts
 * so existing storefront pages work without type changes.
 */
import supabase, { isSupabaseConfigured } from "./supabase";
import {
  PRODUCTS,
  getActiveProducts as staticGetActiveProducts,
  getProductBySlug as staticGetProductBySlug,
  getArchivedProducts as staticGetArchivedProducts,
} from "../data/products";
import type { Product } from "../types";

// ─── Products ─────────────────────────────────────────────────

/** Fetch all active products, with static fallback */
export async function fetchActiveProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return staticGetActiveProducts();

  try {
    // Fetch products with their colors, variants, media, and category slug
    const { data: dbProducts, error } = await supabase
      .from("products")
      .select("*, categories(slug), product_colors(*), product_variants(*), product_media(*)")
      .eq("is_archived", false)
      .order("sort_order");

    if (error || !dbProducts) return staticGetActiveProducts();

    return dbProducts.map(mapDbProductToStorefront).filter(Boolean) as Product[];
  } catch {
    return staticGetActiveProducts();
  }
}

/** Fetch a product by slug, with static fallback */
export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) return staticGetProductBySlug(slug);

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(slug), product_colors(*), product_variants(*), product_media(*)")
      .eq("slug", slug)
      .eq("is_archived", false)
      .single();

    if (error || !data) return staticGetProductBySlug(slug);

    return mapDbProductToStorefront(data) ?? staticGetProductBySlug(slug);
  } catch {
    return staticGetProductBySlug(slug);
  }
}

/** Map a Supabase DB product row (with nested joins) → storefront Product type */
function mapDbProductToStorefront(row: Record<string, unknown>): Product | null {
  try {
    const colors = ((row.product_colors as unknown[]) ?? []).map((c) => {
      const col = c as Record<string, unknown>;
      return {
        id: col.slug as string,
        label: { fr: col.label_fr as string, en: col.label_en as string },
        hex: col.hex as string,
      };
    });

    const variants = ((row.product_variants as unknown[]) ?? []).map((v) => {
      const vr = v as Record<string, unknown>;
      // Find matching color slug
      const colorSlug =
        ((row.product_colors as unknown[]) ?? []).find(
          (c) => (c as Record<string, unknown>).id === vr.color_id
        ) as Record<string, unknown> | undefined;

      return {
        size: vr.size as "XS" | "S" | "M" | "L" | "XL" | "XXL",
        colorId: colorSlug?.slug as string ?? (vr.color_id as string),
        stock: vr.stock as number,
      };
    });

    const images = ((row.product_media as unknown[]) ?? [])
      .sort((a, b) => {
        const aRow = a as Record<string, unknown>;
        const bRow = b as Record<string, unknown>;
        return (aRow.sort_order as number) - (bRow.sort_order as number);
      })
      .map((m) => (m as Record<string, unknown>).url as string);

    // Map category from joined categories.slug
    const categoryRow = row.categories as { slug: string } | null;
    const categorySlug = categoryRow?.slug ?? "";
    const categoryMap: Record<string, Product["category"]> = {
      hauts: "hoodie",
      bas: "pants",
      accessoires: "accessory",
    };
    const category: Product["category"] = categoryMap[categorySlug] ?? "tshirt";

    return {
      slug: row.slug as string,
      name: row.name as string,
      category,
      price: row.price as number,
      currency: "EUR",
      description: {
        fr: row.description_fr as string,
        en: row.description_en as string,
      },
      material: {
        fr: row.material_fr as string,
        en: row.material_en as string,
      },
      colors,
      variants,
      images: images.length > 0 ? images : ["/images/sweat2_flat.jpg"],
      archived: row.is_archived as boolean,
    };
  } catch {
    return null;
  }
}

// ─── Banner ───────────────────────────────────────────────────

export interface StorefrontBanner {
  message_fr: string;
  message_en: string;
  link: string;
  background_color: string;
  text_color: string;
}

export async function fetchActiveBanner(): Promise<StorefrontBanner | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase
      .from("banner")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .single();
    return data as StorefrontBanner | null;
  } catch {
    return null;
  }
}

// ─── Homepage sections ────────────────────────────────────────

export interface StorefrontSection {
  key: string;
  type: string;
  title_fr: string;
  title_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  body_fr: string;
  body_en: string;
  image: string;
  video_url: string;
  link: string;
  data?: Record<string, unknown>;
}

export async function fetchHomepageSections(): Promise<StorefrontSection[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order");
    return (data as StorefrontSection[]) ?? [];
  } catch {
    return [];
  }
}

// ─── Shipping settings ────────────────────────────────────────

export interface ShippingSettings {
  national_countries: string[];
  national_price: number;
  international_price: number;
  free_shipping_threshold: number | null;
}

const DEFAULT_SHIPPING: ShippingSettings = {
  national_countries: ["FR"],
  national_price: 0,
  international_price: 0,
  free_shipping_threshold: 150,
};

/** Fetch shipping settings (with sensible default fallback). */
export async function fetchShipping(): Promise<ShippingSettings> {
  if (!isSupabaseConfigured()) return DEFAULT_SHIPPING;
  try {
    const { data, error } = await supabase
      .from("shipping_settings")
      .select("national_countries, national_price, international_price, free_shipping_threshold")
      .limit(1)
      .single();
    if (error || !data) return DEFAULT_SHIPPING;
    return {
      national_countries: (data.national_countries as string[]) ?? ["FR"],
      national_price: Number(data.national_price) || 0,
      international_price: Number(data.international_price) || 0,
      free_shipping_threshold:
        data.free_shipping_threshold == null ? null : Number(data.free_shipping_threshold),
    };
  } catch {
    return DEFAULT_SHIPPING;
  }
}

/** Compute the shipping cost for a given subtotal + destination country. */
export function computeShipping(
  s: ShippingSettings,
  subtotal: number,
  country: string
): number {
  if (s.free_shipping_threshold != null && subtotal >= s.free_shipping_threshold) return 0;
  return s.national_countries.includes(country) ? s.national_price : s.international_price;
}

// ─── Legal Pages ──────────────────────────────────────────────

export interface StorefrontLegalPage {
  title_fr: string;
  title_en: string;
  body_fr: string;
  body_en: string;
}

export async function fetchLegalPage(slug: string): Promise<StorefrontLegalPage | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase
      .from("legal_pages")
      .select("title_fr, title_en, body_fr, body_en")
      .eq("slug", slug)
      .single();
    return data as StorefrontLegalPage | null;
  } catch {
    return null;
  }
}

// ─── Archived products ────────────────────────────────────────

export async function fetchArchivedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return staticGetArchivedProducts();
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(slug), product_colors(*), product_variants(*), product_media(*)")
      .eq("is_archived", true)
      .order("sort_order");
    if (error || !data) return staticGetArchivedProducts();
    return data.map(mapDbProductToStorefront).filter(Boolean) as Product[];
  } catch {
    return staticGetArchivedProducts();
  }
}

// Keep static PRODUCTS accessible as fallback count
export { PRODUCTS as STATIC_PRODUCTS };
