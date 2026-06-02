import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../store/cart";

/** Returns how far the user has scrolled vertically */
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}

export default function Header() {
  const { t, i18n } = useTranslation();
  const { items, toggle } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const scrollY = useScrollY();
  const prevCount = useRef(count);
  const [cartBump, setCartBump] = useState(false);

  const scrolled = scrollY > 48;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Bump animation when cart count increases
  useEffect(() => {
    if (count > prevCount.current) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 400);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  const switchLang = () => {
    const next = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(next);
    localStorage.setItem("cle-lang", next);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link-underline text-xs tracking-widest uppercase transition-all duration-300 ${
      isActive ? "opacity-100 active" : "opacity-50 hover:opacity-100"
    }`;

  return (
    <>
      {/* ── Main header ─────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled
            ? "border-stone-900 bg-black/98 py-2.5 backdrop-blur-xl shadow-[0_1px_40px_rgba(0,0,0,0.6)]"
            : "border-stone-800 bg-black/90 py-4 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/collection" className={navLinkClass}>{t("nav.collection")}</NavLink>
            <NavLink to="/archive"    className={navLinkClass}>{t("nav.archive")}</NavLink>
            <NavLink to="/about"      className={navLinkClass}>{t("nav.about")}</NavLink>
          </nav>

          {/* Mobile: hamburger on left */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex flex-col justify-center gap-[5px] md:hidden z-10"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className={`block h-px w-5 bg-bone transition-all duration-400 ease-luxury ${mobileOpen ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-bone transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block h-px w-5 bg-bone transition-all duration-400 ease-luxury ${mobileOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>

          {/* Logo — centered absolute on mobile */}
          <Link
            to="/"
            className={`font-display tracking-[0.4em] transition-all duration-500 ${
              scrolled ? "text-base" : "text-lg"
            } md:absolute md:left-1/2 md:-translate-x-1/2`}
          >
            CLÉ&nbsp;PARIS
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-5">
            <button
              onClick={switchLang}
              className="nav-link-underline text-xs tracking-widest opacity-50 hover:opacity-100 transition-opacity duration-200 hidden md:block"
              aria-label="Toggle language"
            >
              {i18n.language === "fr" ? "FR | en" : "fr | EN"}
            </button>
            <button
              onClick={toggle}
              className={`text-xs tracking-widest ${
                cartBump ? "scale-125 opacity-100" : "opacity-50 hover:opacity-100"
              }`}
              aria-label={t("nav.cart")}
              style={{
                transition: cartBump
                  ? "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease"
                  : "opacity 0.2s ease",
              }}
            >
              {t("nav.cart")} [{count}]
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile nav overlay ───────────────────────────────────────────── */}
      {/* Always rendered — CSS controls visibility */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-black md:hidden transition-all duration-500 ease-luxury ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="flex flex-col justify-center gap-[5px]"
            aria-label="Close menu"
          >
            <span className="block h-px w-5 bg-bone translate-y-[6px] rotate-45" />
            <span className="block h-px w-5 bg-bone opacity-0" />
            <span className="block h-px w-5 bg-bone -translate-y-[6px] -rotate-45" />
          </button>
          <Link to="/" className="font-display text-lg tracking-[0.4em]" onClick={() => setMobileOpen(false)}>
            CLÉ&nbsp;PARIS
          </Link>
          <button
            onClick={toggle}
            className="text-xs tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            aria-label={t("nav.cart")}
          >
            {t("nav.cart")} [{count}]
          </button>
        </div>

        {/* Nav links — staggered entrance */}
        <nav className="flex flex-1 flex-col items-center justify-center gap-10">
          {[
            { to: "/collection", label: t("nav.collection") },
            { to: "/archive",    label: t("nav.archive") },
            { to: "/about",      label: t("nav.about") },
          ].map(({ to, label }, i) => (
            <Link
              key={to}
              to={to}
              className={`font-display text-4xl tracking-widest opacity-0 hover:opacity-70 transition-opacity duration-200 ${
                mobileOpen ? "animate-fade-up" : ""
              }`}
              style={{ animationDelay: `${i * 80 + 100}ms` }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-stone-900 px-6 py-6 text-center">
          <button
            onClick={switchLang}
            className="text-xs tracking-widest text-stone-400 hover:text-white transition-colors"
          >
            {i18n.language === "fr" ? "FR | en" : "fr | EN"}
          </button>
        </div>
      </div>
    </>
  );
}
