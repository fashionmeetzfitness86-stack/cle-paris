import { useRef, useEffect, useState } from "react";
import type { StorefrontSection } from "../../lib/storefront";
import type { Lang } from "../../types";

interface Props {
  section: StorefrontSection;
  lang: Lang;
}

export function TextBlock({ section, lang }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const title = lang === "fr" ? section.title_fr : section.title_en;
  const body  = lang === "fr" ? section.body_fr  : section.body_en;

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {title && (
          <h2
            className={`font-display text-4xl md:text-5xl tracking-tight text-bone mb-8 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {title}
          </h2>
        )}
        {body && (
          <p
            className={`text-stone-400 text-base leading-loose transition-all duration-700 delay-150 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {body}
          </p>
        )}
        {section.link && (
          <div
            className={`mt-10 transition-all duration-700 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <a
              href={section.link}
              className="light-sweep inline-block border border-stone-700 px-8 py-3 text-xs uppercase tracking-widest text-stone-400 hover:border-bone hover:text-bone transition-all duration-500"
            >
              En savoir plus
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
