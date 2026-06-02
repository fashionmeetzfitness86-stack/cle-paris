import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const STATS = [
  { value: "2024", label: { fr: "Fondation", en: "Founded" } },
  { value: "EU",   label: { fr: "Production", en: "Production" } },
  { value: "500",  label: { fr: "GSM · Densité", en: "GSM · Weight" } },
] as const;

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "fr" | "en";
  const stats  = useReveal(0.2);
  const body   = useReveal(0.1);

  return (
    <div className="mx-auto max-w-3xl px-6 py-32">
      {/* Eyebrow + headline — staggered entrance */}
      <div className="animate-fade-up">
        <div className="text-[10px] uppercase tracking-[0.4em] text-stone-600">
          {t("about.eyebrow")}
        </div>
      </div>
      <h1 className="mt-6 font-display text-5xl tracking-tight md:text-7xl leading-[1.0] animate-fade-up delay-100">
        {t("about.title")}
      </h1>

      {/* Divider line — animated grow */}
      <div className="mt-10 h-px bg-gradient-to-r from-stone-700 via-stone-600 to-transparent animate-fade-up delay-200" />

      {/* Body paragraphs — scroll reveal, staggered */}
      <div ref={body.ref} className="mt-10 space-y-6 text-sm leading-relaxed text-stone-300">
        {[t("about.p1"), t("about.p2"), t("about.p3")].map((para, i) => (
          <p
            key={i}
            className="transition-all ease-luxury"
            style={{
              transitionDuration: "800ms",
              transitionDelay: `${i * 120}ms`,
              opacity: body.visible ? 1 : 0,
              transform: body.visible ? "translateY(0)" : "translateY(16px)",
            }}
          >
            {para}
          </p>
        ))}
      </div>

      {/* Stats grid — scroll reveal */}
      <div
        ref={stats.ref}
        className="mt-16 grid gap-8 border-y border-stone-900/60 py-12 md:grid-cols-3"
      >
        {STATS.map(({ value, label }, i) => (
          <div
            key={value}
            className="group transition-all ease-luxury"
            style={{
              transitionDuration: "700ms",
              transitionDelay: `${i * 100}ms`,
              opacity: stats.visible ? 1 : 0,
              transform: stats.visible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <div className="font-display text-3xl text-bone/80 group-hover:text-bone transition-colors duration-300">
              {value}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-widest text-stone-600">
              {label[lang]}
            </div>
          </div>
        ))}
      </div>

      {/* Contact block */}
      <div className="mt-16 animate-fade-up delay-300">
        <div className="text-[10px] uppercase tracking-widest text-stone-600 mb-3">
          {t("about.contact")}
        </div>
        <a
          href="mailto:contact@cleparis.store"
          className="group inline-flex items-center gap-2 text-sm text-stone-300 hover:text-bone transition-colors duration-300 border-b border-stone-800 pb-1 hover:border-stone-500"
        >
          contact@cleparis.store
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>
  );
}
