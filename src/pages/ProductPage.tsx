import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProductBySlug, getActiveProducts } from "../data/products";
import { fetchProductBySlug, fetchActiveProducts } from "../lib/storefront";
import { useCart } from "../store/cart";
import type { Lang, Product, ProductVariant } from "../types";

/* ─── Accordion ─────────────────────────────────────────────────────────────── */
function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(open ? bodyRef.current.scrollHeight : 0);
    }
  }, [open, children]);

  return (
    <div className="border-t border-stone-900">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-xs uppercase tracking-widest text-stone-400 hover:text-bone transition-colors duration-200 group"
      >
        <span className="group-hover:text-bone transition-colors duration-200">{title}</span>
        <svg
          viewBox="0 0 12 12"
          fill="none"
          className={`w-3 h-3 text-stone-600 flex-shrink-0 transition-all duration-400 ease-luxury ${open ? "rotate-45" : ""}`}
        >
          <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
      <div
        style={{ height, overflow: "hidden", transition: "height 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div ref={bodyRef} className="pb-5 text-sm leading-relaxed text-stone-400">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Image gallery ─────────────────────────────────────────────────────────── */
function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const switchTo = (idx: number) => {
    if (idx === activeIdx || animating) return;
    setPrev(activeIdx);
    setAnimating(true);
    setActiveIdx(idx);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 600);
  };

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative overflow-hidden bg-stone-950 aspect-[4/5]">
        {/* Previous fading out */}
        {prev !== null && (
          <img
            src={images[prev]}
            alt={`${name} ${prev + 1}`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
          />
        )}
        {/* Active image */}
        <img
          src={images[activeIdx]}
          alt={`${name} ${activeIdx + 1}`}
          className={`w-full h-full object-cover transition-all duration-600 ease-luxury ${
            animating ? "scale-[1.02] opacity-90" : "scale-100 opacity-100"
          }`}
        />
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => switchTo((activeIdx - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-sm text-stone-300 hover:text-white hover:bg-black/80 transition-all duration-200"
              aria-label="Previous image"
            >‹</button>
            <button
              onClick={() => switchTo((activeIdx + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-sm text-stone-300 hover:text-white hover:bg-black/80 transition-all duration-200"
              aria-label="Next image"
            >›</button>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => switchTo(idx)}
              className={`relative flex-shrink-0 w-16 h-20 overflow-hidden transition-all duration-300 ${
                idx === activeIdx ? "ring-1 ring-bone" : "opacity-50 hover:opacity-80"
              }`}
            >
              <img src={src} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Product page ──────────────────────────────────────────────────────────── */
export default function ProductPage() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const add = useCart((s) => s.add);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const [product, setProduct] = useState<Product | undefined>(getProductBySlug(slug));
  const [related, setRelated] = useState<Product[]>(
    getActiveProducts().filter((p) => p.slug !== slug).slice(0, 3)
  );
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.id ?? "");
  const [selectedSize, setSelectedSize]   = useState<ProductVariant["size"] | "">("");

  useEffect(() => {
    let cancelled = false;
    fetchProductBySlug(slug).then((p) => {
      if (!cancelled && p) {
        setProduct(p);
        setSelectedColor(p.colors[0]?.id ?? "");
        setSelectedSize("");
      }
    });
    fetchActiveProducts().then((all) => {
      if (!cancelled && all.length > 0) {
        setRelated(all.filter((p) => p.slug !== slug).slice(0, 3));
      }
    });
    return () => { cancelled = true; };
  }, [slug]);

  // Sticky bar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (addBtnRef.current) observer.observe(addBtnRef.current);
    return () => observer.disconnect();
  }, [product]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center animate-fade-up">
        <div className="text-5xl text-stone-800 mb-6">∅</div>
        <h1 className="font-display text-3xl">{t("product.notFound")}</h1>
        <Link to="/collection" className="mt-8 inline-block text-xs uppercase tracking-widest text-stone-400 hover:text-white transition-colors">
          {t("product.backToCollection")}
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
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const allSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2">

        {/* ── Images ──────────────────────────────────────────────────── */}
        <div className="animate-fade-up">
          <ImageGallery images={product.images} name={product.name} />
        </div>

        {/* ── Info panel ─────────────────────────────────────────────── */}
        <div className="md:sticky md:top-28 md:self-start space-y-0">
          {/* Eyebrow */}
          <div className="text-[10px] uppercase tracking-[0.35em] text-stone-600 animate-fade-up">
            CLÉ&nbsp;PARIS · 2026
          </div>
          {/* Name */}
          <h1 className="mt-3 font-display text-4xl tracking-tight leading-tight animate-fade-up delay-75">
            {product.name}
          </h1>
          {/* Price */}
          <div className="mt-3 flex items-baseline gap-3 animate-fade-up delay-100">
            <span className="text-xl text-bone">€{product.price.toFixed(2)}</span>
            {product.colors.length > 0 && (
              <span className="text-xs text-stone-600 uppercase tracking-widest">
                {product.colors.length} {lang === "fr" ? "coloris" : "colors"}
              </span>
            )}
          </div>
          {/* Description */}
          <p className="mt-6 text-sm leading-relaxed text-stone-400 animate-fade-up delay-150">
            {product.description[lang]}
          </p>

          {/* Color selector */}
          <div className="mt-10 animate-fade-up delay-200">
            <div className="text-[10px] uppercase tracking-widest text-stone-600 mb-3">
              {t("product.color")}
              {selectedColor && (
                <span className="ml-2 text-stone-400">
                  — {product.colors.find(c => c.id === selectedColor)?.label[lang]}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`flex items-center gap-2 border px-3 py-2 text-xs uppercase tracking-widest transition-all duration-300 ease-luxury active:scale-95 ${
                    selectedColor === c.id
                      ? "border-bone text-bone"
                      : "border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300"
                  }`}
                >
                  <span
                    className={`h-3 w-3 rounded-full transition-all duration-300 ${selectedColor === c.id ? "ring-1 ring-offset-1 ring-offset-black ring-bone" : ""}`}
                    style={{ background: c.hex }}
                  />
                  {c.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div className="mt-8 animate-fade-up delay-300">
            <div className="text-[10px] uppercase tracking-widest text-stone-600 mb-3">
              {t("product.size")}
            </div>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((size) => {
                const inStock = isInStock(size);
                return (
                  <button
                    key={size}
                    disabled={!inStock}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] border px-3 py-2 text-xs uppercase tracking-widest transition-all duration-250 ease-luxury active:scale-95 ${
                      selectedSize === size
                        ? "border-bone bg-bone text-black"
                        : inStock
                          ? "border-stone-800 text-stone-400 hover:border-stone-500 hover:text-bone"
                          : "border-stone-900 text-stone-800 line-through cursor-not-allowed"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {!selectedSize && (
              <p className="mt-2 text-[10px] text-stone-700 uppercase tracking-widest">
                {lang === "fr" ? "Sélectionnez une taille" : "Select a size"}
              </p>
            )}
          </div>

          {/* Add to cart */}
          <div className="mt-8 animate-fade-up delay-400">
            <button
              ref={addBtnRef}
              onClick={handleAdd}
              disabled={!selectedSize}
              className={`light-sweep w-full py-4 text-xs uppercase tracking-widest transition-all duration-400 ease-luxury active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed ${
                addedFeedback
                  ? "bg-stone-800 text-bone border border-stone-600"
                  : "bg-bone text-black hover:bg-white hover:shadow-[0_0_40px_rgba(232,226,214,0.12)]"
              }`}
            >
              {addedFeedback ? (
                <span className="flex items-center justify-center gap-2">
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                    <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {lang === "fr" ? "Ajouté au panier" : "Added to cart"}
                </span>
              ) : (
                t("product.addToCart")
              )}
            </button>
          </div>

          {/* Accordions */}
          <div className="mt-8 animate-fade-up delay-500">
            <Accordion title={t("product.shipping")}>
              <p>{lang === "fr" ? "Livraison gratuite en France dès 150€. Europe en 3–5 jours. International en 7–14 jours." : "Free shipping in France over €150. Europe 3–5 days. International 7–14 days."}</p>
            </Accordion>
            <Accordion title={lang === "fr" ? "Composition" : "Material"}>
              <p>{product.material[lang]}</p>
            </Accordion>
            <Accordion title={lang === "fr" ? "Entretien" : "Care"}>
              <p>{lang === "fr" ? "Laver à 30°C. Ne pas essorer. Séchage à plat. Ne pas repasser sur les impressions." : "Wash at 30°C. Do not wring. Dry flat. Do not iron on prints."}</p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* ── Related products ──────────────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="mt-32 border-t border-stone-900/60 pt-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-stone-600 mb-2">// Vous aimerez aussi</div>
              <h2 className="font-display text-2xl tracking-tight">{t("product.relatedItems")}</h2>
            </div>
            <Link to="/collection" className="group text-xs uppercase tracking-widest text-stone-500 hover:text-bone transition-colors flex items-center gap-2">
              Voir tout <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => {
              const color = p.colors[0];
              return (
                <Link
                  key={p.slug}
                  to={`/product/${p.slug}`}
                  className="group animate-fade-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="overflow-hidden bg-stone-950">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04] will-change-transform"
                    />
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <div>
                      <div className="group-hover:text-white transition-colors duration-300">{p.name}</div>
                      <div className="mt-0.5 text-xs text-stone-600">{color?.label[lang]}</div>
                    </div>
                    <div className="text-stone-300">€{p.price}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mobile sticky bar ─────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 border-t border-stone-800/60 bg-black/90 px-6 py-4 backdrop-blur-xl md:hidden transition-all duration-500 ease-luxury ${
          stickyVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm leading-tight">{product.name}</div>
            {selectedSize
              ? <div className="text-xs text-stone-400 mt-0.5">{lang === "fr" ? "Taille" : "Size"} : {selectedSize}</div>
              : <div className="text-xs text-stone-600 mt-0.5">{lang === "fr" ? "Choisir une taille" : "Choose a size"}</div>
            }
          </div>
          <button
            onClick={handleAdd}
            disabled={!selectedSize}
            className={`shrink-0 px-6 py-3 text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-40 ${
              addedFeedback ? "bg-stone-700 text-bone" : "bg-bone text-black hover:bg-white"
            }`}
          >
            {addedFeedback ? "✓" : `${t("product.addToCart")} — €${product.price.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
