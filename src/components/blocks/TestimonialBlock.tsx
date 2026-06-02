import { useRef, useEffect, useState } from "react";
import type { StorefrontSection } from "../../lib/storefront";
import type { Lang } from "../../types";

interface Props {
  section: StorefrontSection;
  lang: Lang;
}

const STAR = "★";

export function TestimonialBlock({ section, lang }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Testimonials can be in section.data.items or just use body as single quote
  const body   = lang === "fr" ? section.body_fr   : section.body_en;
  const author = lang === "fr" ? section.title_fr  : section.title_en;
  const role   = lang === "fr" ? section.subtitle_fr : section.subtitle_en;

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-28 px-6 border-t border-stone-900">
      <div className="max-w-2xl mx-auto text-center">
        <div className={`transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <p className="text-[#c8b89a] tracking-widest text-sm mb-8">
            {STAR.repeat(5)}
          </p>
          <blockquote className="font-display text-2xl md:text-3xl text-bone leading-snug italic mb-8">
            &ldquo;{body}&rdquo;
          </blockquote>
          {author && (
            <p className="text-xs uppercase tracking-widest text-stone-500">
              — {author}{role ? `, ${role}` : ""}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
