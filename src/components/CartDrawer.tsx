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
      <div className="absolute inset-0 bg-black/70" onClick={close} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-stone-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <h2 className="text-sm uppercase tracking-widest">
            {t("nav.cart")} [{items.reduce((n, i) => n + i.qty, 0)}]
          </h2>
          <button onClick={close} aria-label="Close" className="text-stone-400 hover:text-white">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 && <p className="text-stone-500">Panier vide.</p>}
          <ul className="space-y-4">
            {items.map((item) => {
              const p = getProductBySlug(item.productSlug);
              if (!p) return null;
              const color = p.colors.find((c) => c.id === item.colorId);
              return (
                <li
                  key={`${item.productSlug}-${item.size}-${item.colorId}`}
                  className="flex gap-4 border-b border-stone-900 pb-4"
                >
                  <img src={p.images[0]} alt={p.name} className="h-24 w-20 object-cover" />
                  <div className="flex-1">
                    <div className="text-sm">{p.name}</div>
                    <div className="mt-1 text-xs text-stone-400">
                      {color?.label[lang]} · {item.size}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQty(item.productSlug, item.size, item.colorId, item.qty - 1)
                        }
                        className="border border-stone-700 px-2 hover:border-white"
                      >
                        −
                      </button>
                      <span className="text-sm">{item.qty}</span>
                      <button
                        onClick={() =>
                          updateQty(item.productSlug, item.size, item.colorId, item.qty + 1)
                        }
                        className="border border-stone-700 px-2 hover:border-white"
                      >
                        +
                      </button>
                      <button
                        onClick={() => remove(item.productSlug, item.size, item.colorId)}
                        className="ml-auto text-xs text-stone-500 hover:text-white"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                  <div className="text-sm">€{(p.price * item.qty).toFixed(2)}</div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="border-t border-stone-800 px-6 py-6">
          <div className="flex justify-between text-sm">
            <span className="uppercase tracking-widest">Sous-total</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <button
            disabled={items.length === 0}
            className="mt-4 w-full bg-bone py-3 text-xs uppercase tracking-widest text-black disabled:opacity-40"
          >
            Passer au paiement
          </button>
        </div>
      </aside>
    </div>
  );
}
