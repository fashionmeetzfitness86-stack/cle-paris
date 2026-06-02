import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getActiveProducts } from "../data/products";
import type { Lang } from "../types";

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const products = getActiveProducts();
  const featured = products[0];

  return (
    <div className="bg-[#F4EFE8] text-[#111]">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-24 md:flex-row md:items-center md:py-36">
        {/* Left — editorial text */}
        <div className="flex-1 max-w-xl">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] animate-fade-up" style={{ animationDelay: "100ms" }}>
            {t("home.heroEyebrow")} · CLÉ&nbsp;01™
          </div>
          <h1 className="mt-5 font-display text-5xl font-light leading-[1.05] tracking-tight text-[#111] md:text-6xl lg:text-7xl animate-clip-left" style={{ animationDelay: "200ms" }}>
            Campagne<br />
            <em className="not-italic text-[#C8A97E]">CLÉ</em> PARIS<br />
            2026
          </h1>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-[#6F6F6F] animate-fade-up" style={{ animationDelay: "500ms" }}>
            Streetwear haut de gamme façonné par la texture. Développé et produit avec une intégrité structurelle dans nos ateliers européens.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "650ms" }}>
            <Link
              to="/collection"
              className="border border-[#111] px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#111] hover:bg-[#111] hover:text-[#FAF7F2] transition-all duration-300 light-sweep"
            >
              {t("home.ctaShop")}
            </Link>
            {featured && (
              <Link
                to={`/product/${featured.slug}`}
                className="px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] hover:text-[#111] transition-colors duration-300 border border-transparent hover:border-black/10"
              >
                Découvrir CLÉ 01™ →
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
              className="w-full max-w-lg object-contain animate-float drop-shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
            />
          </Link>
        )}
      </section>

      {/* ── MARQUEE / TRUST BAR ──────────────────────────────────────────── */}
      <div className="border-y border-black/8 bg-[#EFE7DD]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-6 py-4 text-[10px] uppercase tracking-[0.25em] text-[#6F6F6F]">
          <span>100% Coton Biologique</span>
          <span className="text-[#C8A97E]">·</span>
          <span>Confectionné en Europe</span>
          <span className="text-[#C8A97E]">·</span>
          <span>480 – 500 GSM Dense Weave</span>
          <span className="text-[#C8A97E]">·</span>
          <span>Livraison Gratuite dès 150 €</span>
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#C8A97E]">
              Ateliers CLÉ Paris
            </div>
            <h2 className="mt-2 font-display text-3xl font-light tracking-tight text-[#111] md:text-4xl">
              Dernière collection
            </h2>
          </div>
          <Link
            to="/collection"
            className="text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] hover:text-[#111] hover:text-[#C8A97E] transition-colors duration-300 border-b border-transparent hover:border-[#C8A97E] pb-0.5"
          >
            Voir tous les modèles →
          </Link>
        </div>

        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((p, i) => {
            const color = p.colors[0];
            return (
              <Link
                key={p.slug}
                to={`/product/${p.slug}`}
                className="group block"
              >
                <div
                  className="relative overflow-hidden bg-[#EFE7DD] shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow duration-500 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)]"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {p.images[1] && (
                    <img
                      src={p.images[1]}
                      alt={`${p.name} view 2`}
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  )}
                  <span className="absolute left-3 top-3 bg-[#C8A97E] px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white">
                    {lang === "fr" ? "Nouveau" : "New"}
                  </span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-[#111] group-hover:text-[#C8A97E] transition-colors duration-300">
                      {p.name}
                    </div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-wider text-[#6F6F6F]">
                      {color.label[lang]}
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

      {/* ── EDITORIAL STRIP — Texture & Architecture ─────────────────────── */}
      <section className="bg-[#EFE7DD]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
          <div className="overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.08)]">
            <img
              src="/images/sweat2_flat.jpg"
              alt="Texture CLÉ Paris"
              className="w-full object-cover transition-transform duration-1000 hover:scale-105"
            />
          </div>
          <div className="md:pl-8">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#C8A97E]">
              Conception Paris
            </div>
            <h3 className="mt-4 font-display text-3xl font-light tracking-tight text-[#111] md:text-4xl">
              Drapé &amp; silhouette<br />
              <em className="not-italic text-[#C8A97E]">architecturaux</em>
            </h3>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#6F6F6F]">
              Développé dans nos ateliers parisiens pour garantir un tombé structurel parfait sans compromis. Chaque couture est pensée comme une ligne architecturale.
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
              <div>
                <div className="text-[9px] uppercase tracking-[0.25em] text-[#6F6F6F]">Fabrication</div>
                <div className="mt-1 text-sm font-medium text-[#111]">Ateliers Europe</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.25em] text-[#6F6F6F]">Matière</div>
                <div className="mt-1 text-sm font-medium text-[#111]">480–500 GSM Cotton</div>
              </div>
            </div>
            <Link
              to="/about"
              className="mt-8 inline-block border-b border-[#C8A97E] pb-1 text-[11px] uppercase tracking-[0.2em] text-[#C8A97E] hover:text-[#111] hover:border-[#111] transition-all duration-300"
            >
              Lire la fiche →
            </Link>
          </div>
        </div>
      </section>

      {/* ── MANIFESTE ───────────────────────────────────────────────────── */}
      <section className="bg-[#E7DDD1]">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E]">
            // Notre Manifeste
          </div>
          <h3 className="mt-6 font-display text-3xl font-light tracking-tight text-[#111] md:text-4xl">
            L'Atelier Clé Paris
          </h3>
          <div className="mx-auto mt-4 h-px w-12 bg-[#C8A97E]" />
          <p className="mt-8 text-sm leading-relaxed text-[#6F6F6F]">
            Chaque pièce est une réponse à la matière. Nous créons des formes intemporelles au tombé impeccable,
            alliant la rigueur de l'architecture à la douceur de textures d'exception. Loin du rythme effréné des
            tendances éphémères, nos créations sont pensées pour durer et structurer l'allure.
          </p>
          <Link
            to="/collection"
            className="mt-10 inline-block border border-[#111] px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#111] hover:bg-[#111] hover:text-[#FAF7F2] transition-all duration-300 light-sweep"
          >
            Découvrir la collection
          </Link>
        </div>
      </section>

    </div>
  );
}
