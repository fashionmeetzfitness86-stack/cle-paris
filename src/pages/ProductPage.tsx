import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProductBySlug, getActiveProducts } from "../data/products";
import { useCart } from "../store/cart";
import type { Lang, ProductVariant } from "../types";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const product = getProductBySlug(slug);
  const add = useCart((s) => s.add);

  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.id ?? "");
  const [selectedSize, setSelectedSize] = useState<ProductVariant["size"] | "">("");
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F4EFE8]">
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h1 className="font-display text-3xl text-[#111]">Produit introuvable</h1>
          <Link
            to="/collection"
            className="mt-6 inline-block text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] hover:text-[#111] transition-colors"
          >
            ← Retour à la collection
          </Link>
        </div>
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

  const related = getActiveProducts().filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F4EFE8]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 md:grid-cols-2">
          {/* ── Image gallery ── */}
          <div>
            {/* Main image */}
            <div className="relative overflow-hidden bg-[#EFE7DD] shadow-[0_4px_30px_rgba(0,0,0,0.08)]">
              <img
                src={product.images[activeImage] ?? product.images[0]}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover transition-opacity duration-500"
              />
            </div>
            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {product.images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-16 w-12 flex-shrink-0 overflow-hidden border transition-all duration-300 ${
                      activeImage === idx ? "border-[#111]" : "border-black/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product details ── */}
          <div className="md:sticky md:top-24 md:self-start">
            <div className="text-[11px] uppercase tracking-[0.25em] text-[#C8A97E]">
              CLÉ&nbsp;PARIS · 2026
            </div>
            <h1 className="mt-3 font-display text-3xl font-light tracking-tight text-[#111] md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 text-xl font-medium text-[#3A3A3A]">
              €{product.price.toFixed(2)}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-[#6F6F6F]">
              {product.description[lang]}
            </p>

            {/* Color picker */}
            <div className="mt-10">
              <div className="text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F]">
                {t("product.color")}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className={`flex items-center gap-2 border px-3 py-2 text-[11px] uppercase tracking-wider transition-all duration-300 ${
                      selectedColor === c.id
                        ? "border-[#111] text-[#111]"
                        : "border-black/15 text-[#6F6F6F] hover:border-[#111]"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-black/15"
                      style={{ background: c.hex }}
                    />
                    {c.label[lang]}
                  </button>
                ))}
              </div>
            </div>

            {/* Size picker */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F]">
                  {t("product.size")}
                </div>
                <button className="text-[11px] text-[#C8A97E] underline underline-offset-2 hover:text-[#111] transition-colors">
                  Guide des tailles
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(new Set(product.variants.map((v) => v.size))).map((size) => {
                  const inStock = isInStock(size);
                  return (
                    <button
                      key={size}
                      disabled={!inStock}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] border px-3 py-2.5 text-[11px] uppercase tracking-widest transition-all duration-300 ${
                        selectedSize === size
                          ? "border-[#111] bg-[#111] text-[#FAF7F2]"
                          : inStock
                            ? "border-black/15 text-[#3A3A3A] hover:border-[#111]"
                            : "border-black/8 text-black/25 line-through cursor-not-allowed"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              disabled={!selectedSize}
              className="mt-10 w-full bg-[#111] py-4 text-[11px] uppercase tracking-[0.2em] text-[#FAF7F2] transition-colors duration-300 hover:bg-[#2C2825] disabled:opacity-40 light-sweep"
            >
              {t("product.addToCart")}
            </button>

            {/* Product details */}
            <div className="mt-8 space-y-3 border-t border-black/8 pt-8 text-[11px] uppercase tracking-[0.18em] text-[#6F6F6F]">
              <div>{t("product.shipping")}</div>
              <div>{product.material[lang]}</div>
            </div>
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mt-32 border-t border-black/8 pt-16">
            <h2 className="font-display text-2xl font-light tracking-tight text-[#111]">
              Autres pièces
            </h2>
            <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link key={p.slug} to={`/product/${p.slug}`} className="group">
                  <div className="overflow-hidden bg-[#EFE7DD] shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="font-medium text-[#111] group-hover:text-[#C8A97E] transition-colors">
                      {p.name}
                    </span>
                    <span className="text-[#3A3A3A]">€{p.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
