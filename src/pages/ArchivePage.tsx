import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useArchivedProducts } from "../hooks/useProducts";

export default function ArchivePage() {
  const { t } = useTranslation();
  const { products: archived } = useArchivedProducts();

  return (
    <div className="min-h-screen bg-[#F4EFE8]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 border-b border-black/8 pb-10">
          <div className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#C8A97E]">
            {t("archive.eyebrow")}
          </div>
          <h1 className="font-display text-4xl font-light tracking-tight text-[#111] md:text-5xl">
            {t("archive.title")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#6F6F6F]">
            {t("archive.subtitle")}
          </p>
        </div>

        {archived.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F]">
              {t("archive.empty")}
            </p>
            <div className="mt-8">
              <Link
                to="/collection"
                className="inline-block border border-[#111] px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[#111] hover:bg-[#111] hover:text-[#FAF7F2] transition-all duration-300"
              >
                {t("archive.cta")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((p) => (
              <Link key={p.slug} to={`/product/${p.slug}`} className="group">
                <div className="overflow-hidden bg-[#E7DDD1]">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="aspect-[4/5] w-full object-cover opacity-70 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="font-medium text-[#111]">{p.name}</span>
                  <span className="text-[11px] uppercase tracking-wider text-[#C8A97E]">{t("archive.badge")}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
