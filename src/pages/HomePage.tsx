import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getActiveProducts } from "../data/products";
import { fetchActiveProducts, fetchHomepageSections } from "../lib/storefront";
import VideoHero from "../components/VideoHero";
import { SplitLine } from "../components/SplitText";
import type { Lang, Product } from "../types";
import type { StorefrontSection } from "../lib/storefront";

/* ─── Intersection reveal hook ─────────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
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

/* ─── Parallax hook ─────────────────────────────────────────────────────────── */
function useParallax(strength = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [offset, setOffset] = useState(0);

  const onScroll = useCallback(() => {
    rafRef.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(center * strength);
    });
  }, [strength]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  return { ref, offset };
}

/* ─── Floating product card ─────────────────────────────────────────────────── */
function ProductCard({ p, lang, index }: { p: Product; lang: Lang; index: number }) {
  const [hovered, setHovered] = useState(false);
  const color = p.colors[0];
  const hasSecondImage = p.images.length > 1;

  return (
    <Link
      to={`/product/${p.slug}`}
      className="group block animate-fade-up"
      style={{ animationDelay: `${index * 110}ms` }}
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
        {/* Secondary image crossfade */}
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
        {p.colors.length > 0 && (
          <span className={`absolute left-3 top-3 bg-bone px-2 py-1 text-[10px] uppercase tracking-widest text-black transition-all duration-300 ${hovered ? "opacity-100" : "opacity-80"}`}>
            {lang === "fr" ? "Nouveau" : "New"}
          </span>
        )}
        {/* Hover overlay — subtle vignette */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`} />
        {/* Quick-shop hint */}
        <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-center py-3 transition-all duration-400 ease-luxury ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <span className="bg-black/80 backdrop-blur-sm px-4 py-1.5 text-[10px] uppercase tracking-widest text-bone border border-stone-700/50">
            {lang === "fr" ? "Voir le produit" : "View product"}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between">
        <div>
          <div className={`text-sm transition-all duration-300 ${hovered ? "text-white" : "text-bone"}`}>{p.name}</div>
          <div className="mt-0.5 text-xs text-stone-500">{color?.label[lang]}</div>
        </div>
        <div className={`text-sm transition-all duration-300 ${hovered ? "text-white" : "text-stone-300"}`}>€{p.price}</div>
      </div>
    </Link>
  );
}

/* ─── Skeleton card ─────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div>
      <div className="aspect-[4/5] w-full animate-shimmer rounded-none" />
      <div className="mt-4 h-3 w-32 animate-shimmer rounded" />
      <div className="mt-2 h-3 w-16 animate-shimmer rounded" />
    </div>
  );
}

/* ─── Homepage ──────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;

  const [products, setProducts] = useState<Product[]>(getActiveProducts());
  const [loading, setLoading] = useState(false);
  const [heroSection, setHeroSection] = useState<StorefrontSection | null>(null);
  const featured = products[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchActiveProducts().then((data) => {
      if (!cancelled && data.length > 0) setProducts(data);
      setLoading(false);
    });
    // Fetch live hero section from DB (non-blocking)
    fetchHomepageSections().then((sections) => {
      if (!cancelled) {
        const hero = sections.find((s) => s.type === "hero");
        if (hero) setHeroSection(hero);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const ticker    = useReveal(0.05);
  const collection = useReveal();
  const atelier   = useReveal();
  const manifesto = useReveal();
  const parallax  = useParallax(0.06);

  return (
    <div className="bg-black text-bone overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Cinematic video/image background — controlled from admin */}
        <VideoHero
          videoUrl={heroSection?.video_url ?? ""}
          posterUrl={heroSection?.image ?? ""}
        />

        {/* Fallback ambient gradient (when no video/image set) */}
        {!heroSection?.image && !heroSection?.video_url && (
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 70% at 65% 40%, #c8b89a14 0%, transparent 70%)",
            }}
          />
        )}
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(#e8e2d6 1px, transparent 1px), linear-gradient(90deg, #e8e2d6 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto flex max-w-7xl w-full flex-col items-center gap-12 px-6 py-28 md:flex-row md:py-32">
          {/* Left — text */}
          <div className="flex-1 z-10">
            <SplitLine
              className="text-[10px] uppercase tracking-[0.35em] text-stone-500"
              delay={100}
            >
              {t("home.heroEyebrow")} · CLÉ&nbsp;01™
            </SplitLine>
            <h1 className="mt-5 font-display leading-[1.0] tracking-tight">
              <span className="block text-5xl md:text-7xl overflow-hidden">
                <span
                  className="block text-gradient-gold"
                  style={{ animation: "clipInLeft 1s cubic-bezier(0.16,1,0.3,1) 200ms both" }}
                >
                  {heroSection ? (lang === "fr" ? heroSection.title_fr : heroSection.title_en) : "Campagne"}
                </span>
              </span>
              <span className="block text-5xl md:text-7xl mt-1 overflow-hidden">
                <span
                  className="block"
                  style={{ animation: "clipInLeft 1s cubic-bezier(0.16,1,0.3,1) 350ms both" }}
                >
                  {heroSection ? (lang === "fr" ? heroSection.subtitle_fr : heroSection.subtitle_en) : "CLÉ PARIS"}
                </span>
              </span>
              <span
                className="block text-3xl md:text-4xl mt-2 text-stone-400 font-light tracking-wide"
                style={{ animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 500ms both" }}
              >
                2026
              </span>
            </h1>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-stone-400 animate-fade-up delay-300">
              {heroSection
                ? (lang === "fr" ? heroSection.body_fr : heroSection.body_en)
                : "Streetwear haut de gamme façonné par la texture. Développé et produit avec une intégrité structurelle."}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-up delay-400">
              <Link
                to={heroSection?.link ?? "/collection"}
                className="light-sweep relative border border-bone/80 px-8 py-3.5 text-xs uppercase tracking-widest transition-all duration-400 ease-luxury hover:bg-bone hover:text-black hover:border-bone hover:shadow-[0_0_40px_rgba(232,226,214,0.12)] active:scale-[0.97]"
              >
                {t("home.ctaShop")}
              </Link>
              {featured && (
                <Link
                  to={`/product/${featured.slug}`}
                  className="px-8 py-3.5 text-xs uppercase tracking-widest text-stone-500 hover:text-bone transition-all duration-300 group flex items-center gap-2"
                >
                  Découvrir CLÉ 01™
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-14 flex gap-8 animate-fade-up delay-500">
              {[
                { value: "500", label: "GSM" },
                { value: "100%", label: lang === "fr" ? "Organique" : "Organic" },
                { value: "EU", label: lang === "fr" ? "Production" : "Made" },
              ].map(({ value, label }) => (
                <div key={label} className="group">
                  <div className="font-display text-2xl text-bone/90 transition-colors duration-300 group-hover:text-bone">{value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-stone-600 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating product image */}
          {featured && (
            <Link
              to={`/product/${featured.slug}`}
              className="flex-1 flex justify-center md:justify-end z-10"
            >
              <div className="relative">
                {/* Glow halo behind image */}
                <div className="absolute inset-0 scale-90 blur-[60px] bg-stone-700/20 rounded-full" />
                <img
                  src="/images/levitating_sweatshirt-Photoroom.png"
                  alt={featured.name}
                  className="relative w-full max-w-md object-contain animate-float will-change-transform drop-shadow-2xl transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
            </Link>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up delay-700">
          <div className="text-[9px] uppercase tracking-[0.4em] text-stone-700">Défiler</div>
          <div className="h-10 w-px bg-gradient-to-b from-stone-700 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────────────── */}
      <div ref={ticker.ref} className={`border-y border-stone-900 bg-stone-950 overflow-hidden transition-opacity duration-600 ${ticker.visible ? "opacity-100" : "opacity-0"}`}>
        <div className="flex animate-marquee whitespace-nowrap py-4">
          {/* Duplicate content for seamless loop */}
          {Array.from({ length: 2 }).map((_, outer) => (
            <div key={outer} className="flex flex-shrink-0 items-center gap-12 px-6">
              {[
                "100% Coton Biologique",
                "·",
                "Confectionné en Europe",
                "·",
                "500 GSM Dense Weave",
                "·",
                "Design Parisien",
                "·",
                "Édition Limitée",
                "·",
              ].map((item, i) => (
                <span key={i} className={`text-[10px] uppercase tracking-[0.25em] ${item === "·" ? "text-stone-700" : "text-stone-500"}`}>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── COLLECTION GRID ──────────────────────────────────────────────── */}
      <div ref={collection.ref} className="mx-auto max-w-7xl px-6 py-24">
        <div className={`flex items-end justify-between mb-12 transition-all duration-700 ease-luxury ${collection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-stone-600 mb-3">// La Collection</div>
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">Dernière collection</h2>
          </div>
          <Link
            to="/collection"
            className="group text-xs uppercase tracking-widest text-stone-500 hover:text-bone transition-colors duration-300 flex items-center gap-2"
          >
            Voir tout
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {collection.visible && products.slice(0, 3).map((p, i) => (
              <ProductCard key={p.slug} p={p} lang={lang} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── EDITORIAL DIVIDER ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-stone-800 to-transparent" />
      </div>

      {/* ── ATELIER SECTION ──────────────────────────────────────────────── */}
      <div ref={atelier.ref} className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
        {/* Image with parallax */}
        <div ref={parallax.ref} className="relative overflow-hidden">
          <img
            src="/images/sweat2_flat.jpg"
            alt="Texture"
            className="w-full object-cover transition-all duration-1000 ease-luxury group-hover:scale-[1.02]"
            style={{ transform: `translateY(${parallax.offset}px)` }}
          />
          {/* Luxury grain overlay */}
          <div className="absolute inset-0 mix-blend-overlay opacity-20 pointer-events-none"
            style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')" }}
          />
        </div>

        {/* Text */}
        <div className={`transition-all duration-800 ease-luxury ${atelier.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-[10px] uppercase tracking-[0.35em] text-stone-600 mb-4">Conception Paris</div>
          <h3 className="font-display text-3xl tracking-tight md:text-4xl leading-tight">
            Drapé &amp; silhouette<br />
            <span className="text-gradient-gold">architecturaux</span>
          </h3>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-stone-400">
            Développé dans nos ateliers parisiens pour garantir un tombé structurel parfait sans compromis. Chaque fil est sélectionné, chaque coupe est mesurée.
          </p>
          <Link
            to="/about"
            className="mt-10 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 hover:text-bone transition-all duration-300 group border-b border-stone-800 pb-1 hover:border-stone-500"
          >
            Lire la fiche
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>

          {/* Small details grid */}
          <div className="mt-12 grid grid-cols-2 gap-6 border-t border-stone-900 pt-8">
            {[
              { label: "Matière", value: "Coton BIO 500GSM" },
              { label: "Origine", value: "Portugal & EU" },
              { label: "Teinture", value: "OEKO-TEX® cert." },
              { label: "Édition", value: "Limitée 2026" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[9px] uppercase tracking-widest text-stone-700">{label}</div>
                <div className="mt-1 text-xs text-stone-300">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EDITORIAL DIVIDER ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-stone-800 to-transparent" />
      </div>

      {/* ── MANIFESTO ─────────────────────────────────────────────────────── */}
      <div ref={manifesto.ref}>
        <section className="bg-stone-950 relative overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{ background: "radial-gradient(ellipse 50% 60% at 50% 50%, #c8b89a 0%, transparent 70%)" }}
          />
          <div className="relative mx-auto max-w-3xl px-6 py-28 text-center">
            <div className={`transition-all duration-600 ease-luxury ${manifesto.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="text-[9px] uppercase tracking-[0.5em] text-stone-600 mb-6">// Notre Manifeste</div>
            </div>
            <h3 className={`font-display text-3xl tracking-tight md:text-5xl transition-all duration-700 delay-100 ease-luxury ${manifesto.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              L'Atelier Clé Paris
            </h3>
            <p className={`mt-8 text-sm leading-relaxed text-stone-300 max-w-2xl mx-auto transition-all duration-800 delay-200 ease-luxury ${manifesto.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              Chaque pièce est une réponse à la matière. Nous créons des formes intemporelles au tombé
              impeccable, alliant la rigueur de l'architecture à la douceur de textures d'exception.
              Loin du rythme effréné des tendances éphémères, nos créations sont pensées pour durer
              et structurer l'allure.
            </p>
            <div className={`mt-12 transition-all duration-900 delay-300 ease-luxury ${manifesto.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <Link
                to="/collection"
                className="light-sweep inline-block border border-stone-700 px-10 py-3.5 text-xs uppercase tracking-widest text-stone-300 hover:border-bone hover:text-bone transition-all duration-400 ease-luxury"
              >
                Explorer la collection
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
