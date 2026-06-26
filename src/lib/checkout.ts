import type { CartItem } from "../types";

/**
 * Starts a Stripe Checkout session via the Netlify function and
 * redirects the browser to Stripe's hosted payment page.
 *
 * @param items  Cart items to purchase.
 * @param country  ISO-2 destination country code (default "FR").
 * @param errorMessage  Localised fallback error string supplied by the caller
 *   (allows the UI to pass t("cart.checkoutError") without this module
 *   needing its own i18n context).
 *
 * Throws on failure so the caller can surface an error.
 */
export async function startCheckout(
  items: CartItem[],
  country = "FR",
  errorMessage = "Payment is temporarily unavailable. Please try again."
): Promise<void> {
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
    // Prefer the server's specific error (e.g. "Product unavailable: …")
    // but fall back to the localised generic message supplied by the caller.
    throw new Error(data.error || errorMessage);
  }

  const { url } = (await res.json()) as { url?: string };
  if (!url) throw new Error(errorMessage);
  window.location.href = url;
}
