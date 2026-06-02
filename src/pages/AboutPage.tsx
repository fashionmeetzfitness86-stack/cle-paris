export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F4EFE8]">
      <div className="mx-auto max-w-3xl px-6 py-32">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E]">
          // Notre Manifeste
        </div>
        <h1 className="mt-5 font-display text-4xl font-light tracking-tight text-[#111] md:text-5xl">
          L'Atelier Clé Paris
        </h1>
        <div className="mt-4 h-px w-10 bg-[#C8A97E]" />

        <div className="mt-12 space-y-6 text-sm leading-relaxed text-[#6F6F6F]">
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

        <div className="mt-16 grid gap-8 border-y border-black/8 py-12 text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] md:grid-cols-3">
          <div>
            <div className="text-[#6F6F6F]">Conception</div>
            <div className="mt-2 font-medium text-[#111]">Paris</div>
          </div>
          <div>
            <div className="text-[#6F6F6F]">Production</div>
            <div className="mt-2 font-medium text-[#111]">Portugal &amp; Europe</div>
          </div>
          <div>
            <div className="text-[#6F6F6F]">Contact</div>
            <a
              href="mailto:contact@cleparis.store"
              className="mt-2 block font-medium text-[#111] hover:text-[#C8A97E] transition-colors duration-300"
            >
              contact@cleparis.store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
