import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchLegalPage } from "../lib/storefront";
import type { Lang } from "../types";

// ── Static fallback content ───────────────────────────────────────
const STATIC_LEGAL: Record<string, { title: { fr: string; en: string }; body: { fr: string; en: string } }> = {
  mentions: {
    title: { fr: "Mentions légales", en: "Legal Notice" },
    body: {
      fr: `Le site cle-paris.com est édité par CLÉ PARIS, marque indépendante.\nPour toute question d'ordre légal, contacter Clepariscollection@gmail.com.\n\nHébergement : Netlify.\nDirectrice de la publication : à compléter.`,
      en: `The cle-paris.com website is published by CLÉ PARIS, an independent brand.\nFor any legal questions, contact Clepariscollection@gmail.com.\n\nHosting: Netlify.`,
    },
  },
  conditions: {
    title: { fr: "Conditions générales de vente", en: "Terms & Conditions" },
    body: {
      fr: `Tout achat sur cle-paris.com est soumis aux présentes conditions.\nLes prix sont indiqués en euros, TTC. Le paiement est sécurisé via Stripe.\nLa livraison intervient sous 5 à 10 jours ouvrés en Union Européenne.\nLes retours sont acceptés dans un délai de 14 jours suivant réception.`,
      en: `All purchases on cle-paris.com are subject to these terms.\nPrices are shown in euros, inclusive of VAT. Payment is secured via Stripe.\nDelivery within 5–10 working days in the European Union.\nReturns accepted within 14 days of receipt.`,
    },
  },
  confidentialite: {
    title: { fr: "Politique de confidentialité", en: "Privacy Policy" },
    body: {
      fr: `CLÉ PARIS collecte uniquement les données nécessaires au traitement de votre commande\n(nom, adresse, e-mail) et au respect de ses obligations légales.\nAucune donnée n'est cédée à des tiers à des fins commerciales.\nVous disposez d'un droit d'accès, de rectification et d'effacement à tout moment.`,
      en: `CLÉ PARIS only collects data required to process your order\n(name, address, email) and to comply with legal obligations.\nNo data is shared with third parties for commercial purposes.\nYou have the right to access, correct and delete your data at any time.`,
    },
  },
  livraison: {
    title: { fr: "Livraisons & retours", en: "Shipping & Returns" },
    body: {
      fr: `Livraison gratuite à partir de 150 € en France métropolitaine.\nExpéditions sous 48 h ouvrées, suivi inclus.\nRetours acceptés dans les 30 jours suivant réception, frais à la charge du client.\nLes articles doivent être retournés non portés, dans leur emballage d'origine.`,
      en: `Free shipping from €150 in metropolitan France.\nShipped within 48 working hours, tracking included.\nReturns accepted within 30 days of receipt, return shipping costs are the customer's responsibility.\nItems must be returned unworn, in their original packaging.`,
    },
  },
};

// Map URL slug to DB slug
const SLUG_MAP: Record<string, string> = {
  mentions:       "mentions-legales",
  conditions:     "cgv",
  confidentialite: "confidentialite",
  livraison:      "livraison-retours",
};

export default function LegalPage() {
  const { slug = "mentions" } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;

  const staticPage = STATIC_LEGAL[slug] ?? STATIC_LEGAL.mentions;
  const [title, setTitle] = useState(staticPage.title[lang]);
  const [body, setBody]   = useState(staticPage.body[lang]);

  useEffect(() => {
    // Reset to static content when slug changes
    const page = STATIC_LEGAL[slug] ?? STATIC_LEGAL.mentions;
    setTitle(page.title[lang]);
    setBody(page.body[lang]);

    // Try fetching live content from DB
    const dbSlug = SLUG_MAP[slug] ?? slug;
    fetchLegalPage(dbSlug).then((data) => {
      if (data) {
        setTitle(lang === "fr" ? data.title_fr : data.title_en);
        setBody(lang === "fr" ? data.body_fr : data.body_en);
      }
    });
  }, [slug, lang]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-24 animate-fade-up">
      <Link
        to="/"
        className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-600 hover:text-bone transition-colors duration-300 mb-10"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
        {t("common.back")}
      </Link>

      <div className="h-px bg-gradient-to-r from-stone-800 to-transparent mb-10 animate-fade-up delay-75" />

      <h1 className="font-display text-4xl tracking-tight animate-fade-up delay-100">
        {title}
      </h1>

      <div className="mt-8 whitespace-pre-line text-sm leading-loose text-stone-400 animate-fade-up delay-200">
        {body}
      </div>
    </div>
  );
}
