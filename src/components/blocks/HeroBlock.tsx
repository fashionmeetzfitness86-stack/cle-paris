import VideoHero from "../VideoHero";
import SplitText, { SplitLine } from "../SplitText";
import { Link } from "react-router-dom";
import type { StorefrontSection } from "../../lib/storefront";
import type { Lang } from "../../types";

interface Props {
  section: StorefrontSection;
  lang: Lang;
}

export function HeroBlock({ section, lang }: Props) {
  const title    = lang === "fr" ? section.title_fr    : section.title_en;
  const subtitle = lang === "fr" ? section.subtitle_fr : section.subtitle_en;
  const body     = lang === "fr" ? section.body_fr     : section.body_en;

  return (
    <section className="relative min-h-[92vh] flex items-end">
      {/* Cinematic background */}
      <VideoHero
        videoUrl={section.video_url ?? ""}
        posterUrl={section.image}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 md:pb-24">
        <div className="max-w-xl">
          {subtitle && (
            <SplitLine
              className="block text-[10px] uppercase tracking-[0.35em] text-stone-400 mb-6"
              delay={200}
            >
              {subtitle}
            </SplitLine>
          )}

          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight text-bone">
            <SplitText
              text={title || "CLÉ PARIS"}
              delay={400}
              stagger={80}
              duration={1000}
            />
          </h1>

          {body && (
            <SplitLine
              className="block mt-6 text-sm text-stone-400 leading-relaxed"
              delay={700}
            >
              {body}
            </SplitLine>
          )}

          {section.link && (
            <div
              className="mt-10 inline-block"
              style={{ animation: "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 900ms both" }}
            >
              <Link
                to={section.link}
                className="light-sweep inline-block border border-bone/60 px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-bone hover:border-bone transition-colors duration-500"
              >
                Découvrir
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
