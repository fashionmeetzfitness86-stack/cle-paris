import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../store/cart";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { items, toggle } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const switchLang = () => {
    const next = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(next);
    localStorage.setItem("cle-lang", next);
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-[11px] uppercase tracking-[0.2em] transition-all duration-300 pb-0.5 ${
      isActive
        ? "text-[#111] border-b border-[#111]"
        : "text-[#6F6F6F] hover:text-[#111] border-b border-transparent hover:border-[#111]"
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "bg-[#F4EFE8]/95 backdrop-blur-md border-b border-black/8 shadow-[0_1px_20px_rgba(0,0,0,0.06)]"
            : "bg-[#F4EFE8]/80 backdrop-blur-sm border-b border-black/5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Left nav */}
          <nav className="hidden items-center gap-8 md:flex">
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

          {/* Wordmark — centered logo */}
          <Link
            to="/"
            aria-label="CLÉ PARIS"
            className="transition-opacity duration-300 hover:opacity-70"
          >
            <img
              src="/images/cle-logo.png"
              alt="CLÉ PARIS"
              className="h-7 w-auto md:h-8"
            />
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-5">
            <button
              onClick={switchLang}
              className="hidden text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] transition-colors duration-300 md:block"
              aria-label={i18n.language === "fr" ? t("common.switchToEnglish") : t("common.switchToFrench")}
            >
              <span className={i18n.language === "fr" ? "text-[#111]" : "hover:text-[#111]"}>FR</span>
              <span className="px-1 text-[#C8A97E]">·</span>
              <span className={i18n.language === "en" ? "text-[#111]" : "hover:text-[#111]"}>EN</span>
            </button>
            <button
              onClick={toggle}
              className="relative text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F] hover:text-[#111] transition-colors duration-300"
              aria-label={t("nav.cart")}
            >
              {t("nav.cart")}
              {count > 0 && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#C8A97E] text-[9px] text-white font-semibold">
                  {count}
                </span>
              )}
            </button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col gap-1.5 md:hidden"
              aria-label="Menu"
            >
              <span
                className={`block h-px w-5 bg-[#111] transition-transform duration-300 ${menuOpen ? "translate-y-2.5 rotate-45" : ""}`}
              />
              <span
                className={`block h-px w-5 bg-[#111] transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-px w-5 bg-[#111] transition-transform duration-300 ${menuOpen ? "-translate-y-2.5 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <div
        className={`fixed inset-0 z-30 transition-all duration-500 md:hidden ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-[#111]/30 backdrop-blur-sm transition-opacity duration-500 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <nav
          className={`absolute top-[57px] left-0 right-0 bg-[#F4EFE8] border-b border-black/8 px-6 py-8 flex flex-col gap-6 transition-all duration-500 ${
            menuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <NavLink to="/collection" className={navClass} onClick={() => setMenuOpen(false)}>
            {t("nav.collection")}
          </NavLink>
          <NavLink to="/archive" className={navClass} onClick={() => setMenuOpen(false)}>
            {t("nav.archive")}
          </NavLink>
          <NavLink to="/about" className={navClass} onClick={() => setMenuOpen(false)}>
            {t("nav.about")}
          </NavLink>
          <button
            onClick={() => { switchLang(); setMenuOpen(false); }}
            className="text-left text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F]"
          >
            {i18n.language === "fr" ? t("common.switchToEnglish") : t("common.switchToFrench")}
          </button>
        </nav>
      </div>
    </>
  );
}
