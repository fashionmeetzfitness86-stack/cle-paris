import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-36 text-center animate-fade-up">
      <div className="font-display text-[120px] leading-none text-stone-900 select-none">404</div>
      <div className="text-[10px] uppercase tracking-[0.4em] text-stone-600 mt-2">
        Page introuvable
      </div>
      <h1 className="mt-6 font-display text-4xl tracking-tight animate-fade-up delay-100">
        Pièce introuvable
      </h1>
      <p className="mt-5 text-sm text-stone-500 animate-fade-up delay-200">
        Cette URL n'existe pas dans la collection actuelle.
      </p>
      <div className="mt-10 animate-fade-up delay-300">
        <Link
          to="/"
          className="light-sweep inline-block border border-stone-700 px-8 py-3 text-xs uppercase tracking-widest text-stone-400 hover:border-bone hover:text-bone transition-all duration-400 ease-luxury"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
