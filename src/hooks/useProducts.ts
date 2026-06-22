import { useEffect, useState } from "react";
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

  useEffect(() => {
    let alive = true;
    fetchActiveProducts()
      .then((p) => alive && setProducts(p))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { products, loading };
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
 * A slug → Product lookup map built from active products.
 * Used by the cart to resolve names/prices/images for cart line items.
 */
export function useProductMap() {
  const { products, loading } = useProducts();
  const map = new Map(products.map((p) => [p.slug, p]));
  return { map, loading };
}
