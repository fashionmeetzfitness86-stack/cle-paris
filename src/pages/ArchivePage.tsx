import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getArchivedProducts } from "../data/products";
import { fetchArchivedProducts } from "../lib/storefront";
import type { Product } from "../types";

function useInView(threshold = 0.1) {
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

export default function ArchivePage() {
  const { t } = useTranslation();
  const [archived, setArchived] = useState<Product[]>(getArchivedProducts());
  const grid = useInView(0.05);

  useEffect(() => {
    let cancelled = false;
    fetchArchivedProducts().then((data) => {
      if (!cancelled && data.length > 0) setArchived(data);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      {/* Header */}
      <div className="border-b border-stone-800/60 pb-10 animate-fade-up">
        <div className="text-[10px] uppercase tracking-[0.4em] text-stone-600 mb-4">
          // Archives
        </div>
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">
          {t("archive.title")}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-400 animate-fade-up delay-100">
          {t("archive.subtitle")}
        </p>
      </div>

      {archived.length === 0 ? (
        <div className="mt-32 flex flex-col items-center text-center animate-fade-up delay-200">
          <div className="text-5xl text-stone-800 mb-6">∅</div>
          <p className="text-sm uppercase tracking-widest text-stone-500 mb-8">
            {t("archive.empty")}
          </p>
          <Link
            to="/collection"
            className="light-sweep border border-stone-700 px-8 py-3 text-xs uppercase tracking-widest text-stone-400 hover:border-bone hover:text-bone transition-all duration-400 ease-luxury"
          >
            {t("archive.cta")}
          </Link>
        </div>
      ) : (
        <div ref={grid.ref} className="mt-12 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {archived.map((p, i) => (
            <div
              key={p.slug}
              className="transition-all ease-luxury"
              style={{
                transitionDuration: "700ms",
                transitionDelay: `${i * 80}ms`,
                opacity: grid.inView ? 1 : 0,
                transform: grid.inView ? "translateY(0)" : "translateY(24px)",
              }}
            >
              <Link to={`/product/${p.slug}`} className="group block">
                <div className="relative overflow-hidden bg-stone-950">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="aspect-[4/5] w-full object-cover opacity-60 transition-all duration-700 ease-luxury group-hover:opacity-100 group-hover:scale-[1.03] will-change-transform"
                  />
                  {/* Archive label overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <span className="bg-black/60 backdrop-blur-sm px-4 py-1.5 text-[9px] uppercase tracking-widest text-stone-400 border border-stone-700/40">
                      Archive
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-stone-400 group-hover:text-bone transition-colors duration-300">
                    {p.name}
                  </span>
                  <span className="text-stone-700 text-xs uppercase tracking-widest">Archive</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
