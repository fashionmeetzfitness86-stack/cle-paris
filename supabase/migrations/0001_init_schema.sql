-- CLÉ PARIS — initial schema
-- products, variants, images, orders, order_items, customers

create extension if not exists "pgcrypto";

-- ============ products ============
create table public.products (
  slug text primary key,
  name text not null,
  category text not null check (category in ('hoodie','crewneck','pants','shorts','tshirt','accessory')),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR' check (currency in ('EUR','USD')),
  description_fr text not null,
  description_en text not null,
  material_fr text not null,
  material_en text not null,
  archived boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.products is 'Catalog items, one row per SKU family';

create table public.product_colors (
  id text primary key,
  label_fr text not null,
  label_en text not null,
  hex text not null check (hex ~ '^#[0-9a-fA-F]{6}$')
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products(slug) on delete cascade,
  color_id text not null references public.product_colors(id),
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  unique (product_slug, color_id, size)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products(slug) on delete cascade,
  url text not null,
  position integer not null default 0,
  alt text,
  created_at timestamptz not null default now()
);

create index product_variants_product_idx on public.product_variants(product_slug);
create index product_images_product_idx on public.product_images(product_slug, position);

-- ============ orders ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('CP-' || to_char(now(),'YYYYMMDD') || '-' || substring(gen_random_uuid()::text,1,6)),
  customer_email text not null,
  customer_name text,
  shipping_address jsonb,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending'
    check (status in ('pending','paid','fulfilled','shipped','cancelled','refunded')),
  stripe_session_id text unique,
  stripe_payment_intent_id text unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null references public.products(slug),
  variant_id uuid references public.product_variants(id),
  size text not null,
  color_id text not null,
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  qty integer not null check (qty > 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);

create index orders_status_idx on public.orders(status, created_at desc);
create index order_items_order_idx on public.order_items(order_id);

-- ============ updated_at trigger ============
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_products_updated before update on public.products
  for each row execute function public.tg_set_updated_at();
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.tg_set_updated_at();

-- ============ RLS ============
alter table public.products enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public read on catalog
create policy products_public_read on public.products for select using (true);
create policy colors_public_read on public.product_colors for select using (true);
create policy variants_public_read on public.product_variants for select using (true);
create policy images_public_read on public.product_images for select using (true);

-- Orders: only the service role (Stripe webhook) can insert/read.
-- Customers will get order info via Stripe email + a one-shot success page.
-- No customer-table-side reads from the public role.
