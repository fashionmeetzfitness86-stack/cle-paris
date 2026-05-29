import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <div className="text-xs uppercase tracking-widest text-stone-500">404</div>
      <h1 className="mt-4 font-display text-5xl tracking-tight">Pièce introuvable</h1>
      <p className="mt-6 text-sm text-stone-400">Cette URL n'existe pas dans la collection actuelle.</p>
      <Link
        to="/"
        className="mt-10 inline-block border border-bone px-6 py-3 text-xs uppercase tracking-widest hover:bg-bone hover:text-black"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
