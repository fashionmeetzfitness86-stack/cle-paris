import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { StorefrontSection } from "../../lib/storefront";
import type { Lang } from "../../types";

interface Props {
  section: StorefrontSection;
  lang: Lang;
}

export function CollectionBlock({ section, lang }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const title    = lang === "fr" ? section.title_fr    : section.title_en;
  const subtitle = lang === "fr" ? section.subtitle_fr : section.subtitle_en;

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {section.image && (
        <img
          src={section.image}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8s] ease-out ${
            visible ? "scale-100" : "scale-105"
          }`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className={`absolute bottom-0 left-0 right-0 p-10 md:p-16 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}>
        {subtitle && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-3">{subtitle}</p>
        )}
        <h2 className="font-display text-4xl md:text-5xl text-bone mb-6">{title}</h2>
        {section.link && (
          <Link
            to={section.link}
            className="light-sweep inline-block border border-bone/50 px-7 py-3 text-xs uppercase tracking-widest text-bone hover:border-bone transition-colors duration-500"
          >
            Explorer
          </Link>
        )}
      </div>
    </section>
  );
}
