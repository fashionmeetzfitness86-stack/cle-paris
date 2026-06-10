import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getActiveProducts } from "../data/products";
import { useScrollReveal } from "../hooks/useScrollReveal";
import type { Lang, Product } from "../types";

type Filter = "all" | "tops" | "pants" | "shorts";

const FILTERS: { id: Filter; label: { fr: string; en: string } }[] = [
  { id: "all",    label: { fr: "Tous",      en: "All"    } },
  { id: "tops",   label: { fr: "Hauts",     en: "Tops"   } },
  { id: "pants",  label: { fr: "Pantalons", en: "Pants"  } },
  { id: "shorts", label: { fr: "Shorts",    en: "Shorts" } },
];

const matchFilter = (p: Product, f: Filter) => {
  if (f === "all")    return true;
  if (f === "tops")   return p.category === "hoodie" || p.category === "crewneck" || p.category === "tshirt";
  if (f === "pants")  return p.category === "pants";
  if (f === "shorts") return p.category === "shorts";
  return true;
};

export default function CollectionPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const [filter, setFilter] = useState<Filter>("all");
  const products = getActiveProducts().filter((p) => matchFilter(p, filter));

  const gridRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-[#F4EFE8]">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Page header */}
        <header className="mb-14 border-b border-black/8 pb-10 animate-fade-up">
          <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-[#C8A97E]">
            Ateliers CLÉ Paris
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h1 className="font-display text-4xl font-light tracking-tight text-[#111] md:text-5xl">
              La Collection&nbsp;<em className="font-light not-italic text-[#C8A97E]">2026</em>
            </h1>
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F]">
              [{products.length} {lang === "fr" ? "Créations Trouvées" : "Items Found"}]
            </div>
          </div>
        </header>

        {/* Filter bar */}
        <div className="mb-12 flex flex-wrap gap-2 animate-fade-up" style={{ animationDelay: "100ms" }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`border px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] transition-all duration-300 btn-press ${
                filter === f.id
                  ? "border-[#111] bg-[#111] text-[#FAF7F2]"
                  : "border-black/15 bg-transparent text-[#6F6F6F] hover:border-[#111] hover:text-[#111]"
              }`}
            >
              {f.label[lang]}
            </button>
          ))}
        </div>

        {/* Product grid — scroll-reveal container */}
        <div
          ref={gridRef}
          className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((p, i) => {
            const color = p.colors[0];
            const staggerClass = `stagger-${Math.min(i + 1, 9)}` as string;
            return (
              <Link
                key={p.slug}
                to={`/product/${p.slug}`}
                className={`group block reveal ${staggerClass}`}
              >
                {/* Image container */}
                <div className="relative overflow-hidden bg-[#EFE7DD] shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-500 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)]">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Secondary image crossfade */}
                  {p.images[1] && (
                    <img
                      src={p.images[1]}
                      alt={`${p.name} alt`}
                      className="absolute inset-0 aspect-[4/5] w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  )}
                  {/* New badge */}
                  <span className="absolute left-3 top-3 bg-[#C8A97E] px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white font-medium">
                    {lang === "fr" ? "Nouveau" : "New"}
                  </span>
                  {/* Quick-view hover overlay */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[#FAF7F2]/95 backdrop-blur-sm px-4 py-3 transition-transform duration-300 group-hover:translate-y-0 border-t border-black/8">
                    <span className="block text-center text-[10px] uppercase tracking-[0.2em] text-[#3A3A3A]">
                      Voir le produit →
                    </span>
                  </div>
                </div>

                {/* Product info */}
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-[#111] group-hover:text-[#C8A97E] transition-colors duration-300">
                      {p.name}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-[#6F6F6F]">
                      {color.label[lang]}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#111] whitespace-nowrap">
                    €{p.price.toFixed(2)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="py-24 text-center text-[#6F6F6F] animate-fade-up">
            <p className="text-sm">Aucun produit dans cette catégorie.</p>
            <button
              onClick={() => setFilter("all")}
              className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[#C8A97E] hover:text-[#111] transition-colors border-b border-[#C8A97E] hover:border-[#111] pb-0.5"
            >
              Voir tous les produits →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
