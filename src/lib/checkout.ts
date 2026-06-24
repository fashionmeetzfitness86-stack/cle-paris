import type { CartItem } from "../types";

/**
 * Starts a Stripe Checkout session via the Netlify function and
 * redirects the browser to Stripe's hosted payment page.
 * Throws on failure so the caller can surface an error.
 */
export async function startCheckout(items: CartItem[], country = "FR"): Promise<void> {
  const res = await fetch("/.netlify/functions/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      country,
      items: items.map((i) => ({
        productSlug: i.productSlug,
        size: i.size,
        colorId: i.colorId,
        qty: i.qty,
      })),
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Le paiement est momentanément indisponible.");
  }

  const { url } = (await res.json()) as { url?: string };
  if (!url) throw new Error("Le paiement est momentanément indisponible.");
  window.location.href = url;
}
