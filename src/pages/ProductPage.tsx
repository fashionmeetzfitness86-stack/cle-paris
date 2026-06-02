import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProduct, useProducts } from "../hooks/useProducts";
import { useCart } from "../store/cart";
import type { Lang, ProductVariant } from "../types";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const { product, loading } = useProduct(slug);
  const { products: all } = useProducts();
  const add = useCart((s) => s.add);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState<ProductVariant["size"] | "">("");

  useEffect(() => {
    if (product && !selectedColor) setSelectedColor(product.colors[0]?.id ?? "");
  }, [product, selectedColor]);

  if (loading && !product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center text-xs uppercase tracking-widest text-stone-500">
        Chargement…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl">Produit introuvable</h1>
        <Link to="/collection" className="mt-6 inline-block text-xs uppercase tracking-widest text-stone-400 hover:text-white">
          ← Retour à la collection
        </Link>
      </div>
    );
  }

  const availableVariants = product.variants.filter((v) => v.colorId === selectedColor);
  const isInStock = (size: ProductVariant["size"]) =>
    availableVariants.find((v) => v.size === size && v.stock > 0);

  const handleAdd = () => {
    if (!selectedSize) return;
    add({ productSlug: product.slug, size: selectedSize, colorId: selectedColor, qty: 1 });
  };

  const related = all.filter((p) => !p.archived && p.slug !== product.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4">
          {product.images.map((src, idx) => (
            <img key={idx} src={src} alt={`${product.name} ${idx + 1}`} className="w-full bg-stone-950 object-cover" />
          ))}
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <div className="text-xs uppercase tracking-widest text-stone-500">
            CLÉ&nbsp;PARIS · 2026
          </div>
          <h1 className="mt-3 font-display text-4xl tracking-tight">{product.name}</h1>
          <div className="mt-2 text-lg text-stone-300">€{product.price.toFixed(2)}</div>
          <p className="mt-6 text-sm leading-relaxed text-stone-400">{product.description[lang]}</p>

          <div className="mt-10">
            <div className="text-xs uppercase tracking-widest text-stone-500">{t("product.color")}</div>
            <div className="mt-3 flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`flex items-center gap-2 border px-3 py-2 text-xs uppercase tracking-widest ${
                    selectedColor === c.id ? "border-bone" : "border-stone-700 text-stone-400"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full border border-stone-700" style={{ background: c.hex }} />
                  {c.label[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="text-xs uppercase tracking-widest text-stone-500">{t("product.size")}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from(new Set(product.variants.map((v) => v.size))).map((size) => {
                const inStock = isInStock(size);
                return (
                  <button
                    key={size}
                    disabled={!inStock}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] border px-3 py-2 text-xs uppercase tracking-widest ${
                      selectedSize === size
                        ? "border-bone bg-bone text-black"
                        : inStock
                          ? "border-stone-700 hover:border-bone"
                          : "border-stone-900 text-stone-700 line-through"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!selectedSize}
            className="mt-10 w-full bg-bone py-4 text-xs uppercase tracking-widest text-black disabled:opacity-40"
          >
            {t("product.addToCart")}
          </button>

          <div className="mt-8 space-y-3 border-t border-stone-900 pt-8 text-xs uppercase tracking-widest text-stone-500">
            <div>{t("product.shipping")}</div>
            <div>{product.material[lang]}</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-32 border-t border-stone-900 pt-16">
          <h2 className="font-display text-2xl tracking-tight">Autres pièces</h2>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link key={p.slug} to={`/product/${p.slug}`} className="group">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="aspect-[4/5] w-full bg-stone-950 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="mt-4 flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span>€{p.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
