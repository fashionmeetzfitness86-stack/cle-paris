import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProduct, useProducts, SIZE_ORDER } from "../hooks/useProducts";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useCart } from "../store/cart";
import type { Lang, ProductVariant } from "../types";

// ── Minimal accordion for product details ───────────────────────
function Accordion({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-black/8">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#6F6F6F]">{label}</span>
        <span
          className="text-[#6F6F6F] transition-transform duration-300 text-xs"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ maxHeight: open ? "500px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="pb-4 text-[11px] leading-relaxed text-[#6F6F6F] tracking-wide">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Size guide slide-in panel ────────────────────────────────────
function SizeGuide({ open, onClose, lang }: { open: boolean; onClose: () => void; lang: string }) {
  const isFr = lang === "fr";
  const sizes = [
    { size: "XS",  chest: "86–91",  waist: "70–75",  hip: "91–96"  },
    { size: "S",   chest: "91–96",  waist: "75–80",  hip: "96–101" },
    { size: "M",   chest: "96–101", waist: "80–85",  hip: "101–106" },
    { size: "L",   chest: "101–106",waist: "85–90",  hip: "106–111" },
    { size: "XL",  chest: "106–111",waist: "90–95",  hip: "111–116" },
    { size: "XXL", chest: "111–116",waist: "95–100", hip: "116–121" },
  ];
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-[#111]/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isFr ? "Guide des tailles" : "Size Guide"}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#FAF7F2] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] transition-transform duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] md:bottom-auto md:top-1/2 md:left-1/2 md:right-auto md:w-[520px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-sm ${
          open ? "translate-y-0" : "translate-y-full md:translate-y-[-40%] md:opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/8 px-6 py-5">
          <h3 className="text-[11px] uppercase tracking-[0.25em] text-[#111]">
            {isFr ? "Guide des tailles" : "Size Guide"}
          </h3>
          <button
            onClick={onClose}
            aria-label={isFr ? "Fermer" : "Close"}
            className="flex h-8 w-8 items-center justify-center text-[#6F6F6F] hover:text-[#111] transition-colors text-xl"
          >
            ×
          </button>
        </div>
        <div className="overflow-x-auto px-6 py-6">
          <p className="mb-4 text-[11px] text-[#6F6F6F] leading-relaxed">
            {isFr
              ? "Toutes les mesures sont en centimètres. Mesurez votre tour de poitrine, de taille et de hanches."
              : "All measurements are in centimetres. Measure your chest, waist, and hip circumference."}
          </p>
          <table className="w-full text-[11px] text-[#3A3A3A]">
            <thead>
              <tr className="border-b border-black/8">
                {[isFr ? "Taille" : "Size", isFr ? "Poitrine" : "Chest", isFr ? "Taille" : "Waist", isFr ? "Hanches" : "Hips"].map((h) => (
                  <th key={h} className="pb-3 pr-6 text-left text-[10px] uppercase tracking-[0.2em] text-[#6F6F6F] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((row) => (
                <tr key={row.size} className="border-b border-black/5 hover:bg-[#F4EFE8] transition-colors">
                  <td className="py-3 pr-6 font-medium text-[#111]">{row.size}</td>
                  <td className="py-3 pr-6">{row.chest}</td>
                  <td className="py-3 pr-6">{row.waist}</td>
                  <td className="py-3">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-6 text-[10px] text-[#6F6F6F]">
            {isFr
              ? "En cas de doute entre deux tailles, prenez la plus grande."
              : "If in doubt between two sizes, choose the larger one."}
          </p>
        </div>
      </div>
    </>
  );
}

export default function ProductPage() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const { product, loading } = useProduct(slug);
  const { products: activeProducts } = useProducts();
  const add = useCart((s) => s.add);
  const relatedRef = useScrollReveal();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState<ProductVariant["size"] | "">("");
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  // Track which image "key" to force re-render for fade animation
  const [imgKey, setImgKey] = useState(0);

  // Default to the product's first color once it loads (async).
  useEffect(() => {
    if (product?.colors[0]?.id) setSelectedColor(product.colors[0].id);
  }, [product]);

  // Reset selected size when color changes
  useEffect(() => {
    setSelectedSize("");
  }, [selectedColor]);

  // Update page title + OG social meta tags for each product
  useEffect(() => {
    if (!product) return;
    const title = `${product.name} — CLÉ PARIS`;
    document.title = title;
    const setMeta = (prop: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", prop);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    const desc = product.description[lang] || "";
    const image = product.images[0] ?? "";
    const absoluteImage = image.startsWith("/") ? `${window.location.origin}${image}` : image;
    setMeta("og:title", title);
    setMeta("og:description", desc);
    setMeta("og:image", absoluteImage);
    setMeta("og:url", window.location.href);
    setMeta("og:type", "product");
    setMetaName("twitter:title", title);
    setMetaName("twitter:description", desc);
    setMetaName("twitter:image", absoluteImage);
    setMetaName("description", desc);

    return () => {
      document.title = "CLÉ PARIS";
    };
  }, [product, lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EFE8]">
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] animate-pulse">
            {lang === "fr" ? "Chargement…" : "Loading…"}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F4EFE8]">
        <div className="mx-auto max-w-3xl px-6 py-32 text-center animate-fade-up">
          <h1 className="font-display text-3xl text-[#111]">{t("product.notFound")}</h1>
          <Link
            to="/collection"
            className="mt-6 inline-block text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] hover:text-[#111] transition-colors"
          >
            {t("product.backToCollection")}
          </Link>
        </div>
      </div>
    );
  }

  const availableVariants = product.variants.filter((v) => v.colorId === selectedColor);
  const isInStock = (size: ProductVariant["size"]) =>
    availableVariants.find((v) => v.size === size && v.stock > 0);

  const handleAdd = () => {
    if (!selectedSize || added) return;
    add({ productSlug: product.slug, size: selectedSize, colorId: selectedColor, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleImageChange = (idx: number) => {
    setActiveImage(idx);
    setImgKey((k) => k + 1);
  };

  // Keyboard nav for gallery
  const handleImageKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter" || e.key === " ") handleImageChange(idx);
    if (e.key === "ArrowRight") handleImageChange(Math.min(idx + 1, product.images.length - 1));
    if (e.key === "ArrowLeft")  handleImageChange(Math.max(idx - 1, 0));
  };

  const related = activeProducts.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F4EFE8] pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 md:grid-cols-2">

          {/* ── Image gallery ──────────────────────────────────────── */}
          <div>
            {/* Main image with crossfade */}
            <div className="relative overflow-hidden bg-[#EFE7DD] shadow-[0_4px_30px_rgba(0,0,0,0.08)] group">
              <img
                key={imgKey}
                src={product.images[activeImage] ?? product.images[0]}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover animate-fade-in transition-transform duration-700 group-hover:scale-[1.02]"
              />
              {/* Arrow navigation (shown on hover when multiple images) */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageChange(Math.max(activeImage - 1, 0))}
                    disabled={activeImage === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-[#FAF7F2]/90 text-[#111] opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity duration-200 hover:bg-[#FAF7F2] text-sm"
                    aria-label="Image précédente"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleImageChange(Math.min(activeImage + 1, product.images.length - 1))}
                    disabled={activeImage === product.images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-[#FAF7F2]/90 text-[#111] opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity duration-200 hover:bg-[#FAF7F2] text-sm"
                    aria-label="Image suivante"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div
                role="listbox"
                aria-label="Galerie"
                className="mt-3 flex gap-2"
              >
                {product.images.map((src, idx) => (
                  <button
                    key={idx}
                    role="option"
                    aria-selected={activeImage === idx}
                    onClick={() => handleImageChange(idx)}
                    onKeyDown={(e) => handleImageKey(e, idx)}
                    className={`h-16 w-12 flex-shrink-0 overflow-hidden border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A97E] ${
                      activeImage === idx
                        ? "border-[#111] scale-105"
                        : "border-black/10 opacity-55 hover:opacity-100 hover:border-black/30"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product details ────────────────────────────────────── */}
          <div className="md:sticky md:top-24 md:self-start animate-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="text-[11px] uppercase tracking-[0.25em] text-[#C8A97E]">
              {t("product.eyebrow")}
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
                      className={`h-3 w-3 rounded-full border transition-all duration-300 ${
                        selectedColor === c.id ? "border-[#111] scale-110" : "border-black/15"
                      }`}
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
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[11px] text-[#C8A97E] underline underline-offset-2 hover:text-[#111] transition-colors">
                  {t("product.sizeGuide")}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SIZE_ORDER
                .filter((sz) => product.variants.some((v) => v.size === sz))
                .map((size) => {
                  const typedSize = size as ProductVariant["size"];
                  const inStock = isInStock(typedSize);
                  return (
                    <button
                      key={size}
                      disabled={!inStock}
                      onClick={() => setSelectedSize(typedSize)}
                      className={`min-w-[3rem] border px-3 py-2.5 text-[11px] uppercase tracking-widest transition-all duration-300 ${
                        selectedSize === typedSize
                          ? "border-[#111] bg-[#111] text-[#FAF7F2] scale-105"
                          : inStock
                            ? "border-black/15 text-[#3A3A3A] hover:border-[#111] hover:scale-105"
                            : "border-black/8 text-black/25 line-through cursor-not-allowed"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add to cart — desktop */}
            <button
              onClick={handleAdd}
              disabled={!selectedSize}
              className={`mt-10 hidden w-full py-4 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed md:block light-sweep ${
                added
                  ? "bg-[#C8A97E] text-white animate-success-pop"
                  : "bg-[#111] text-[#FAF7F2] hover:bg-[#2C2825]"
              }`}
            >
              {added ? t("product.added") : t("product.addToCart")}
            </button>

            {/* Product details accordions */}
            <div className="mt-8 space-y-0">
              <Accordion label={t("product.shipping")}>
                {t("product.shippingBody")}
              </Accordion>
              <Accordion label={product.material[lang] || t("product.composition")}>
                {t("product.compositionBody")}
              </Accordion>
              <Accordion label={t("product.care")}>
                {t("product.careBody")}
              </Accordion>
            </div>
          </div>
        </div>

        {/* ── Related products ─────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-32 border-t border-black/8 pt-16">
            <h2 className="font-display text-2xl font-light tracking-tight text-[#111] animate-fade-up">
              {t("product.relatedItems")}
            </h2>
            <div ref={relatedRef} className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Link
                  key={p.slug}
                  to={`/product/${p.slug}`}
                  className="group reveal"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="overflow-hidden bg-[#EFE7DD] shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow duration-500 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)]">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      loading="lazy"
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

      {/* ── Mobile sticky add-to-cart bar ────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-black/8 bg-[#F4EFE8]/95 backdrop-blur-md px-4 py-3 safe-bottom">
        <div className="flex gap-3 items-center">
          {/* Size hint if not selected */}
          {!selectedSize && (
            <p className="flex-1 text-[11px] text-[#6F6F6F] uppercase tracking-wider truncate">
              {t("product.selectSize")}
            </p>
          )}
          <button
            onClick={handleAdd}
            disabled={!selectedSize}
            className={`flex-1 py-3.5 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
              added
                ? "bg-[#C8A97E] text-white"
                : "bg-[#111] text-[#FAF7F2]"
            }`}
          >
            {added ? t("product.addedShort") : !selectedSize ? t("product.chooseSize") : t("product.addToCart")}
          </button>
        </div>
      </div>

      {/* Size guide panel */}
      <SizeGuide open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} lang={lang} />
    </div>
  );
}
