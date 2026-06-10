import { useEffect, useState } from "react";
import { useCart } from "../store/cart";
import { getProductBySlug } from "../data/products";
import { useTranslation } from "react-i18next";
import type { Lang } from "../types";

export default function CartDrawer() {
  const { items, isOpen, close, remove, updateQty } = useCart();
  const { i18n, t } = useTranslation();
  const lang = i18n.language as Lang;

  // ── Animated mount/unmount cycle ───────────────────────────────
  // Keep mounted during close animation so it can slide out.
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // One-frame delay lets the browser paint the start state before animating.
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      // Wait for CSS transition to finish (400ms) before unmounting.
      const timer = setTimeout(() => setMounted(false), 420);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const subtotal = items.reduce((sum, item) => {
    const p = getProductBySlug(item.productSlug);
    return p ? sum + p.price * item.qty : sum;
  }, 0);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      {/* ── Backdrop ──────────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 bg-[#111]/30 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Drawer panel ──────────────────────────────────────────── */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#FAF7F2] shadow-[0_0_60px_rgba(0,0,0,0.12)] transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/8 px-6 py-5">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#111]">
            {t("nav.cart")}&nbsp;
            <span className="tabular-nums">
              [{items.reduce((n, i) => n + i.qty, 0)}]
            </span>
          </h2>
          <button
            onClick={close}
            aria-label="Fermer le panier"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6F6F6F] hover:text-[#111] hover:bg-black/5 transition-all duration-200 text-xl leading-none"
            style={{ transition: "transform 0.25s ease, color 0.2s, background 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "rotate(90deg)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "rotate(0deg)"; }}
          >
            ×
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="text-3xl opacity-20 select-none">◻</div>
              <p className="text-sm text-[#6F6F6F]">Votre panier est vide.</p>
              <button
                onClick={close}
                className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[#C8A97E] hover:text-[#111] transition-colors border-b border-[#C8A97E] hover:border-[#111] pb-0.5"
              >
                Continuer les achats →
              </button>
            </div>
          )}
          <ul className="space-y-5">
            {items.map((item, idx) => {
              const p = getProductBySlug(item.productSlug);
              if (!p) return null;
              const color = p.colors.find((c) => c.id === item.colorId);
              return (
                <li
                  key={`${item.productSlug}-${item.size}-${item.colorId}`}
                  className="flex gap-4 border-b border-black/6 pb-5 animate-fade-up"
                  style={{ animationDelay: `${idx * 55}ms` }}
                >
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-[#EFE7DD]">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#111] truncate">{p.name}</div>
                    <div className="mt-0.5 text-[11px] text-[#6F6F6F] tracking-wide">
                      {color?.label[lang]} · {item.size}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.productSlug, item.size, item.colorId, item.qty - 1)}
                        aria-label="Diminuer"
                        className="flex h-7 w-7 items-center justify-center border border-black/10 text-[#3A3A3A] hover:border-[#111] hover:bg-[#111] hover:text-[#FAF7F2] transition-all duration-200 text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm w-5 text-center text-[#111] tabular-nums">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productSlug, item.size, item.colorId, item.qty + 1)}
                        aria-label="Augmenter"
                        className="flex h-7 w-7 items-center justify-center border border-black/10 text-[#3A3A3A] hover:border-[#111] hover:bg-[#111] hover:text-[#FAF7F2] transition-all duration-200 text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => remove(item.productSlug, item.size, item.colorId)}
                        className="ml-auto text-[11px] uppercase tracking-wide text-[#6F6F6F] hover:text-[#111] transition-colors"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#111] whitespace-nowrap">
                    €{(p.price * item.qty).toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-black/8 bg-[#F4EFE8] px-6 py-6">
          <div className="flex justify-between items-baseline">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F]">Sous-total</span>
            <span className="text-base font-medium text-[#111] tabular-nums">
              €{subtotal.toFixed(2)}
            </span>
          </div>
          <button
            disabled={items.length === 0}
            className="mt-5 w-full bg-[#111] py-4 text-[11px] uppercase tracking-[0.2em] text-[#FAF7F2] transition-all duration-300 hover:bg-[#2C2825] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed light-sweep"
          >
            Passer au paiement
          </button>
          <p className="mt-3 text-center text-[10px] text-[#6F6F6F] tracking-wide">
            Livraison gratuite à partir de 150&thinsp;€
          </p>
        </div>
      </aside>
    </div>
  );
}
