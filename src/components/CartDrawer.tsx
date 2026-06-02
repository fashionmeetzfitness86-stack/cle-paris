import { useCart } from "../store/cart";
import { getProductBySlug } from "../data/products";
import { useTranslation } from "react-i18next";
import type { Lang } from "../types";

export default function CartDrawer() {
  const { items, isOpen, close, remove, updateQty } = useCart();
  const { i18n, t } = useTranslation();
  const lang = i18n.language as Lang;

  const subtotal = items.reduce((sum, item) => {
    const p = getProductBySlug(item.productSlug);
    return p ? sum + p.price * item.qty : sum;
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#111]/30 backdrop-blur-sm"
        onClick={close}
      />

      {/* Drawer panel */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#FAF7F2] shadow-[0_0_60px_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/8 px-6 py-5">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#111]">
            {t("nav.cart")} [{items.reduce((n, i) => n + i.qty, 0)}]
          </h2>
          <button
            onClick={close}
            aria-label="Close"
            className="text-[#6F6F6F] hover:text-[#111] transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 && (
            <p className="text-sm text-[#6F6F6F] italic">Votre panier est vide.</p>
          )}
          <ul className="space-y-5">
            {items.map((item) => {
              const p = getProductBySlug(item.productSlug);
              if (!p) return null;
              const color = p.colors.find((c) => c.id === item.colorId);
              return (
                <li
                  key={`${item.productSlug}-${item.size}-${item.colorId}`}
                  className="flex gap-4 border-b border-black/6 pb-5"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-24 w-20 object-cover bg-[#EFE7DD]"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#111]">{p.name}</div>
                    <div className="mt-1 text-[11px] text-[#6F6F6F] tracking-wide">
                      {color?.label[lang]} · {item.size}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQty(item.productSlug, item.size, item.colorId, item.qty - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center border border-black/10 text-[#3A3A3A] hover:border-[#111] transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm w-5 text-center text-[#111]">{item.qty}</span>
                      <button
                        onClick={() =>
                          updateQty(item.productSlug, item.size, item.colorId, item.qty + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center border border-black/10 text-[#3A3A3A] hover:border-[#111] transition-colors"
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
                  <div className="text-sm font-medium text-[#111]">
                    €{(p.price * item.qty).toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-black/8 bg-[#F4EFE8] px-6 py-6">
          <div className="flex justify-between text-sm">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#6F6F6F]">Sous-total</span>
            <span className="font-medium text-[#111]">€{subtotal.toFixed(2)}</span>
          </div>
          <button
            disabled={items.length === 0}
            className="mt-5 w-full bg-[#111] py-4 text-[11px] uppercase tracking-[0.2em] text-[#FAF7F2] transition-colors hover:bg-[#2C2825] disabled:opacity-40 light-sweep"
          >
            Passer au paiement
          </button>
          <p className="mt-3 text-center text-[10px] text-[#6F6F6F] tracking-wide">
            Livraison gratuite à partir de 150 €
          </p>
        </div>
      </aside>
    </div>
  );
}
