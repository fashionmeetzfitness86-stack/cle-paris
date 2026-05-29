import { useParams, Link } from "react-router-dom";

const LEGAL: Record<string, { title: string; body: string }> = {
  mentions: {
    title: "Mentions légales",
    body: `Le site cle-paris.com est édité par CLÉ PARIS, marque indépendante.
Pour toute question d'ordre légal, contacter contact@cleparis.store.

Hébergement : Netlify.
Directrice de la publication : à compléter.`,
  },
  conditions: {
    title: "Conditions générales de vente",
    body: `Tout achat sur cle-paris.com est soumis aux présentes conditions.
Les prix sont indiqués en euros, TTC. Le paiement est sécurisé via Stripe.
La livraison intervient sous 5 à 10 jours ouvrés en Union Européenne.
Les retours sont acceptés dans un délai de 14 jours suivant réception.`,
  },
  confidentialite: {
    title: "Politique de confidentialité",
    body: `CLÉ PARIS collecte uniquement les données nécessaires au traitement de votre commande
(nom, adresse, e-mail) et au respect de ses obligations légales.
Aucune donnée n'est cédée à des tiers à des fins commerciales.
Vous disposez d'un droit d'accès, de rectification et d'effacement à tout moment.`,
  },
  livraison: {
    title: "Livraisons & retours",
    body: `Livraison gratuite à partir de 200 € en France métropolitaine.
Expéditions sous 48 h ouvrées, suivi inclus.
Retours acceptés dans les 14 jours suivant réception, frais à la charge du client.
Les articles doivent être retournés non portés, dans leur emballage d'origine.`,
  },
};

export default function LegalPage() {
  const { slug = "mentions" } = useParams();
  const page = LEGAL[slug] ?? LEGAL.mentions;

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <Link to="/" className="text-xs uppercase tracking-widest text-stone-500 hover:text-white">
        ← Retour
      </Link>
      <h1 className="mt-8 font-display text-4xl tracking-tight">{page.title}</h1>
      <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-stone-300">{page.body}</div>
    </div>
  );
}
