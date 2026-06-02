import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#2C2825] text-[#EFE7DD]">
      {/* Main grid */}
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        {/* Brand column */}
        <div className="md:col-span-2">
          <div className="font-display text-xl tracking-[0.45em] text-[#FAF7F2]">
            CLÉ&nbsp;PARIS
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-[#A89D92]">
            {t("footer.manifesto")}
          </p>
          <div className="mt-8 flex gap-5 text-[10px] uppercase tracking-[0.2em]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#7A706A] hover:text-[#C8A97E] transition-colors duration-300"
            >
              Instagram
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#7A706A] hover:text-[#C8A97E] transition-colors duration-300"
            >
              X / Twitter
            </a>
            <a
              href="mailto:contact@cleparis.store"
              className="text-[#7A706A] hover:text-[#C8A97E] transition-colors duration-300"
            >
              Email
            </a>
          </div>
        </div>

        {/* Boutique links */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#7A706A]">
            Boutique
          </h4>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link
                to="/collection"
                className="text-[#A89D92] hover:text-[#EFE7DD] transition-colors duration-300"
              >
                Collection
              </Link>
            </li>
            <li>
              <Link
                to="/archive"
                className="text-[#A89D92] hover:text-[#EFE7DD] transition-colors duration-300"
              >
                Archive
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-[#A89D92] hover:text-[#EFE7DD] transition-colors duration-300"
              >
                À Propos
              </Link>
            </li>
          </ul>
        </div>

        {/* Info links */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#7A706A]">
            Informations
          </h4>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link
                to="/legal/mentions"
                className="text-[#A89D92] hover:text-[#EFE7DD] transition-colors duration-300"
              >
                {t("footer.legal")}
              </Link>
            </li>
            <li>
              <Link
                to="/legal/conditions"
                className="text-[#A89D92] hover:text-[#EFE7DD] transition-colors duration-300"
              >
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <Link
                to="/legal/confidentialite"
                className="text-[#A89D92] hover:text-[#EFE7DD] transition-colors duration-300"
              >
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link
                to="/legal/livraison"
                className="text-[#A89D92] hover:text-[#EFE7DD] transition-colors duration-300"
              >
                {t("footer.shipping")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/5 px-6 py-5 text-center text-[10px] uppercase tracking-[0.2em] text-[#5A5249]">
        ©2026 CLÉ PARIS · {t("footer.rights")}
      </div>
    </footer>
  );
}
