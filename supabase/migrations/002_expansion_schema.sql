-- ============================================================
-- CLÉ PARIS — Migration 002: Expansion Schema
-- Run AFTER 001_cleparis_schema.sql
-- Covers: content_blocks, video_url, product expansion,
--         digital assets, events, memberships, swim/fragrance
-- ============================================================

-- ─── Add video_url to homepage_sections ──────────────────────
ALTER TABLE homepage_sections
  ADD COLUMN IF NOT EXISTS video_url text NOT NULL DEFAULT '';

-- ─── Content Blocks (flexible JSONB-based page builder) ──────
-- A universal block system for any page on the site.
-- block_type drives rendering logic on the frontend.
-- 'data' JSONB holds type-specific fields (product slugs, etc.)
CREATE TABLE IF NOT EXISTS content_blocks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page        text NOT NULL DEFAULT 'home',
  block_type  text NOT NULL DEFAULT 'text'
    CHECK (block_type IN (
      'hero', 'collection_banner', 'text_block',
      'product_grid', 'testimonial_strip', 'media_grid',
      'newsletter', 'countdown', 'divider'
    )),
  title_fr    text NOT NULL DEFAULT '',
  title_en    text NOT NULL DEFAULT '',
  subtitle_fr text NOT NULL DEFAULT '',
  subtitle_en text NOT NULL DEFAULT '',
  body_fr     text NOT NULL DEFAULT '',
  body_en     text NOT NULL DEFAULT '',
  image       text NOT NULL DEFAULT '',
  video_url   text NOT NULL DEFAULT '',
  link        text NOT NULL DEFAULT '',
  cta_fr      text NOT NULL DEFAULT '',
  cta_en      text NOT NULL DEFAULT '',
  data        jsonb NOT NULL DEFAULT '{}',
  sort_order  integer NOT NULL DEFAULT 99,
  is_visible  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_blocks_page_idx ON content_blocks(page);
CREATE INDEX IF NOT EXISTS content_blocks_order_idx ON content_blocks(sort_order);

-- ─── Product Type Expansion ───────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'apparel'
    CHECK (product_type IN (
      'apparel', 'fragrance', 'swimwear',
      'accessory', 'digital', 'event_ticket', 'membership'
    ));

-- ─── Product Attributes (EAV — no schema changes for new types) ─
-- Fragrances: notes_top, notes_heart, notes_base, longevity, intensity
-- Swimwear: fabric, uv_protection, chlorine_resistant, coverage
-- Digital: file_format, file_size, download_url
-- Accessories: material, dimensions, care_instructions
CREATE TABLE IF NOT EXISTS product_attributes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  key         text NOT NULL,
  value_fr    text NOT NULL DEFAULT '',
  value_en    text NOT NULL DEFAULT '',
  sort_order  integer NOT NULL DEFAULT 99,
  UNIQUE(product_id, key)
);

CREATE INDEX IF NOT EXISTS product_attrs_product_idx ON product_attributes(product_id);

-- ─── Digital Assets (lookbooks, downloads, music, etc.) ──────
CREATE TABLE IF NOT EXISTS digital_assets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid REFERENCES products(id) ON DELETE CASCADE,
  name            text NOT NULL DEFAULT '',
  description_fr  text NOT NULL DEFAULT '',
  description_en  text NOT NULL DEFAULT '',
  file_url        text NOT NULL DEFAULT '',
  file_type       text NOT NULL DEFAULT '',   -- pdf, zip, mp4, mp3, epub
  file_size_bytes bigint NOT NULL DEFAULT 0,
  download_limit  integer,                    -- NULL = unlimited
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Events & Tickets ─────────────────────────────────────────
-- Pop-ups, shows, trunk shows, launches
CREATE TABLE IF NOT EXISTS events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  name_fr         text NOT NULL DEFAULT '',
  name_en         text NOT NULL DEFAULT '',
  description_fr  text NOT NULL DEFAULT '',
  description_en  text NOT NULL DEFAULT '',
  location        text NOT NULL DEFAULT '',
  address         text NOT NULL DEFAULT '',
  starts_at       timestamptz NOT NULL DEFAULT now(),
  ends_at         timestamptz,
  cover_image     text NOT NULL DEFAULT '',
  max_capacity    integer,                    -- NULL = unlimited
  is_published    boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  product_id      uuid REFERENCES products(id) ON DELETE SET NULL,
  ticket_type     text NOT NULL DEFAULT 'general'
    CHECK (ticket_type IN ('general', 'vip', 'press', 'friend')),
  name_fr         text NOT NULL DEFAULT '',
  name_en         text NOT NULL DEFAULT '',
  price           numeric(10,2) NOT NULL DEFAULT 0,
  quantity        integer NOT NULL DEFAULT 0,
  sold_count      integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS event_tickets_event_idx ON event_tickets(event_id);

-- ─── Memberships / Subscriptions ─────────────────────────────
-- CLÉ Circle, Swim Pass, etc.
CREATE TABLE IF NOT EXISTS memberships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  name_fr         text NOT NULL DEFAULT '',
  name_en         text NOT NULL DEFAULT '',
  description_fr  text NOT NULL DEFAULT '',
  description_en  text NOT NULL DEFAULT '',
  price_monthly   numeric(10,2),
  price_yearly    numeric(10,2),
  perks           jsonb NOT NULL DEFAULT '[]',  -- ["Free shipping", "Early access"]
  badge_color     text NOT NULL DEFAULT '#c8b89a',
  max_members     integer,                      -- NULL = unlimited
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── RLS for new tables ───────────────────────────────────────
ALTER TABLE content_blocks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_assets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tickets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships         ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read_content_blocks"
  ON content_blocks FOR SELECT USING (is_visible = true);

CREATE POLICY "public_read_product_attributes"
  ON product_attributes FOR SELECT USING (true);

CREATE POLICY "public_read_events"
  ON events FOR SELECT USING (is_published = true);

CREATE POLICY "public_read_event_tickets"
  ON event_tickets FOR SELECT USING (true);

CREATE POLICY "public_read_memberships"
  ON memberships FOR SELECT USING (is_active = true);

-- Auth write
CREATE POLICY "auth_write_content_blocks"
  ON content_blocks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_write_product_attributes"
  ON product_attributes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_write_digital_assets"
  ON digital_assets FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_write_events"
  ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_write_event_tickets"
  ON event_tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_write_memberships"
  ON memberships FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Storage: add products/ and hero/ folder policies ─────────
-- These work within the existing cle-paris-media bucket.
-- Supabase Storage uses path prefixes as "folders".
-- No extra SQL needed — just upload to `products/` or `hero/` prefix.

-- ─── Seed: homepage content blocks example ───────────────────
INSERT INTO content_blocks (
  page, block_type, title_fr, title_en, subtitle_fr, subtitle_en,
  body_fr, body_en, image, video_url, link, cta_fr, cta_en, sort_order, is_visible
) VALUES
  ('home', 'hero',
   'La Mode Sans Compromis', 'Fashion Without Compromise',
   'Collection Ombre Saison 2024', 'Ombre Season Collection 2024',
   'Des pièces pensées pour durer.', 'Pieces designed to last.',
   'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=1600',
   '',
   '/collection',
   'Découvrir la collection', 'Discover the collection',
   1, true)
ON CONFLICT DO NOTHING;

-- ─── Comments for dev team ────────────────────────────────────
COMMENT ON TABLE content_blocks IS
  'Universal page builder blocks. Each block has a type that maps to a React component on the frontend. The data JSONB column holds type-specific fields (e.g., product slugs for product_grid blocks).';

COMMENT ON TABLE product_attributes IS
  'Flexible EAV attributes for any product type. Fragrances store scent notes here. Swimwear stores UPF rating. No schema changes needed for new attribute types.';

COMMENT ON TABLE events IS
  'CLÉ PARIS events: pop-ups, trunk shows, launches. Tickets are sold as products linked via event_tickets.';

COMMENT ON TABLE memberships IS
  'CLÉ Circle membership tiers. perks JSONB is an array of perk description strings rendered as bullet points.';
