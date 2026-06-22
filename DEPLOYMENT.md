# CLÉ PARIS — Deployment & Setup

## 1. Database (Supabase)

Run migrations in order (Supabase CLI `supabase db push`, or paste each into
the SQL editor in this exact order):

1. `supabase/migrations/001_cleparis_schema.sql` — full schema + public read policies
2. `supabase/migrations/002_expansion_schema.sql` — expansion tables (events, memberships, content blocks)
3. `supabase/migrations/003_rls_admin_lockdown.sql` — **security**: locks writes + order/customer reads to admins only
4. `supabase/seed.sql` — the 2026 catalog (idempotent)

> The old conflicting `0001_init_schema.sql` and `001_initial_schema.sql` were
> deleted — they defined a different, incompatible schema and broke `db reset`.

### Bootstrap the first admin

RLS now requires an `admin_users` membership for any write. On a fresh DB,
create the first admin once:

1. Supabase Dashboard → Authentication → Users → **Add user** (email + password).
2. SQL editor:
   ```sql
   INSERT INTO public.admin_users (auth_user_id, email, name, role)
   SELECT id, email, 'Admin Principal', 'admin'
   FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL'
   ON CONFLICT (email) DO UPDATE SET auth_user_id = EXCLUDED.auth_user_id;
   ```

After that, new admins can be added from the admin UI (Users → Inviter), which
calls the `admin-invite` function to create their login automatically.

## 2. Environment variables (Netlify → Site settings → Environment)

Client (browser):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server (Netlify Functions — never prefixed with `VITE_`):
- `SUPABASE_URL` (or it falls back to `VITE_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `FREE_SHIPPING_THRESHOLD` (optional, default `150`)
- `SHIPPING_FLAT_EUR` (optional, default `9.90`)

## 3. Stripe webhook

Stripe Dashboard → Developers → Webhooks → Add endpoint:

- URL: `https://<your-site>/.netlify/functions/stripe-webhook`
- Event: `checkout.session.completed`
- Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## 4. How checkout works

- Cart → "Passer au paiement" → `POST /.netlify/functions/create-checkout`.
- The function re-reads prices from Supabase (client prices are never trusted),
  creates a Stripe Checkout Session, and returns its URL.
- On success Stripe redirects to `/order/success`, which clears the cart.
- The `stripe-webhook` function records the customer, order, and order_items
  using the service-role key (bypasses RLS), and is idempotent per session.

## 5. Local dev

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Stripe values
npm run dev                  # storefront + admin (/admin)
# To exercise functions locally: `netlify dev` (Netlify CLI)
```

Without Supabase env vars the storefront falls back to the static catalog and
the admin runs in **dev-only mock mode** (any credentials). Mock mode is
compiled out of production builds, so a misconfigured prod deploy fails closed
instead of granting open admin access.
