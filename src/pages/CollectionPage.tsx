import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProducts } from "../hooks/useProducts";
import type { Lang, Product } from "../types";

type Filter = "all" | "tops" | "pants" | "shorts";

const FILTERS: { id: Filter; label: { fr: string; en: string } }[] = [
  { id: "all", label: { fr: "Tous", en: "All" } },
  { id: "tops", label: { fr: "Hauts", en: "Tops" } },
  { id: "pants", label: { fr: "Pantalons", en: "Pants" } },
  { id: "shorts", label: { fr: "Shorts", en: "Shorts" } },
];

const matchFilter = (p: Product, f: Filter) => {
  if (f === "all") return true;
  if (f === "tops") return p.category === "hoodie" || p.category === "crewneck" || p.category === "tshirt";
  if (f === "pants") return p.category === "pants";
  if (f === "shorts") return p.category === "shorts";
  return true;
};

export default function CollectionPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const [filter, setFilter] = useState<Filter>("all");
  const { products: all, loading } = useProducts();
  const products = all.filter((p) => !p.archived && matchFilter(p, filter));

  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between border-b border-stone-800 pb-8">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">Collection 2026</h1>
        <div className="text-xs uppercase tracking-widest text-stone-500">
          [{products.length} {lang === "fr" ? "Créations Trouvées" : "Items Found"}]
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`border px-4 py-2 text-xs uppercase tracking-widest transition ${
              filter === f.id
                ? "border-bone bg-bone text-black"
                : "border-stone-700 text-stone-400 hover:border-bone hover:text-bone"
            }`}
          >
            {f.label[lang]}
          </button>
        ))}
      </div>

      {loading && products.length === 0 && (
        <div className="mt-16 text-center text-xs uppercase tracking-widest text-stone-500">
          Chargement de la collection…
        </div>
      )}

      <div className="mt-12 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const color = p.colors[0];
          return (
            <Link key={p.slug} to={`/product/${p.slug}`} className="group block">
              <div className="relative overflow-hidden bg-stone-950">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 bg-bone px-2 py-1 text-[10px] uppercase tracking-widest text-black">
                  {lang === "fr" ? "Nouveau" : "New"}
                </span>
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <div className="text-sm">{p.name}</div>
                  <div className="mt-1 text-xs text-stone-500">{color.label[lang]}</div>
                </div>
                <div className="text-sm">€{p.price}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
