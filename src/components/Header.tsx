import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../store/cart";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { items, toggle } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);

  const switchLang = () => {
    const next = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(next);
    localStorage.setItem("cle-lang", next);
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-xs tracking-widest uppercase transition-opacity ${isActive ? "opacity-100" : "opacity-60 hover:opacity-100"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-800 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <nav className="flex items-center gap-6">
          <NavLink to="/collection" className={navClass}>
            {t("nav.collection")}
          </NavLink>
          <NavLink to="/archive" className={navClass}>
            {t("nav.archive")}
          </NavLink>
          <NavLink to="/about" className={navClass}>
            {t("nav.about")}
          </NavLink>
        </nav>
        <Link to="/" className="font-display text-lg tracking-[0.4em]">
          CLÉ&nbsp;PARIS
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={switchLang}
            className="text-xs tracking-widest opacity-60 hover:opacity-100"
            aria-label="Toggle language"
          >
            {i18n.language === "fr" ? "FR | en" : "fr | EN"}
          </button>
          <button
            onClick={toggle}
            className="text-xs tracking-widest opacity-60 hover:opacity-100"
            aria-label={t("nav.cart")}
          >
            {t("nav.cart")} [{count}]
          </button>
        </div>
      </div>
    </header>
  );
}
