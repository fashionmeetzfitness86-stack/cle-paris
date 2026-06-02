import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F4EFE8] flex items-center justify-center">
      <div className="max-w-2xl px-6 py-32 text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E]">404</div>
        <h1 className="mt-5 font-display text-4xl font-light tracking-tight text-[#111] md:text-5xl">
          Pièce introuvable
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-[#6F6F6F]">
          Cette URL n'existe pas dans la collection actuelle.
        </p>
        <Link
          to="/"
          className="mt-10 inline-block border border-[#111] px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#111] hover:bg-[#111] hover:text-[#FAF7F2] transition-all duration-300 light-sweep"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
