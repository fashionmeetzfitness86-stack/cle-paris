import { useEffect, useState } from "react";
import { useCart } from "../store/cart";
import { getProductBySlug } from "../data/products";
import { useTranslation } from "react-i18next";
import type { Lang } from "../types";

export default function CartDrawer() {
  const { items, isOpen, close, remove, updateQty } = useCart();
  const { i18n, t } = useTranslation();
  const lang = i18n.language as Lang;
  // Delay unmount so exit animation can play
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // rAF so CSS transition catches the mounted state
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 450);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const subtotal = items.reduce((sum, item) => {
    const p = getProductBySlug(item.productSlug);
    return p ? sum + p.price * item.qty : sum;
  }, 0);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-400 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />

      {/* Drawer */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-stone-950 shadow-2xl transition-transform duration-500 ease-drawer ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800/60 px-6 py-5">
          <h2 className="text-xs uppercase tracking-widest text-stone-400">
            {t("nav.cart")}
            <span className="ml-2 text-bone">[{items.reduce((n, i) => n + i.qty, 0)}]</span>
          </h2>
          <button
            onClick={close}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center text-xl text-stone-500 hover:text-white transition-colors duration-200 rotate-0 hover:rotate-90 transition-transform"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-1">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center animate-fade-up">
              <div className="text-4xl text-stone-800">∅</div>
              <p className="text-sm text-stone-500">{t("cart.empty")}</p>
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
                  className="flex gap-4 border-b border-stone-900/60 pb-5 animate-fade-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Product image */}
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-stone-900">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="text-sm leading-snug">{p.name}</div>
                      <div className="mt-0.5 text-xs text-stone-400">
                        {color?.label[lang]} · {item.size}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.productSlug, item.size, item.colorId, item.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center border border-stone-800 text-stone-400 hover:border-stone-600 hover:text-white transition-all duration-200 active:scale-90"
                      >−</button>
                      <span className="w-4 text-center text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productSlug, item.size, item.colorId, item.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center border border-stone-800 text-stone-400 hover:border-stone-600 hover:text-white transition-all duration-200 active:scale-90"
                      >+</button>
                      <button
                        onClick={() => remove(item.productSlug, item.size, item.colorId)}
                        className="ml-auto text-xs text-stone-600 hover:text-stone-300 transition-colors duration-200"
                      >
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>

                  <div className="text-sm shrink-0">€{(p.price * item.qty).toFixed(2)}</div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-800/60 px-6 py-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="uppercase tracking-widest text-stone-400">{t("cart.subtotal")}</span>
            <span className="text-bone">€{subtotal.toFixed(2)}</span>
          </div>
          <button
            disabled={items.length === 0}
            className="light-sweep w-full bg-bone py-3.5 text-xs uppercase tracking-widest text-black transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(232,226,214,0.15)] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {t("cart.checkout")}
          </button>
          <p className="text-center text-[10px] tracking-widest text-stone-600 uppercase">
            Livraison offerte dès €150
          </p>
        </div>
      </aside>
    </div>
  );
}
