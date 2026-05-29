import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-stone-800 bg-black">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl tracking-[0.4em]">CLÉ&nbsp;PARIS</div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-stone-400">{t("footer.manifesto")}</p>
          <div className="mt-6 flex gap-4 text-xs uppercase tracking-widest text-stone-500">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-stone-200">
              Instagram
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-stone-200">
              X
            </a>
            <a href="mailto:contact@cleparis.store" className="hover:text-stone-200">
              Email
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-stone-500">Boutique</h4>
          <ul className="mt-4 space-y-2 text-sm text-stone-300">
            <li>
              <Link to="/collection" className="hover:text-white">
                Collection
              </Link>
            </li>
            <li>
              <Link to="/archive" className="hover:text-white">
                Archive
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white">
                À Propos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-stone-500">Informations</h4>
          <ul className="mt-4 space-y-2 text-sm text-stone-300">
            <li>
              <Link to="/legal/mentions" className="hover:text-white">
                {t("footer.legal")}
              </Link>
            </li>
            <li>
              <Link to="/legal/conditions" className="hover:text-white">
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <Link to="/legal/confidentialite" className="hover:text-white">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link to="/legal/livraison" className="hover:text-white">
                {t("footer.shipping")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-900 px-6 py-6 text-center text-[10px] uppercase tracking-widest text-stone-600">
        ©2026 CLÉ PARIS. {t("footer.rights")}
      </div>
    </footer>
  );
}
