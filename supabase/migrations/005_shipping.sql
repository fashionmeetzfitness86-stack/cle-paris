-- ============================================================
-- CLÉ PARIS — Migration 005: Shipping settings (national vs international)
-- Run AFTER 001/002/003. Safe to re-run.
-- One config row: which countries are "national", the national and
-- international flat shipping prices, and an optional free-shipping
-- threshold (order subtotal >= threshold => free shipping).
-- ============================================================

CREATE TABLE IF NOT EXISTS shipping_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  national_countries text[] NOT NULL DEFAULT ARRAY['FR'],  -- ISO-2 codes
  national_price numeric(10,2) NOT NULL DEFAULT 0,
  international_price numeric(10,2) NOT NULL DEFAULT 0,
  free_shipping_threshold numeric(10,2),                   -- NULL = jamais gratuit
  currency text NOT NULL DEFAULT 'EUR',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_shipping" ON shipping_settings;
DROP POLICY IF EXISTS "admin_write_shipping" ON shipping_settings;

-- Cart needs to read shipping prices publicly
CREATE POLICY "public_read_shipping" ON shipping_settings FOR SELECT USING (true);
-- Only admins can change them
CREATE POLICY "admin_write_shipping" ON shipping_settings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Seed a single default row (France national, free over 150€)
INSERT INTO shipping_settings (national_countries, national_price, international_price, free_shipping_threshold)
SELECT ARRAY['FR'], 5, 15, 150
WHERE NOT EXISTS (SELECT 1 FROM shipping_settings);
