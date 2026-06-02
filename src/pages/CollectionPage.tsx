import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getActiveProducts } from "../data/products";
import { fetchActiveProducts } from "../lib/storefront";
import type { Lang, Product } from "../types";

type Filter = "all" | "tops" | "pants" | "shorts";

const FILTERS: { id: Filter; label: { fr: string; en: string } }[] = [
  { id: "all",    label: { fr: "Tous",      en: "All" } },
  { id: "tops",   label: { fr: "Hauts",     en: "Tops" } },
  { id: "pants",  label: { fr: "Pantalons", en: "Pants" } },
  { id: "shorts", label: { fr: "Shorts",    en: "Shorts" } },
];

const matchFilter = (p: Product, f: Filter) => {
  if (f === "all")    return true;
  if (f === "tops")   return p.category === "hoodie" || p.category === "crewneck" || p.category === "tshirt";
  if (f === "pants")  return p.category === "pants";
  if (f === "shorts") return p.category === "shorts";
  return true;
};

/** Observe when element enters viewport */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Product card ─────────────────────────────────────────────────────────── */
function ProductCard({ p, lang, index }: { p: Product; lang: Lang; index: number }) {
  const [hovered, setHovered] = useState(false);
  const color = p.colors[0];
  const hasSecondImage = p.images.length > 1;
  const { ref, inView } = useInView(0.08);

  return (
    <div
      ref={ref}
      className={`transition-all ease-luxury ${
        inView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDuration: "700ms", transitionDelay: `${index * 80}ms` }}
    >
      <Link
        to={`/product/${p.slug}`}
        className="group block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative overflow-hidden bg-stone-950">
          {/* Primary image */}
          <img
            src={p.images[0]}
            alt={p.name}
            className={`aspect-[4/5] w-full object-cover transition-all duration-700 ease-luxury will-change-transform ${
              hovered && hasSecondImage ? "opacity-0 scale-[1.04]" : "opacity-100 scale-100"
            }`}
          />
          {/* Secondary image */}
          {hasSecondImage && (
            <img
              src={p.images[1]}
              alt={`${p.name} — alternate`}
              className={`absolute inset-0 aspect-[4/5] w-full object-cover transition-all duration-700 ease-luxury will-change-transform ${
                hovered ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]"
              }`}
            />
          )}
          {/* New badge */}
          <span className={`absolute left-3 top-3 bg-bone px-2 py-1 text-[10px] uppercase tracking-widest text-black transition-all duration-300 ${hovered ? "opacity-100" : "opacity-70"}`}>
            {lang === "fr" ? "Nouveau" : "New"}
          </span>
          {/* Bottom fade */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`} />
          {/* View hint */}
          <div className={`absolute bottom-0 left-0 right-0 py-3 flex justify-center transition-all duration-400 ease-luxury ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            <span className="bg-black/70 backdrop-blur-sm px-4 py-1.5 text-[9px] uppercase tracking-widest text-bone border border-stone-700/40">
              {lang === "fr" ? "Voir le produit" : "View product"}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <div className={`text-sm transition-colors duration-300 ${hovered ? "text-white" : "text-bone"}`}>{p.name}</div>
            <div className="mt-0.5 text-xs text-stone-500">{color?.label[lang]}</div>
          </div>
          <div className={`text-sm transition-colors duration-300 ${hovered ? "text-white" : "text-stone-300"}`}>€{p.price}</div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Skeleton card ─────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div>
      <div className="aspect-[4/5] w-full animate-shimmer" />
      <div className="mt-4 h-3 w-36 animate-shimmer" />
      <div className="mt-2 h-3 w-20 animate-shimmer" />
    </div>
  );
}

/* ─── Collection page ───────────────────────────────────────────────────────── */
export default function CollectionPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const [filter, setFilter] = useState<Filter>("all");
  const [products, setProducts] = useState<Product[]>(getActiveProducts());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchActiveProducts().then((data) => {
      if (!cancelled && data.length > 0) setProducts(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const filtered = products.filter((p) => matchFilter(p, filter));

  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-stone-800/60 pb-8 animate-fade-up">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-stone-600 mb-3">// La Collection</div>
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">Collection 2026</h1>
        </div>
        <div className="text-xs uppercase tracking-widest text-stone-600">
          {loading ? (
            <div className="h-3 w-16 animate-shimmer" />
          ) : (
            `[${filtered.length} ${lang === "fr" ? "Créations" : "Items"}]`
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-8 flex flex-wrap gap-2 animate-fade-up delay-100">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`relative border px-5 py-2 text-xs uppercase tracking-widest transition-all duration-300 ease-luxury overflow-hidden ${
              filter === f.id
                ? "border-bone bg-bone text-black"
                : "border-stone-800 text-stone-500 hover:border-stone-500 hover:text-bone"
            }`}
          >
            {f.label[lang]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-14 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)
          : filtered.map((p, i) => (
              <ProductCard key={p.slug} p={p} lang={lang} index={i % 6} />
            ))
        }
      </div>

      {!loading && filtered.length === 0 && (
        <div className="py-32 text-center animate-fade-up">
          <div className="text-4xl text-stone-800 mb-4">∅</div>
          <p className="text-sm text-stone-500">
            {lang === "fr" ? "Aucun produit dans cette catégorie." : "No products in this category."}
          </p>
        </div>
      )}
    </div>
  );
}
