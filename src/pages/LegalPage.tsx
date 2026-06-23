import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchLegalPage } from "../lib/storefront";
import type { Lang } from "../types";

// ── Static fallback content ───────────────────────────────────────
// NOTE: fields in [crochets] are placeholders only you can fill
// (identité légale de l'éditeur). Tout le reste est définitif.
const STATIC_LEGAL: Record<string, { title: { fr: string; en: string }; body: { fr: string; en: string } }> = {
  mentions: {
    title: { fr: "Mentions légales", en: "Legal Notice" },
    body: {
      fr: `ÉDITEUR DU SITE
Le site cle-paris.com est édité par CLÉ PARIS, marque indépendante de prêt-à-porter.
Contact : Clepariscollection@gmail.com

Responsable de la publication : [nom du responsable]
Forme juridique : [micro-entreprise / société — à compléter]
SIRET : [numéro SIRET]
Adresse : [adresse de l'éditeur]

HÉBERGEMENT
Le site est hébergé par Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis — netlify.com.

PROPRIÉTÉ INTELLECTUELLE
L'ensemble des contenus du site (textes, visuels, logo, créations et photographies) est la propriété exclusive de CLÉ PARIS et est protégé par le droit de la propriété intellectuelle. Toute reproduction ou utilisation, totale ou partielle, sans autorisation écrite préalable est interdite.

CONTACT
Pour toute question, écrivez-nous à Clepariscollection@gmail.com.`,
      en: `SITE PUBLISHER
The cle-paris.com website is published by CLÉ PARIS, an independent ready-to-wear brand.
Contact: Clepariscollection@gmail.com

Publication manager: [manager name]
Legal status: [sole trader / company — to complete]
Registration no.: [registration number]
Address: [publisher address]

HOSTING
The site is hosted by Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, USA — netlify.com.

INTELLECTUAL PROPERTY
All content on this site (text, visuals, logo, designs and photographs) is the exclusive property of CLÉ PARIS and is protected by intellectual property law. Any reproduction or use, in whole or in part, without prior written consent is prohibited.

CONTACT
For any question, write to us at Clepariscollection@gmail.com.`,
    },
  },
  conditions: {
    title: { fr: "Conditions générales de vente", en: "Terms & Conditions" },
    body: {
      fr: `1. OBJET
Les présentes conditions régissent la vente des articles proposés sur cle-paris.com par CLÉ PARIS. Toute commande implique l'acceptation pleine et entière des présentes CGV.

2. PRIX
Les prix sont indiqués en euros (€), toutes taxes comprises. CLÉ PARIS se réserve le droit de modifier ses prix à tout moment ; les articles sont facturés au tarif en vigueur lors de la validation de la commande.

3. COMMANDE
La commande est validée après confirmation du paiement. Un e-mail de confirmation récapitulant la commande vous est adressé.

4. PAIEMENT
Le paiement s'effectue en ligne, de manière sécurisée, via Stripe (carte bancaire). Aucune donnée de carte n'est stockée par CLÉ PARIS.

5. LIVRAISON
Les commandes sont expédiées sous 48 h ouvrées. La livraison gratuite s'applique dès 150 € d'achat ; en deçà, des frais de livraison s'appliquent et sont indiqués avant paiement. Les délais varient selon la destination (2 à 5 jours ouvrés en Union Européenne).

6. DROIT DE RÉTRACTATION & RETOURS
Conformément à la loi, vous disposez de 14 jours pour exercer votre droit de rétractation. CLÉ PARIS accepte les retours dans un délai de 30 jours suivant la réception. Les articles doivent être retournés non portés, non lavés, dans leur état et leur emballage d'origine. Les frais de retour sont à la charge du client, sauf article défectueux.

7. REMBOURSEMENT
Le remboursement intervient dans un délai de 14 jours après réception et vérification du retour, par le même moyen de paiement.

8. GARANTIES
Les produits bénéficient des garanties légales de conformité et contre les vices cachés.

9. CONTACT
Pour toute question relative à une commande : Clepariscollection@gmail.com.`,
      en: `1. PURPOSE
These terms govern the sale of items offered on cle-paris.com by CLÉ PARIS. Any order implies full acceptance of these Terms & Conditions.

2. PRICES
Prices are shown in euros (€), inclusive of all taxes. CLÉ PARIS may change its prices at any time; items are invoiced at the rate in effect when the order is confirmed.

3. ORDERS
An order is confirmed once payment is approved. A confirmation email summarising the order is sent to you.

4. PAYMENT
Payment is made online, securely, via Stripe (credit/debit card). No card data is stored by CLÉ PARIS.

5. SHIPPING
Orders are dispatched within 48 working hours. Free shipping applies from €150; below that, shipping fees apply and are shown before payment. Delivery times vary by destination (2–5 working days within the European Union).

6. RIGHT OF WITHDRAWAL & RETURNS
In accordance with the law, you have 14 days to exercise your right of withdrawal. CLÉ PARIS accepts returns within 30 days of receipt. Items must be returned unworn, unwashed, in their original condition and packaging. Return shipping costs are the customer's responsibility, except for defective items.

7. REFUNDS
Refunds are issued within 14 days of receiving and inspecting the return, using the original payment method.

8. WARRANTIES
Products benefit from the legal warranties of conformity and against hidden defects.

9. CONTACT
For any question about an order: Clepariscollection@gmail.com.`,
    },
  },
  confidentialite: {
    title: { fr: "Politique de confidentialité", en: "Privacy Policy" },
    body: {
      fr: `CLÉ PARIS attache une grande importance à la protection de vos données personnelles.

DONNÉES COLLECTÉES
Nous collectons uniquement les données nécessaires au traitement de vos commandes : nom, prénom, adresse de livraison, adresse e-mail, numéro de téléphone et détails de la commande.

FINALITÉS
Ces données servent à traiter et expédier vos commandes, à vous tenir informé(e) de leur suivi, à répondre à vos demandes et à respecter nos obligations légales et comptables.

PAIEMENT
Les paiements sont traités par Stripe. Vos données bancaires sont transmises directement à Stripe de manière sécurisée et ne sont jamais stockées par CLÉ PARIS.

CONSERVATION
Vos données sont conservées pour la durée nécessaire au traitement des commandes et au respect des obligations légales, puis supprimées ou anonymisées.

PARTAGE
Aucune donnée n'est vendue ni cédée à des tiers à des fins commerciales. Elles ne sont partagées qu'avec nos prestataires strictement nécessaires (paiement, livraison).

VOS DROITS
Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité de vos données. Pour les exercer : Clepariscollection@gmail.com.

COOKIES
Le site utilise des cookies essentiels à son fonctionnement (panier, préférence de langue). Aucun cookie publicitaire n'est utilisé sans votre consentement.`,
      en: `CLÉ PARIS takes the protection of your personal data very seriously.

DATA COLLECTED
We only collect the data needed to process your orders: first and last name, delivery address, email address, phone number and order details.

PURPOSES
This data is used to process and ship your orders, keep you informed of their status, respond to your requests, and comply with our legal and accounting obligations.

PAYMENT
Payments are processed by Stripe. Your card details are sent directly to Stripe securely and are never stored by CLÉ PARIS.

RETENTION
Your data is kept for the time needed to process orders and meet legal obligations, then deleted or anonymised.

SHARING
No data is sold or shared with third parties for commercial purposes. It is shared only with the providers strictly necessary (payment, shipping).

YOUR RIGHTS
In accordance with the GDPR, you have the right to access, rectify, erase, object to and port your data. To exercise these rights: Clepariscollection@gmail.com.

COOKIES
The site uses cookies essential to its operation (cart, language preference). No advertising cookies are used without your consent.`,
    },
  },
  livraison: {
    title: { fr: "Livraison & retours", en: "Shipping & Returns" },
    body: {
      fr: `LIVRAISON
Les commandes sont préparées et expédiées sous 48 h ouvrées. Un numéro de suivi vous est communiqué dès l'expédition.

FRAIS DE LIVRAISON
La livraison est offerte dès 150 € d'achat. En dessous de ce montant, des frais de livraison s'appliquent et sont affichés clairement avant le paiement.

DÉLAIS
Comptez en moyenne 2 à 5 jours ouvrés en Union Européenne après expédition. Les délais peuvent varier selon la destination et le transporteur.

RETOURS
Vous disposez de 30 jours après réception pour retourner un article. Les articles doivent être non portés, non lavés et retournés dans leur emballage d'origine, accompagnés de la preuve d'achat. Les frais de retour sont à la charge du client, sauf en cas d'article défectueux ou d'erreur de notre part.

REMBOURSEMENT
Une fois le retour reçu et vérifié, le remboursement est effectué sous 14 jours sur le moyen de paiement initial.

CONTACT
Pour organiser un retour ou pour toute question : Clepariscollection@gmail.com.`,
      en: `SHIPPING
Orders are prepared and dispatched within 48 working hours. A tracking number is sent to you as soon as your order ships.

SHIPPING COSTS
Shipping is free from €150. Below that amount, shipping fees apply and are shown clearly before payment.

DELIVERY TIMES
Allow on average 2–5 working days within the European Union after dispatch. Times may vary by destination and carrier.

RETURNS
You have 30 days from receipt to return an item. Items must be unworn, unwashed and returned in their original packaging, with proof of purchase. Return shipping costs are the customer's responsibility, except for a defective item or an error on our part.

REFUNDS
Once the return is received and inspected, the refund is issued within 14 days to the original payment method.

CONTACT
To arrange a return or for any question: Clepariscollection@gmail.com.`,
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

    // Try fetching live content from DB. Only override the static
    // fallback when the DB actually has non-empty content, so an empty
    // or unseeded row never blanks the page.
    const dbSlug = SLUG_MAP[slug] ?? slug;
    fetchLegalPage(dbSlug).then((data) => {
      if (!data) return;
      const dbTitle = lang === "fr" ? data.title_fr : data.title_en;
      const dbBody = lang === "fr" ? data.body_fr : data.body_en;
      if (dbTitle?.trim()) setTitle(dbTitle);
      if (dbBody?.trim()) setBody(dbBody);
    });
  }, [slug, lang]);

  return (
    <div className="min-h-screen bg-[#F4EFE8]">
    <div className="mx-auto max-w-3xl px-6 py-24 animate-fade-up">
      <Link
        to="/"
        className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#6F6F6F] hover:text-[#111] transition-colors duration-300 mb-10"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
        {t("common.back")}
      </Link>

      <div className="h-px bg-gradient-to-r from-[#C8A97E] to-transparent mb-10 animate-fade-up delay-75" />

      <h1 className="font-display text-4xl tracking-tight text-[#111] animate-fade-up delay-100">
        {title}
      </h1>

      <div className="mt-8 whitespace-pre-line text-sm leading-loose text-[#4A4A4A] animate-fade-up delay-200">
        {body}
      </div>
    </div>
    </div>
  );
}
