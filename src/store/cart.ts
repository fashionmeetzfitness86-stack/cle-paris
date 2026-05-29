import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (slug: string, size: string, colorId: string) => void;
  updateQty: (slug: string, size: string, colorId: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((s) => {
          const existing = s.items.find(
            (i) => i.productSlug === item.productSlug && i.size === item.size && i.colorId === item.colorId,
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                i === existing ? { ...i, qty: i.qty + item.qty } : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...s.items, item], isOpen: true };
        }),
      remove: (slug, size, colorId) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.productSlug === slug && i.size === size && i.colorId === colorId),
          ),
        })),
      updateQty: (slug, size, colorId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.productSlug === slug && i.size === size && i.colorId === colorId
                ? { ...i, qty: Math.max(0, qty) }
                : i,
            )
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: "cle-paris-cart" },
  ),
);
