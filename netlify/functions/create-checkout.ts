/**
 * POST /.netlify/functions/create-checkout
 *
 * Body: { items: { productSlug, size, colorId, qty }[] }
 *
 * Creates a Stripe Checkout Session. Prices are ALWAYS read from
 * Supabase server-side — the client price is never trusted. Returns
 * { url } for the browser to redirect to.
 *
 * Required env (Netlify):
 *   STRIPE_SECRET_KEY
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   FREE_SHIPPING_THRESHOLD (optional, default 150)
 *   SHIPPING_FLAT_EUR (optional, default 9.90)
 */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

interface ClientItem {
  productSlug: string;
  size: string;
  colorId: string;
  qty: number;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

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
    });
  }

  let items: ClientItem[];
  try {
    const body = (await req.json()) as { items?: ClientItem[] };
    items = body.items ?? [];
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return json(400, { error: "Cart is empty." });
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

  if (error) return json(500, { error: "Could not load products." });

  const bySlug = new Map((products ?? []).map((p) => [p.slug as string, p]));

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;

  for (const it of merged.values()) {
    const p = bySlug.get(it.productSlug);
    if (!p || p.is_archived) {
      return json(400, { error: `Product unavailable: ${it.productSlug}` });
    }
    const price = Number(p.price);
    if (!Number.isFinite(price) || price <= 0) {
      return json(400, { error: `Invalid price for ${it.productSlug}` });
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

  // Shipping: free over threshold, otherwise a flat rate.
  const freeThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD ?? 150);
  const shippingFlat = Number(process.env.SHIPPING_FLAT_EUR ?? 9.9);
  const shipping_options: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
    subtotal >= freeThreshold
      ? [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: "Livraison offerte",
              fixed_amount: { amount: 0, currency: "eur" },
            },
          },
        ]
      : [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: "Livraison standard",
              fixed_amount: { amount: Math.round(shippingFlat * 100), currency: "eur" },
            },
          },
        ];

  const origin = new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_options,
      automatic_tax: { enabled: false },
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "LU", "DE", "ES", "IT", "NL", "PT", "AT", "IE"],
      },
      phone_number_collection: { enabled: true },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/collection?checkout=cancelled`,
      metadata: {
        cart: JSON.stringify(
          [...merged.values()].map((i) => ({
            slug: i.productSlug,
            size: i.size,
            color: i.colorId,
            qty: i.qty,
          }))
        ).slice(0, 4900),
      },
    });

    return json(200, { url: session.url });
  } catch (e) {
    return json(500, { error: "Could not start checkout." });
  }
};
