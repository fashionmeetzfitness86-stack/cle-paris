import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F4EFE8]">
      <div className="mx-auto max-w-3xl px-6 py-32">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E]">
          {t("about.eyebrow")}
        </div>
        <h1 className="mt-5 font-display text-4xl font-light tracking-tight text-[#111] md:text-5xl">
          {t("about.title")}
        </h1>
        <div className="mt-4 h-px w-10 bg-[#C8A97E]" />

        <div className="mt-12 space-y-6 text-sm leading-relaxed text-[#6F6F6F]">
          <p>{t("about.p1")}</p>
          <p>{t("about.p2")}</p>
          <p>{t("about.p3")}</p>
        </div>

        <div className="mt-16 grid gap-8 border-y border-black/8 py-12 text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] md:grid-cols-3">
          <div>
            <div className="text-[#6F6F6F]">{t("about.conception")}</div>
            <div className="mt-2 font-medium text-[#111]">{t("about.conceptionValue")}</div>
          </div>
          <div>
            <div className="text-[#6F6F6F]">{t("about.production")}</div>
            <div className="mt-2 font-medium text-[#111]">{t("about.productionValue")}</div>
          </div>
          <div>
            <div className="text-[#6F6F6F]">{t("about.contact")}</div>
            <a
              href="mailto:Clepariscollection@gmail.com"
              className="mt-2 block font-medium text-[#111] hover:text-[#C8A97E] transition-colors duration-300"
            >
              Clepariscollection@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
