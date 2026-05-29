export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-32">
      <div className="text-xs uppercase tracking-widest text-stone-500">// Notre Manifeste</div>
      <h1 className="mt-6 font-display text-4xl tracking-tight md:text-6xl">L'Atelier Clé Paris</h1>

      <div className="mt-12 space-y-6 text-sm leading-relaxed text-stone-300">
        <p>
          Chaque pièce est une réponse à la matière. Nous créons des formes intemporelles au tombé impeccable,
          alliant la rigueur de l'architecture à la douceur de textures d'exception.
        </p>
        <p>
          Loin du rythme effréné des tendances éphémères, nos créations sont pensées pour durer et structurer
          l'allure. Chaque coupe est étudiée dans nos ateliers parisiens, chaque coton trié pour son grammage
          et sa tenue, chaque couture renforcée pour traverser les saisons.
        </p>
        <p>
          Notre vocabulaire est clair : silhouettes architecturales, matières denses, palette restreinte. Le
          superflu n'a pas sa place.
        </p>
      </div>

      <div className="mt-16 grid gap-8 border-y border-stone-900 py-12 text-xs uppercase tracking-widest text-stone-400 md:grid-cols-3">
        <div>
          <div className="text-stone-600">Conception</div>
          <div className="mt-2 text-bone">Paris</div>
        </div>
        <div>
          <div className="text-stone-600">Production</div>
          <div className="mt-2 text-bone">Portugal &amp; Europe</div>
        </div>
        <div>
          <div className="text-stone-600">Contact</div>
          <a href="mailto:contact@cleparis.store" className="mt-2 block text-bone hover:text-white">
            contact@cleparis.store
          </a>
        </div>
      </div>
    </div>
  );
}
