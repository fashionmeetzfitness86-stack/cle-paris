import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { StorefrontSection } from "../../lib/storefront";
import type { Lang, Product } from "../../types";

interface Props {
  section: StorefrontSection;
  lang: Lang;
  products?: Product[];
}

export function ProductGridBlock({ section, lang, products = [] }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const title = lang === "fr" ? section.title_fr : section.title_en;

  // Slugs can be stored in section.data as { slugs: string[] }
  const slugs = (section.data as { slugs?: string[] })?.slugs ?? [];
  const displayed = slugs.length > 0
    ? products.filter((p) => slugs.includes(p.slug))
    : products.slice(0, 4);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (displayed.length === 0) return null;

  return (
    <section ref={ref} className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className={`font-display text-3xl text-bone mb-10 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayed.map((p, i) => (
            <Link
              key={p.slug}
              to={`/product/${p.slug}`}
              className={`group block transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[3/4] overflow-hidden bg-stone-900 mb-3">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="text-xs uppercase tracking-widest text-stone-500 mb-1">{p.name}</p>
              <p className="text-sm text-stone-300">
                {p.currency === "EUR" ? "€" : "$"}{p.price.toFixed(0)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
