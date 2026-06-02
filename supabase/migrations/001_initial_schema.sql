-- ============================================================
-- CLÉ PARIS — Supabase Initial Schema
-- Migration: 001_initial_schema.sql
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name_fr     text not null,
  name_en     text not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- COLLECTIONS
-- ============================================================
create table if not exists collections (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name_fr         text not null,
  name_en         text not null,
  description_fr  text,
  description_en  text,
  cover_image     text,
  is_active       boolean default true,
  sort_order      integer default 0,
  created_at      timestamptz default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  category_id      uuid references categories(id) on delete set null,
  collection_id    uuid references collections(id) on delete set null,
  price            numeric(10,2) not null,
  compare_at_price numeric(10,2),
  currency         text default 'EUR',
  description_fr   text,
  description_en   text,
  material_fr      text,
  material_en      text,
  is_archived      boolean default false,
  is_new           boolean default true,
  is_featured      boolean default false,
  sort_order       integer default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================================
-- PRODUCT COLORS
-- ============================================================
create table if not exists product_colors (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  slug        text not null,
  label_fr    text not null,
  label_en    text not null,
  hex         text not null,
  sort_order  integer default 0
);

-- ============================================================
-- PRODUCT VARIANTS (size × color × stock)
-- ============================================================
create table if not exists product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  color_id    uuid not null references product_colors(id) on delete cascade,
  size        text not null,
  stock       integer default 0,
  sku         text
);

-- ============================================================
-- PRODUCT MEDIA
-- ============================================================
create table if not exists product_media (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  alt         text,
  type        text default 'image',    -- 'image' | 'video'
  sort_order  integer default 0
);

-- ============================================================
-- MEDIA LIBRARY
-- ============================================================
create table if not exists media_library (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  filename    text not null,
  mime_type   text,
  size_bytes  bigint,
  width       integer,
  height      integer,
  bucket      text default 'media',
  created_at  timestamptz default now()
);

-- ============================================================
-- HOMEPAGE SECTIONS
-- ============================================================
create table if not exists homepage_sections (
  id             uuid primary key default gen_random_uuid(),
  key            text unique not null,
  type           text not null,             -- 'hero' | 'product_grid' | 'text_block' | 'image_text' | 'ticker'
  title_fr       text,
  title_en       text,
  subtitle_fr    text,
  subtitle_en    text,
  body_fr        text,
  body_en        text,
  image          text,
  link           text,
  link_label_fr  text,
  link_label_en  text,
  extra          jsonb default '{}',
  sort_order     integer default 0,
  is_visible     boolean default true
);

-- ============================================================
-- BANNERS
-- ============================================================
create table if not exists banners (
  id               uuid primary key default gen_random_uuid(),
  message_fr       text not null,
  message_en       text not null,
  link             text,
  is_active        boolean default false,
  background_color text default '#0a0a0a',
  text_color       text default '#e8e2d6',
  created_at       timestamptz default now()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table if not exists blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title_fr     text not null,
  title_en     text not null,
  excerpt_fr   text,
  excerpt_en   text,
  body_fr      text,
  body_en      text,
  cover_image  text,
  is_published boolean default false,
  published_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  author      text not null,
  role        text,
  quote_fr    text not null,
  quote_en    text not null,
  rating      integer default 5 check (rating between 1 and 5),
  avatar      text,
  is_visible  boolean default true,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- ============================================================
-- SEO SETTINGS (per page)
-- ============================================================
create table if not exists seo_settings (
  id             uuid primary key default gen_random_uuid(),
  page           text unique not null,
  title_fr       text,
  title_en       text,
  description_fr text,
  description_en text,
  og_image       text,
  updated_at     timestamptz default now()
);

-- ============================================================
-- LEGAL PAGES
-- ============================================================
create table if not exists legal_pages (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title_fr   text not null,
  title_en   text not null,
  body_fr    text,
  body_en    text,
  updated_at timestamptz default now()
);

-- ============================================================
-- SITE CONTENT (generic editable text blocks)
-- ============================================================
create table if not exists site_content (
  id       uuid primary key default gen_random_uuid(),
  key      text unique not null,
  value_fr text,
  value_en text,
  type     text default 'text'    -- 'text' | 'html' | 'url' | 'email'
);

-- ============================================================
-- STORE SETTINGS
-- ============================================================
create table if not exists store_settings (
  id    uuid primary key default gen_random_uuid(),
  key   text unique not null,
  value text,
  type  text default 'text'       -- 'text' | 'boolean' | 'json' | 'color' | 'number' | 'email' | 'url'
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
create table if not exists customers (
  id                 uuid primary key default gen_random_uuid(),
  email              text unique not null,
  first_name         text,
  last_name          text,
  phone              text,
  address            jsonb,       -- {line1, line2, city, postal_code, country}
  stripe_customer_id text,
  created_at         timestamptz default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  order_number          text unique not null default ('CLE-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  customer_id           uuid references customers(id) on delete set null,
  customer_email        text not null,
  status                text default 'pending'
                          check (status in ('pending','paid','processing','shipped','delivered','refunded','cancelled')),
  stripe_session_id     text,
  stripe_payment_intent text,
  total                 numeric(10,2) not null,
  subtotal              numeric(10,2),
  shipping_cost         numeric(10,2) default 0,
  currency              text default 'EUR',
  items                 jsonb not null,         -- [{productSlug, name, price, qty, size, colorId, colorLabel, image}]
  shipping_address      jsonb,                  -- {firstName, lastName, line1, line2, city, postal_code, country}
  notes                 text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ============================================================
-- ADMIN USERS
-- ============================================================
create table if not exists admin_users (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  name       text not null,
  role       text default 'editor' check (role in ('admin', 'editor')),
  avatar     text,
  last_login timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (enable but keep open until auth is wired)
-- ============================================================
alter table products enable row level security;
alter table orders enable row level security;
alter table customers enable row level security;
alter table admin_users enable row level security;

-- Public read access for products (storefront)
create policy "products_public_read" on products for select using (true);
create policy "product_colors_public_read" on product_colors for select using (true);
create policy "product_variants_public_read" on product_variants for select using (true);
create policy "product_media_public_read" on product_media for select using (true);
create policy "categories_public_read" on categories for select using (true);
create policy "collections_public_read" on collections for select using (true);
create policy "homepage_sections_public_read" on homepage_sections for select using (true);
create policy "banners_public_read" on banners for select using (true);
create policy "seo_settings_public_read" on seo_settings for select using (true);
create policy "legal_pages_public_read" on legal_pages for select using (true);
create policy "blog_posts_public_read" on blog_posts for select using (is_published = true);
create policy "testimonials_public_read" on testimonials for select using (is_visible = true);
create policy "site_content_public_read" on site_content for select using (true);
create policy "store_settings_public_read" on store_settings for select using (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Categories
insert into categories (slug, name_fr, name_en) values
  ('hoodie', 'Hoodie', 'Hoodie'),
  ('crewneck', 'Crewneck', 'Crewneck'),
  ('pants', 'Pantalon', 'Pants'),
  ('shorts', 'Short', 'Shorts'),
  ('tshirt', 'T-Shirt', 'T-Shirt'),
  ('accessory', 'Accessoire', 'Accessory')
on conflict (slug) do nothing;

-- Default SEO settings
insert into seo_settings (page, title_fr, title_en, description_fr, description_en) values
  ('home', 'CLÉ PARIS — Streetwear technique de luxe', 'CLÉ PARIS — Technical Luxury Streetwear',
   'Vêtements techniques fabriqués en Europe. Collection 2026.', 'Technical garments made in Europe. 2026 Collection.'),
  ('collection', 'Collection — CLÉ PARIS', 'Collection — CLÉ PARIS',
   'Découvrez la collection complète CLÉ PARIS.', 'Discover the full CLÉ PARIS collection.'),
  ('about', 'L''Atelier — CLÉ PARIS', 'The Atelier — CLÉ PARIS',
   'Notre manifeste. Conçu à Paris, produit en Europe.', 'Our manifesto. Designed in Paris, produced in Europe.'),
  ('archive', 'Archive — CLÉ PARIS', 'Archive — CLÉ PARIS',
   'Les pièces des saisons passées.', 'Pieces from past seasons.'),
  ('blog', 'Journal — CLÉ PARIS', 'Journal — CLÉ PARIS',
   'Inspirations, processus et récits du studio.', 'Inspirations, process and stories from the studio.')
on conflict (page) do nothing;

-- Legal pages
insert into legal_pages (slug, title_fr, title_en, body_fr, body_en) values
  ('mentions', 'Mentions légales', 'Legal notice',
   'Le site cle-paris.com est édité par CLÉ PARIS, marque indépendante.'||chr(10)||'Contact : contact@cleparis.store'||chr(10)||'Hébergement : Netlify.',
   'The site cle-paris.com is published by CLÉ PARIS, an independent brand.'||chr(10)||'Contact: contact@cleparis.store'||chr(10)||'Hosting: Netlify.'),
  ('conditions', 'Conditions générales de vente', 'Terms & conditions',
   'Tout achat est soumis aux présentes conditions. Paiement sécurisé via Stripe. Livraison sous 5 à 10 jours ouvrés en UE. Retours acceptés dans un délai de 14 jours.',
   'All purchases are subject to these terms. Payment secured via Stripe. Delivery within 5–10 business days in the EU. Returns accepted within 14 days.'),
  ('confidentialite', 'Politique de confidentialité', 'Privacy policy',
   'CLÉ PARIS collecte uniquement les données nécessaires au traitement de votre commande. Aucune donnée n''est cédée à des tiers. Vous disposez d''un droit d''accès, de rectification et d''effacement.',
   'CLÉ PARIS only collects data necessary to process your order. No data is shared with third parties. You have the right to access, rectify and delete your data.'),
  ('livraison', 'Livraisons & retours', 'Shipping & returns',
   'Livraison gratuite dès 200€ en France métropolitaine. Expéditions sous 48h ouvrées. Retours acceptés dans les 14 jours suivant réception.',
   'Free delivery from €200 in mainland France. Shipped within 48 working hours. Returns accepted within 14 days of receipt.')
on conflict (slug) do nothing;

-- Store settings
insert into store_settings (key, value, type) values
  ('store_name', 'CLÉ PARIS', 'text'),
  ('store_email', 'contact@cleparis.store', 'email'),
  ('currency', 'EUR', 'text'),
  ('free_shipping_threshold', '200', 'number'),
  ('instagram_url', 'https://instagram.com', 'url'),
  ('x_url', 'https://x.com', 'url'),
  ('shipping_delay_fr', '48h ouvrées', 'text'),
  ('shipping_delay_en', '48 working hours', 'text'),
  ('returns_window_days', '14', 'number')
on conflict (key) do nothing;

-- Default admin user
insert into admin_users (email, name, role) values
  ('admin@cleparis.store', 'Admin CLÉ PARIS', 'admin')
on conflict (email) do nothing;

-- Default homepage sections
insert into homepage_sections (key, type, title_fr, title_en, subtitle_fr, subtitle_en, body_fr, body_en, sort_order, is_visible) values
  ('hero', 'hero',
   'Campagne CLÉ PARIS 2026', '2026 CLÉ PARIS Campaign',
   'CLÉ 01™', 'CLÉ 01™',
   'Streetwear haut de gamme façonné par la texture.', 'Premium streetwear shaped by texture.',
   1, true),
  ('ticker', 'ticker',
   NULL, NULL,
   NULL, NULL,
   '100% Coton Biologique · Confectionné en Europe · 500 GSM Dense Weave', '100% Organic Cotton · Made in Europe · 500 GSM Dense Weave',
   2, true),
  ('featured_products', 'product_grid',
   'Dernière collection', 'Latest collection',
   NULL, NULL, NULL, NULL,
   3, true),
  ('image_text', 'image_text',
   'Drapé & silhouette architecturaux', 'Architectural drape & silhouette',
   'Conception Paris', 'Paris Design',
   'Développé dans nos ateliers parisiens pour garantir un tombé structurel parfait.', 'Developed in our Parisian ateliers to guarantee a perfect structural drape.',
   4, true),
  ('manifesto', 'text_block',
   'L''Atelier Clé Paris', 'The Clé Paris Atelier',
   '// Notre Manifeste', '// Our Manifesto',
   'Chaque pièce est une réponse à la matière. Nous créons des formes intemporelles au tombé impeccable, alliant la rigueur de l''architecture à la douceur de textures d''exception.',
   'Every piece is a response to the material. We create timeless forms with impeccable drape, combining the rigour of architecture with the softness of exceptional textures.',
   5, true)
on conflict (key) do nothing;
