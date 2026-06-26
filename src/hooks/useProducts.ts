import { useEffect, useMemo, useState } from "react";
import {
  fetchActiveProducts,
  fetchProductBySlug,
  fetchArchivedProducts,
} from "../lib/storefront";
import type { Product } from "../types";

/** All active products (Supabase, with static fallback baked into storefront.ts). */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setError(false);
    fetchActiveProducts()
      .then((p) => {
        if (!alive) return;
        setProducts(p);
        // If fetch returned empty AND Supabase is configured, treat as error
        if (p.length === 0) setError(false); // empty is valid (no products in DB)
      })
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { products, loading, error };
}

/** A single product by slug. */
export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchProductBySlug(slug)
      .then((p) => alive && setProduct(p))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  return { product, loading };
}

/** Archived products. */
export function useArchivedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchArchivedProducts()
      .then((p) => alive && setProducts(p))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { products, loading };
}

/**
 * Canonical size display order for the product page size picker.
 */
export const SIZE_ORDER: ReadonlyArray<string> = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * A slug → Product lookup map built from active products.
 * Used by the cart to resolve names/prices/images for cart line items.
 * Memoized so the Map is only rebuilt when products change.
 */
export function useProductMap() {
  const { products, loading } = useProducts();
  const map = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  return { map, loading };
}
