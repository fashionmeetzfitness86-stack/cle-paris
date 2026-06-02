-- ============================================================
-- CLÉ PARIS — Full Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_fr text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT ''
);

-- ─── Collections ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_fr text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  description_fr text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true
);

-- ─── Products ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_at_price numeric(10,2),
  currency text NOT NULL DEFAULT 'EUR',
  description_fr text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  material_fr text NOT NULL DEFAULT '',
  material_en text NOT NULL DEFAULT '',
  is_archived boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 99,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_archived_idx ON products(is_archived);

-- ─── Product Colors ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  slug text NOT NULL,
  label_fr text NOT NULL DEFAULT '',
  label_en text NOT NULL DEFAULT '',
  hex text NOT NULL DEFAULT '#000000'
);

CREATE INDEX IF NOT EXISTS product_colors_product_idx ON product_colors(product_id);

-- ─── Product Variants ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id uuid NOT NULL REFERENCES product_colors(id) ON DELETE CASCADE,
  size text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  sku text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants(product_id);

-- ─── Product Media ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL DEFAULT '',
  alt text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  sort_order integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS product_media_product_idx ON product_media(product_id);

-- ─── Customers ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Orders ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','processing','shipped','delivered','refunded','cancelled')),
  total numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  shipping_address jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_customer_idx ON orders(customer_email);

-- ─── Order Items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  name text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  qty integer NOT NULL DEFAULT 1,
  size text NOT NULL DEFAULT '',
  color_id text NOT NULL DEFAULT '',
  color_label text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

-- ─── Blog Posts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_fr text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  body_fr text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Testimonials ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  quote_fr text NOT NULL DEFAULT '',
  quote_en text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_visible boolean NOT NULL DEFAULT true
);

-- ─── SEO Settings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text UNIQUE NOT NULL,
  title_fr text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_fr text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  og_image text NOT NULL DEFAULT ''
);

-- ─── Legal Pages ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS legal_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_fr text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  body_fr text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT ''
);

-- ─── I18n Entries ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS i18n_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace text NOT NULL,
  key text NOT NULL,
  value_fr text NOT NULL DEFAULT '',
  value_en text NOT NULL DEFAULT '',
  UNIQUE(namespace, key)
);

-- ─── Store Settings ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'string'
);

-- ─── Homepage Sections ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'block',
  title_fr text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  subtitle_fr text NOT NULL DEFAULT '',
  subtitle_en text NOT NULL DEFAULT '',
  body_fr text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 99,
  is_visible boolean NOT NULL DEFAULT true
);

-- ─── Banner ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_fr text NOT NULL DEFAULT '',
  message_en text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  background_color text NOT NULL DEFAULT '#1a1a1a',
  text_color text NOT NULL DEFAULT '#e8e2d6'
);

-- ─── Admin Users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Activity Log ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL DEFAULT '',
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_log_created_idx ON activity_log(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE i18n_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Public read policies (storefront needs these)
CREATE POLICY "public_read_categories"    ON categories         FOR SELECT USING (true);
CREATE POLICY "public_read_collections"   ON collections        FOR SELECT USING (true);
CREATE POLICY "public_read_products"      ON products           FOR SELECT USING (is_archived = false);
CREATE POLICY "public_read_product_colors" ON product_colors    FOR SELECT USING (true);
CREATE POLICY "public_read_product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "public_read_product_media" ON product_media      FOR SELECT USING (true);
CREATE POLICY "public_read_blog_posts"    ON blog_posts         FOR SELECT USING (is_published = true);
CREATE POLICY "public_read_testimonials"  ON testimonials       FOR SELECT USING (is_visible = true);
CREATE POLICY "public_read_seo_settings"  ON seo_settings       FOR SELECT USING (true);
CREATE POLICY "public_read_legal_pages"   ON legal_pages        FOR SELECT USING (true);
CREATE POLICY "public_read_i18n_entries"  ON i18n_entries       FOR SELECT USING (true);
CREATE POLICY "public_read_store_settings" ON store_settings    FOR SELECT USING (true);
CREATE POLICY "public_read_homepage_sections" ON homepage_sections FOR SELECT USING (is_visible = true);
CREATE POLICY "public_read_banner"        ON banner             FOR SELECT USING (is_active = true);

-- Authenticated write policies (admin operations)
CREATE POLICY "auth_write_categories"     ON categories         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_collections"    ON collections        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_products"       ON products           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_product_colors" ON product_colors     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_product_variants" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_product_media"  ON product_media      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_customers"       ON customers          FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_customers"      ON customers          FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_orders"          ON orders             FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_orders"         ON orders             FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_order_items"     ON order_items        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_order_items"    ON order_items        FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_blog_posts"     ON blog_posts         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_testimonials"   ON testimonials       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_seo_settings"   ON seo_settings       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_legal_pages"    ON legal_pages        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_i18n_entries"   ON i18n_entries       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_store_settings" ON store_settings     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_homepage_sections" ON homepage_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_banner"         ON banner             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_admin_users"     ON admin_users        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_admin_users"    ON admin_users        FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_activity_log"    ON activity_log       FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_activity_log"   ON activity_log       FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Run this separately in Supabase Storage (or via SQL):
INSERT INTO storage.buckets (id, name, public) VALUES ('cle-paris-media', 'cle-paris-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cle-paris-media');

CREATE POLICY "auth_upload_media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cle-paris-media');

CREATE POLICY "auth_delete_media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cle-paris-media');

-- ============================================================
-- SEED DATA (matches mockData.ts)
-- ============================================================

INSERT INTO categories (id, slug, name_fr, name_en) VALUES
  ('11111111-0001-0001-0001-000000000001', 'hauts', 'Hauts', 'Tops'),
  ('11111111-0001-0001-0001-000000000002', 'bas', 'Bas', 'Bottoms'),
  ('11111111-0001-0001-0001-000000000003', 'accessoires', 'Accessoires', 'Accessories')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO collections (id, slug, name_fr, name_en, description_fr, description_en, cover_image, is_active) VALUES
  ('22222222-0001-0001-0001-000000000001', 'ombre', 'Ombre Saison', 'Shadow Season',
   'Une collection inspirée par les ombres portées du crépuscule parisien.',
   'A collection inspired by the long shadows of Parisian dusk.',
   'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=800', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO banner (id, message_fr, message_en, link, is_active, background_color, text_color) VALUES
  ('33333333-0001-0001-0001-000000000001',
   'Livraison offerte en France à partir de 150 € — Collection Ombre disponible maintenant',
   'Free shipping in France from €150 — Ombre Collection now available',
   '/collection', true, '#1a1a1a', '#e8e2d6')
ON CONFLICT DO NOTHING;

INSERT INTO seo_settings (page, title_fr, title_en, description_fr, description_en, og_image) VALUES
  ('home', 'CLÉ PARIS — Mode Essentielle', 'CLÉ PARIS — Essential Fashion',
   'Streetwear de luxe parisien. Pièces intemporelles conçues pour durer.',
   'Parisian luxury streetwear. Timeless pieces designed to last.',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200'),
  ('collection', 'Collection — CLÉ PARIS', 'Collection — CLÉ PARIS',
   'Découvrez la collection CLÉ PARIS.', 'Discover the CLÉ PARIS collection.', ''),
  ('about', 'À propos — CLÉ PARIS', 'About — CLÉ PARIS',
   'Notre histoire, nos valeurs.', 'Our story, our values.', ''),
  ('blog', 'Journal — CLÉ PARIS', 'Journal — CLÉ PARIS',
   'Le journal CLÉ PARIS.', 'The CLÉ PARIS journal.', '')
ON CONFLICT (page) DO NOTHING;

INSERT INTO store_settings (key, value, type) VALUES
  ('store_name', 'CLÉ PARIS', 'string'),
  ('contact_email', 'bonjour@cleparis.store', 'string'),
  ('currency', 'EUR', 'string'),
  ('free_shipping_threshold', '150', 'number'),
  ('shipping_delay_fr', '2-4 jours ouvrés', 'string'),
  ('shipping_delay_en', '2-4 working days', 'string'),
  ('returns_window_days', '30', 'number'),
  ('instagram_url', 'https://instagram.com/cleparis', 'string'),
  ('twitter_url', 'https://x.com/cleparis', 'string')
ON CONFLICT (key) DO NOTHING;

INSERT INTO homepage_sections (key, type, title_fr, title_en, subtitle_fr, subtitle_en, body_fr, body_en, image, link, sort_order, is_visible) VALUES
  ('hero', 'hero', 'La Mode Sans Compromis', 'Fashion Without Compromise',
   'Collection Ombre Saison 2024', 'Ombre Season Collection 2024',
   'Des pièces pensées pour durer.', 'Pieces designed to last.',
   'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=1600', '/collection', 1, true),
  ('featured_collection', 'collection_banner', 'Ombre Saison', 'Shadow Season',
   'Automne-Hiver 2024', 'Autumn-Winter 2024',
   'Inspirée par les ombres portées du crépuscule parisien.',
   'Inspired by the long shadows of Parisian dusk.',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', '/collection', 2, true),
  ('newsletter', 'newsletter', 'Rejoignez le cercle', 'Join the circle',
   'Accès prioritaire aux nouvelles collections', 'Priority access to new collections',
   '', '', '', '', 3, false)
ON CONFLICT (key) DO NOTHING;

INSERT INTO legal_pages (slug, title_fr, title_en, body_fr, body_en) VALUES
  ('mentions-legales', 'Mentions légales', 'Legal Notice',
   'CLÉ PARIS SAS, au capital de 50 000 €, RCS Paris B 123 456 789. Siège social : 1 Rue de la Paix, 75001 Paris.',
   'CLÉ PARIS SAS, share capital €50,000, RCS Paris B 123 456 789. Registered office: 1 Rue de la Paix, 75001 Paris.'),
  ('cgv', 'Conditions Générales de Vente', 'Terms & Conditions',
   'Les présentes Conditions Générales de Vente régissent les relations contractuelles entre CLÉ PARIS et ses clients.',
   'These Terms and Conditions govern the contractual relationship between CLÉ PARIS and its customers.'),
  ('confidentialite', 'Politique de confidentialité', 'Privacy Policy',
   'CLÉ PARIS collecte vos données personnelles uniquement dans le cadre de la gestion de vos commandes.',
   'CLÉ PARIS collects your personal data only for the purpose of managing your orders.'),
  ('livraison-retours', 'Livraison & Retours', 'Shipping & Returns',
   'Livraison gratuite en France métropolitaine à partir de 150 €. Retours acceptés sous 30 jours.',
   'Free shipping in metropolitan France for orders over €150. Returns accepted within 30 days.')
ON CONFLICT (slug) DO NOTHING;
