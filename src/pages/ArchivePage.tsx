import { Link } from "react-router-dom";
import { getArchivedProducts } from "../data/products";

export default function ArchivePage() {
  const archived = getArchivedProducts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      <div className="border-b border-stone-800 pb-8">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">Archive</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-400">
          Pièces des saisons passées, conservées comme témoins de l'évolution du langage Clé Paris.
        </p>
      </div>

      {archived.length === 0 ? (
        <div className="mt-24 text-center text-sm uppercase tracking-widest text-stone-500">
          L'archive sera publiée à la rotation suivante.
          <div className="mt-6">
            <Link to="/collection" className="border border-bone px-6 py-3 hover:bg-bone hover:text-black">
              Voir la collection actuelle →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-12 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {archived.map((p) => (
            <Link key={p.slug} to={`/product/${p.slug}`} className="group">
              <img
                src={p.images[0]}
                alt={p.name}
                className="aspect-[4/5] w-full bg-stone-950 object-cover opacity-80 transition group-hover:opacity-100"
              />
              <div className="mt-4 flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-stone-500">Archive</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
