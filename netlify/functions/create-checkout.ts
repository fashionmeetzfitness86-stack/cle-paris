/**
 * POST /.netlify/functions/create-checkout
 *
 * Body: { items: { productSlug, size, colorId, qty }[], country?: string }
 *
 * Creates a Stripe Checkout Session. Prices are ALWAYS read from
 * Supabase server-side — the client price is never trusted. Returns
 * { url } for the browser to redirect to.
 *
 * Required env (Netlify):
 *   STRIPE_SECRET_KEY
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VITE_SITE_URL (used for CORS origin validation)
 *   FREE_SHIPPING_THRESHOLD (optional, default 150)
 *   SHIPPING_FLAT_EUR (optional, default 9.90)
 */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { requireOrigin, corsHeaders } from "./_cors.js";

interface ClientItem {
  productSlug: string;
  size: string;
  colorId: string;
  qty: number;
}

const json = (status: number, body: unknown, req: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  });

export default async (req: Request) => {
  // CORS preflight + origin guard
  const corsResponse = requireOrigin(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, req);

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeKey || !supabaseUrl || !serviceKey) {
    return json(500, {
      error: "Payment is not configured.",
      missing: {
        STRIPE_SECRET_KEY: !stripeKey,
        SUPABASE_URL_or_VITE: !supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !serviceKey,
      },
    }, req);
  }

  let items: ClientItem[];
  let country = "FR";
  try {
    const body = (await req.json()) as { items?: ClientItem[]; country?: string };
    items = body.items ?? [];
    if (typeof body.country === "string" && body.country.length === 2) {
      country = body.country.toUpperCase();
    }
  } catch {
    return json(400, { error: "Invalid request body." }, req);
  }

  if (!Array.isArray(items) || items.length === 0) {
    return json(400, { error: "Cart is empty." }, req);
  }

  const stripe = new Stripe(stripeKey);
  const supabase = createClient(supabaseUrl, serviceKey);

  // Collapse duplicate (slug/size/color) lines and clamp quantities.
  const merged = new Map<string, ClientItem>();
  for (const it of items) {
    if (!it.productSlug || !it.size) continue;
    const qty = Math.max(1, Math.min(20, Math.floor(Number(it.qty) || 1)));
    const key = `${it.productSlug}|${it.size}|${it.colorId}`;
    const existing = merged.get(key);
    if (existing) existing.qty += qty;
    else merged.set(key, { ...it, qty });
  }

  const slugs = [...new Set([...merged.values()].map((i) => i.productSlug))];

  // Authoritative product data from the DB.
  const { data: products, error } = await supabase
    .from("products")
    .select("slug, name, price, currency, is_archived, product_media(url, sort_order)")
    .in("slug", slugs);

  if (error) return json(500, { error: "Could not load products." }, req);

  const bySlug = new Map((products ?? []).map((p) => [p.slug as string, p]));

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;

  for (const it of merged.values()) {
    const p = bySlug.get(it.productSlug);
    if (!p || p.is_archived) {
      return json(400, { error: `Product unavailable: ${it.productSlug}` }, req);
    }
    const price = Number(p.price);
    if (!Number.isFinite(price) || price <= 0) {
      return json(400, { error: `Invalid price for ${it.productSlug}` }, req);
    }
    subtotal += price * it.qty;

    const media = ((p.product_media as { url: string; sort_order: number }[]) ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order);
    const image = media[0]?.url;
    const absoluteImage =
      image && image.startsWith("/") ? `${new URL(req.url).origin}${image}` : image;

    line_items.push({
      quantity: it.qty,
      price_data: {
        currency: (p.currency as string)?.toLowerCase() || "eur",
        unit_amount: Math.round(price * 100),
        product_data: {
          name: p.name as string,
          description: [it.colorId, it.size].filter(Boolean).join(" · "),
          ...(absoluteImage ? { images: [absoluteImage] } : {}),
          metadata: { slug: it.productSlug, size: it.size, color: it.colorId },
        },
      },
    });
  }

  // Shipping: national vs international from shipping_settings, free over threshold.
  let nationalCountries = ["FR"];
  let nationalPrice = Number(process.env.SHIPPING_FLAT_EUR ?? 0);
  let internationalPrice = nationalPrice;
  let freeThreshold: number | null = Number(process.env.FREE_SHIPPING_THRESHOLD ?? 150);
  try {
    const { data: ship } = await supabase
      .from("shipping_settings")
      .select("national_countries, national_price, international_price, free_shipping_threshold")
      .limit(1)
      .single();
    if (ship) {
      nationalCountries = (ship.national_countries as string[]) ?? ["FR"];
      nationalPrice = Number(ship.national_price) || 0;
      internationalPrice = Number(ship.international_price) || 0;
      freeThreshold = ship.free_shipping_threshold == null ? null : Number(ship.free_shipping_threshold);
    }
  } catch {
    /* fall back to env defaults */
  }

  const isFree = freeThreshold != null && subtotal >= freeThreshold;
  const shipAmount = isFree
    ? 0
    : nationalCountries.includes(country)
      ? nationalPrice
      : internationalPrice;

  const shipping_options: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        display_name: shipAmount === 0 ? "Livraison offerte" : "Livraison",
        fixed_amount: { amount: Math.round(shipAmount * 100), currency: "eur" },
      },
    },
  ];

  const origin = new URL(req.url).origin;

  // Build cart metadata safely — never truncate mid-JSON.
  // Stripe metadata values are limited to 500 chars each (total 8KB per session).
  // We use the dedicated "cart" key which allows up to 500 chars.
  // If the serialized cart exceeds that, we reject early so order items are never lost.
  const cartLines = [...merged.values()].map((i) => ({
    slug: i.productSlug,
    size: i.size,
    color: i.colorId,
    qty: i.qty,
  }));
  const cartJson = JSON.stringify(cartLines);
  if (cartJson.length > 490) {
    // Cart is too large for Stripe metadata; store a compact form (slug+size+color+qty only)
    // If still too large, return a clear error instead of corrupting the order.
    const compactJson = JSON.stringify(cartLines.map((l) => [l.slug, l.size, l.color, l.qty]));
    if (compactJson.length > 490) {
      return json(400, {
        error: "Your cart is too large to process in a single order. Please reduce the number of items.",
      }, req);
    }
    // Use compact format; webhook must handle both formats
    const cartMeta = { cart: compactJson, cart_fmt: "compact" };
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items,
        shipping_options,
        automatic_tax: { enabled: false },
        shipping_address_collection: {
          allowed_countries: [
            "FR", "BE", "CH", "LU", "MC", "DE", "ES", "IT", "PT", "NL",
            "AT", "IE", "GB", "DK", "SE", "NO", "FI", "PL", "CZ", "GR",
            "US", "CA", "AU", "JP", "AE", "MA", "TN", "DZ",
          ] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
        },
        phone_number_collection: { enabled: true },
        success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/collection?checkout=cancelled`,
        metadata: cartMeta,
      });
      return json(200, { url: session.url }, req);
    } catch {
      return json(500, { error: "Could not start checkout." }, req);
    }
  }
  const cartMeta = { cart: cartJson };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_options,
      automatic_tax: { enabled: false },
      shipping_address_collection: {
        allowed_countries: [
          "FR", "BE", "CH", "LU", "MC", "DE", "ES", "IT", "PT", "NL",
          "AT", "IE", "GB", "DK", "SE", "NO", "FI", "PL", "CZ", "GR",
          "US", "CA", "AU", "JP", "AE", "MA", "TN", "DZ",
        ] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      phone_number_collection: { enabled: true },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/collection?checkout=cancelled`,
      metadata: cartMeta,
    });

    return json(200, { url: session.url }, req);
  } catch (e) {
    return json(500, { error: "Could not start checkout." }, req);
  }
};
