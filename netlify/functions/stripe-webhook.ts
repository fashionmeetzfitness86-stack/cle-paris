/**
 * POST /.netlify/functions/stripe-webhook
 *
 * Stripe webhook. On `checkout.session.completed` it records the
 * customer, order, and order_items in Supabase using the service-role
 * key (bypasses RLS). Signature is verified against STRIPE_WEBHOOK_SECRET.
 *
 * Required env (Netlify):
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Configure in Stripe Dashboard → Developers → Webhooks, endpoint:
 *   https://<your-site>/.netlify/functions/stripe-webhook
 *   event: checkout.session.completed
 */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { requireOrigin } from "./_cors.js";

export const config = { path: "/.netlify/functions/stripe-webhook" };

interface CartLine {
  slug: string;
  size: string;
  color: string;
  qty: number;
}

export default async (req: Request) => {
  // CORS preflight — Stripe itself is server-to-server but allow preflight from browsers
  // (e.g. Stripe's webhook tester UI). Unauthorized origins are blocked.
  const corsResponse = requireOrigin(req);
  if (corsResponse) return corsResponse;

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    return new Response("Webhook not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig ?? "", webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("Ignored", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return new Response("Not paid", { status: 200 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Idempotency: skip if this session already produced an order.
  const orderNumber = `CLE-${(session.id || "").slice(-10).toUpperCase()}`;
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (existing) return new Response("Already processed", { status: 200 });

  const email =
    session.customer_details?.email || session.customer_email || "unknown@cleparis.store";
  const fullName = session.customer_details?.name || "";
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");
  const addr = session.customer_details?.address ?? null;
  const total = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? "eur").toUpperCase();

  // Upsert customer (don't fail the order if this errors).
  await supabase
    .from("customers")
    .upsert(
      {
        email,
        first_name: firstName || "",
        last_name: lastName || "",
        phone: session.customer_details?.phone || "",
      },
      { onConflict: "email" }
    );

  // Create the order.
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_email: email,
      status: "paid",
      total,
      currency,
      shipping_address: addr,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return new Response("Could not record order", { status: 500 });
  }

  // Resolve cart lines from metadata, enrich with authoritative product data.
  let cart: CartLine[] = [];
  try {
    const rawCart = session.metadata?.cart ?? "[]";
    const fmt = session.metadata?.cart_fmt;
    const parsed = JSON.parse(rawCart);
    if (fmt === "compact" && Array.isArray(parsed)) {
      // Compact format: [[slug, size, color, qty], ...]
      cart = (parsed as [string, string, string, number][]).map(
        ([slug, size, color, qty]) => ({ slug, size, color, qty })
      );
    } else {
      cart = parsed as CartLine[];
    }
  } catch {
    cart = [];
  }

  if (cart.length > 0) {
    const slugs = [...new Set(cart.map((c) => c.slug))];
    const { data: products } = await supabase
      .from("products")
      .select("slug, name, price, product_media(url, sort_order)")
      .in("slug", slugs);
    const bySlug = new Map((products ?? []).map((p) => [p.slug as string, p]));

    const rows = cart.map((c) => {
      const p = bySlug.get(c.slug);
      const media = ((p?.product_media as { url: string; sort_order: number }[]) ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order);
      return {
        order_id: order.id,
        product_slug: c.slug,
        name: (p?.name as string) ?? c.slug,
        price: Number(p?.price ?? 0),
        qty: c.qty,
        size: c.size,
        color_id: c.color,
        color_label: c.color,
        image: media[0]?.url ?? "",
      };
    });
    await supabase.from("order_items").insert(rows);
  }

  return new Response("ok", { status: 200 });
};
