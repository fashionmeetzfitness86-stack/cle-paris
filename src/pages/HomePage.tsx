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
    <div className="bg-black text-bone">
      <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-24 md:flex-row md:py-32">
        <div className="flex-1">
          <div className="text-xs uppercase tracking-widest text-stone-500">
            {t("home.heroEyebrow")} · CLÉ&nbsp;01™
          </div>
          <h1 className="mt-6 font-display text-5xl tracking-tight md:text-7xl">
            Campagne<br />CLÉ PARIS 2026
          </h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-stone-400">
            Streetwear haut de gamme façonné par la texture. Développé et produit avec une intégrité structurelle.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              to="/collection"
              className="border border-bone px-6 py-3 text-xs uppercase tracking-widest hover:bg-bone hover:text-black"
            >
              {t("home.ctaShop")}
            </Link>
            {featured && (
              <Link
                to={`/product/${featured.slug}`}
                className="px-6 py-3 text-xs uppercase tracking-widest text-stone-400 hover:text-white"
              >
                Découvrir CLÉ 01™ →
              </Link>
            )}
          </div>
        </div>
        {featured && (
          <Link to={`/product/${featured.slug}`} className="flex-1">
            <img
              src="/images/levitating_sweatshirt-Photoroom.png"
              alt={featured.name}
              className="w-full max-w-xl object-contain"
            />
          </Link>
        )}
      </section>

      <section className="border-y border-stone-900 bg-stone-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-2 px-6 py-6 text-[10px] uppercase tracking-widest text-stone-500">
          <span>100% Coton Biologique</span>
          <span>·</span>
          <span>Confectionné en Europe</span>
          <span>·</span>
          <span>500 GSM Dense Weave</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">Dernière collection</h2>
          <Link to="/collection" className="text-xs uppercase tracking-widest text-stone-400 hover:text-white">
            Voir tous les modèles →
          </Link>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((p) => {
            const color = p.colors[0];
            return (
              <Link key={p.slug} to={`/product/${p.slug}`} className="group">
                <div className="overflow-hidden bg-stone-950">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
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
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
        <img src="/images/sweat2_flat.jpg" alt="Texture" className="w-full object-cover" />
        <div>
          <div className="text-xs uppercase tracking-widest text-stone-500">Conception Paris</div>
          <h3 className="mt-4 font-display text-3xl tracking-tight md:text-4xl">
            Drapé & silhouette architecturaux
          </h3>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-stone-400">
            Développé dans nos ateliers parisiens pour garantir un tombé structurel parfait sans compromis.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-block border-b border-bone pb-1 text-xs uppercase tracking-widest hover:text-white"
          >
            Lire la fiche →
          </Link>
        </div>
      </section>

      <section className="border-t border-stone-900 bg-stone-950">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="text-xs uppercase tracking-widest text-stone-500">// Notre Manifeste</div>
          <h3 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">L'Atelier Clé Paris</h3>
          <p className="mt-8 text-sm leading-relaxed text-stone-300">
            Chaque pièce est une réponse à la matière. Nous créons des formes intemporelles au tombé impeccable,
            alliant la rigueur de l'architecture à la douceur de textures d'exception. Loin du rythme effréné des
            tendances éphémères, nos créations sont pensées pour durer et structurer l'allure.
          </p>
        </div>
      </section>
    </div>
  );
}
