import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProducts } from "../hooks/useProducts";
import { useScrollReveal, useRevealRef } from "../hooks/useScrollReveal";
import type { Lang } from "../types";

// ── Marquee trust bar items (i18n keys) ──────────────────────────
const TRUST_KEYS = [
  "trust.organicCotton",
  "trust.madeInEurope",
  "trust.denseWeave",
  "trust.freeShipping",
  "trust.returns",
  "trust.installments",
  "trust.limitedEdition",
];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const { products } = useProducts();
  const featured = products[0];
  const TRUST_ITEMS = TRUST_KEYS.map((k) => t(k));

  // Scroll-reveal refs
  const featuredRef   = useScrollReveal();
  const editorialRef  = useRevealRef();
  const manifeRef     = useRevealRef();

  return (
    <div className="bg-[#F4EFE8] text-[#111]">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-24 md:flex-row md:items-center md:py-36">
        {/* Left — editorial text */}
        <div className="flex-1 max-w-xl">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] animate-fade-up" style={{ animationDelay: "100ms" }}>
            {t("home.heroEyebrow")} · CLÉ&nbsp;01™
          </div>
          <h1
            className="mt-5 font-display text-5xl font-light leading-[1.05] tracking-tight text-[#111] md:text-6xl lg:text-7xl animate-clip-left"
            style={{ animationDelay: "200ms" }}
          >
            {t("home.heroCampaign")}<br />
            <em className="not-italic text-[#C8A97E]">CLÉ</em> PARIS<br />
            2026
          </h1>
          <p
            className="mt-8 max-w-sm text-sm leading-relaxed text-[#6F6F6F] animate-fade-up"
            style={{ animationDelay: "500ms" }}
          >
            {t("home.heroBody")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "650ms" }}>
            <Link
              to="/collection"
              className="border border-[#111] px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#111] hover:bg-[#111] hover:text-[#FAF7F2] transition-all duration-300 light-sweep btn-press"
            >
              {t("home.ctaShop")}
            </Link>
            {featured && (
              <Link
                to={`/product/${featured.slug}`}
                className="px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] hover:text-[#111] transition-colors duration-300 border border-transparent hover:border-black/10"
              >
                {t("home.discoverCle")}
              </Link>
            )}
          </div>
        </div>

        {/* Right — floating product image */}
        {featured && (
          <Link
            to={`/product/${featured.slug}`}
            className="flex-1 flex justify-center md:justify-end animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            <img
              src="/images/levitating_sweatshirt-Photoroom.png"
              alt={featured.name}
              className="w-full max-w-lg object-contain animate-float drop-shadow-[0_24px_48px_rgba(0,0,0,0.12)] transition-transform duration-500 hover:scale-[1.03]"
            />
          </Link>
        )}
      </section>

      {/* ── MARQUEE TRUST BAR ──────────────────────────────────────── */}
      <div className="border-y border-black/8 bg-[#EFE7DD] overflow-hidden">
        <div
          className="flex animate-marquee py-4 text-[10px] uppercase tracking-[0.25em] text-[#6F6F6F] select-none"
          aria-hidden="true"
        >
          {/* Duplicated for seamless loop */}
          {[0, 1].map((copy) => (
            <span key={copy} className="flex flex-shrink-0 items-center gap-0">
              {TRUST_ITEMS.map((item, i) => (
                <span key={i} className="flex items-center gap-0">
                  <span className="px-8 whitespace-nowrap">{item}</span>
                  <span className="text-[#C8A97E] pr-2">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────── */}
      <section
        ref={featuredRef}
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <div className="mb-12 flex flex-col gap-2 md:flex-row md:items-end md:justify-between reveal">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#C8A97E]">
              {t("home.atelierEyebrow")}
            </div>
            <h2 className="mt-2 font-display text-3xl font-light tracking-tight text-[#111] md:text-4xl">
              {t("home.latestCollection")}
            </h2>
          </div>
          <Link
            to="/collection"
            className="text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] hover:text-[#C8A97E] transition-colors duration-300 border-b border-transparent hover:border-[#C8A97E] pb-0.5"
          >
            {t("home.viewAll")}
          </Link>
        </div>

        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((p, i) => {
            const color = p.colors[0];
            const stagger = ["stagger-1", "stagger-2", "stagger-3"][i];
            return (
              <Link
                key={p.slug}
                to={`/product/${p.slug}`}
                className={`group block reveal ${stagger}`}
              >
                <div className="relative overflow-hidden bg-[#EFE7DD] shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow duration-500 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)]">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {p.images[1] && (
                    <img
                      src={p.images[1]}
                      alt={`${p.name} view 2`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  )}
                  {p.isNew && (
                    <span className="absolute left-3 top-3 bg-[#C8A97E] px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white">
                      {t("home.new")}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-[#111] group-hover:text-[#C8A97E] transition-colors duration-300">
                      {p.name}
                    </div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-wider text-[#6F6F6F]">
                      {color?.label[lang]}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#3A3A3A] whitespace-nowrap">
                    €{p.price.toFixed(2)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── EDITORIAL STRIP ─────────────────────────────────────────── */}
      <section
        className="bg-[#EFE7DD]"
      >
        <div
          ref={editorialRef as React.RefObject<HTMLDivElement>}
          className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center reveal"
        >
          <div className="overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.08)]">
            <img
              src="/images/sweat2_flat.jpg"
              alt="Texture CLÉ Paris"
              className="w-full object-cover transition-transform duration-1000 hover:scale-105"
            />
          </div>
          <div className="md:pl-8">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#C8A97E]">
              {t("home.designParis")}
            </div>
            <h3 className="mt-4 font-display text-3xl font-light tracking-tight text-[#111] md:text-4xl">
              {t("home.editorialTitle1")}<br />
              <em className="not-italic text-[#C8A97E]">{t("home.editorialTitle2")}</em>
            </h3>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#6F6F6F]">
              {t("home.editorialBody")}
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
              <div>
                <div className="text-[9px] uppercase tracking-[0.25em] text-[#6F6F6F]">{t("home.labelMaking")}</div>
                <div className="mt-1 text-sm font-medium text-[#111]">{t("home.valueMaking")}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.25em] text-[#6F6F6F]">{t("home.labelMaterial")}</div>
                <div className="mt-1 text-sm font-medium text-[#111]">{t("home.valueMaterial")}</div>
              </div>
            </div>
            <Link
              to="/about"
              className="mt-8 inline-block border-b border-[#C8A97E] pb-1 text-[11px] uppercase tracking-[0.2em] text-[#C8A97E] hover:text-[#111] hover:border-[#111] transition-all duration-300"
            >
              {t("home.readMore")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── MANIFESTE ──────────────────────────────────────────────── */}
      <section className="bg-[#E7DDD1]">
        <div
          ref={manifeRef as React.RefObject<HTMLDivElement>}
          className="mx-auto max-w-3xl px-6 py-24 text-center reveal"
        >
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E]">
            {t("home.manifestoEyebrow")}
          </div>
          <h3 className="mt-6 font-display text-3xl font-light tracking-tight text-[#111] md:text-4xl">
            {t("home.manifestoTitle")}
          </h3>
          <div className="mx-auto mt-4 h-px w-12 bg-[#C8A97E]" />
          <p className="mt-8 text-sm leading-relaxed text-[#6F6F6F]">
            {t("home.manifestoBody")}
          </p>
          <Link
            to="/collection"
            className="mt-10 inline-block border border-[#111] px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#111] hover:bg-[#111] hover:text-[#FAF7F2] transition-all duration-300 light-sweep btn-press"
          >
            {t("home.ctaShop")}
          </Link>
        </div>
      </section>

    </div>
  );
}
