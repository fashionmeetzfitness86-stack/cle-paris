import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-stone-900/60 bg-black relative overflow-hidden">
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #c8b89a20, transparent)" }}
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="font-display text-2xl tracking-[0.4em] text-bone/90 hover:text-bone transition-colors duration-500">
            CLÉ&nbsp;PARIS
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-stone-500">
            {t("footer.manifesto")}
          </p>
          <div className="mt-8 flex gap-6 text-[10px] uppercase tracking-widest">
            {[
              { href: "https://instagram.com", label: "Instagram" },
              { href: "https://x.com",         label: "X" },
              { href: "mailto:contact@cleparis.store", label: "Email" },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="nav-link-underline text-stone-600 hover:text-stone-300 transition-colors duration-300"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="text-[10px] uppercase tracking-widest text-stone-700 mb-5">Boutique</h4>
          <ul className="space-y-3 text-sm text-stone-500">
            {[
              { to: "/collection", label: "Collection" },
              { to: "/archive",    label: "Archive" },
              { to: "/about",      label: "À Propos" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="nav-link-underline hover:text-stone-200 transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal links */}
        <div>
          <h4 className="text-[10px] uppercase tracking-widest text-stone-700 mb-5">Informations</h4>
          <ul className="space-y-3 text-sm text-stone-500">
            {[
              { to: "/legal/mentions",        label: t("footer.legal") },
              { to: "/legal/conditions",      label: t("footer.terms") },
              { to: "/legal/confidentialite", label: t("footer.privacy") },
              { to: "/legal/livraison",       label: t("footer.shipping") },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="nav-link-underline hover:text-stone-200 transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-900/40 px-6 py-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-widest text-stone-700">
            ©2026 CLÉ PARIS. {t("footer.rights")}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-stone-800">
            Design Parisien · Produit en Europe
          </p>
        </div>
      </div>
    </footer>
  );
}
