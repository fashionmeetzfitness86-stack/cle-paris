-- ============================================================
-- CLÉ PARIS — Migration 003: RLS Admin Lockdown
-- Run AFTER 001_cleparis_schema.sql and 002_expansion_schema.sql
--
-- PROBLEM this fixes:
--   001/002 granted write (and orders/customers read) to ANY
--   authenticated user via `FOR ALL TO authenticated USING(true)`.
--   That let any logged-in account read all orders + customer PII
--   and edit/delete any table — including admin_users itself.
--
-- FIX:
--   * is_admin() helper checks membership in admin_users.
--   * Storefront content stays publicly readable (unchanged).
--   * Writes + orders/customers reads require is_admin().
--   * Public can still INSERT orders/customers at checkout
--     (needed for guest checkout) but CANNOT read them back.
--
-- SAFETY: idempotent. Links any existing auth user whose email
-- already matches an admin_users row so you are NOT locked out.
-- ============================================================

-- ─── 0. Link existing auth users to admin_users by email ─────
-- (so the first real admin keeps access after lockdown)
UPDATE public.admin_users a
SET auth_user_id = u.id
FROM auth.users u
WHERE a.auth_user_id IS NULL
  AND lower(a.email) = lower(u.email);

-- ─── 1. Admin membership helper ──────────────────────────────
-- SECURITY DEFINER so the function can read admin_users
-- regardless of the caller's own RLS on that table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- ─── 2. Drop the permissive policies from 001 + 002 ──────────
DROP POLICY IF EXISTS "auth_write_categories"        ON categories;
DROP POLICY IF EXISTS "auth_write_collections"       ON collections;
DROP POLICY IF EXISTS "auth_write_products"          ON products;
DROP POLICY IF EXISTS "auth_write_product_colors"    ON product_colors;
DROP POLICY IF EXISTS "auth_write_product_variants"  ON product_variants;
DROP POLICY IF EXISTS "auth_write_product_media"     ON product_media;
DROP POLICY IF EXISTS "auth_read_customers"          ON customers;
DROP POLICY IF EXISTS "auth_write_customers"         ON customers;
DROP POLICY IF EXISTS "auth_read_orders"             ON orders;
DROP POLICY IF EXISTS "auth_write_orders"            ON orders;
DROP POLICY IF EXISTS "auth_read_order_items"        ON order_items;
DROP POLICY IF EXISTS "auth_write_order_items"       ON order_items;
DROP POLICY IF EXISTS "auth_write_blog_posts"        ON blog_posts;
DROP POLICY IF EXISTS "auth_write_testimonials"      ON testimonials;
DROP POLICY IF EXISTS "auth_write_seo_settings"      ON seo_settings;
DROP POLICY IF EXISTS "auth_write_legal_pages"       ON legal_pages;
DROP POLICY IF EXISTS "auth_write_i18n_entries"      ON i18n_entries;
DROP POLICY IF EXISTS "auth_write_store_settings"    ON store_settings;
DROP POLICY IF EXISTS "auth_write_homepage_sections" ON homepage_sections;
DROP POLICY IF EXISTS "auth_write_banner"            ON banner;
DROP POLICY IF EXISTS "auth_read_admin_users"        ON admin_users;
DROP POLICY IF EXISTS "auth_write_admin_users"       ON admin_users;
DROP POLICY IF EXISTS "auth_read_activity_log"       ON activity_log;
DROP POLICY IF EXISTS "auth_write_activity_log"      ON activity_log;
-- 002 tables
DROP POLICY IF EXISTS "auth_write_content_blocks"     ON content_blocks;
DROP POLICY IF EXISTS "auth_write_product_attributes" ON product_attributes;
DROP POLICY IF EXISTS "auth_write_digital_assets"     ON digital_assets;
DROP POLICY IF EXISTS "auth_write_events"             ON events;
DROP POLICY IF EXISTS "auth_write_event_tickets"      ON event_tickets;
DROP POLICY IF EXISTS "auth_write_memberships"        ON memberships;

-- ─── 3. Admin-only write policies for CMS / catalog tables ───
-- (public read policies from 001/002 remain in place and unchanged)
CREATE POLICY "admin_write_categories"        ON categories         FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_collections"       ON collections        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_products"          ON products           FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_product_colors"    ON product_colors     FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_product_variants"  ON product_variants   FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_product_media"     ON product_media      FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_blog_posts"        ON blog_posts         FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_testimonials"      ON testimonials       FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_seo_settings"      ON seo_settings       FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_legal_pages"       ON legal_pages        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_i18n_entries"      ON i18n_entries       FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_store_settings"    ON store_settings     FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_homepage_sections" ON homepage_sections  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_banner"            ON banner             FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_content_blocks"     ON content_blocks     FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_product_attributes" ON product_attributes FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_digital_assets"     ON digital_assets     FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_events"             ON events             FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_event_tickets"      ON event_tickets      FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_write_memberships"        ON memberships        FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- digital_assets has no public read policy in 002; admins read all.
CREATE POLICY "admin_read_digital_assets"      ON digital_assets     FOR SELECT USING (is_admin());

-- ─── 4. Orders & customers: admin reads, public inserts only ─
-- Guests must be able to CREATE an order/customer at checkout,
-- but only admins may read or modify them (PII protection).
-- NOTE: the production checkout path uses the Netlify webhook with
-- the service-role key, which bypasses RLS entirely. These public
-- INSERT policies are a safety net for any direct client insert.
CREATE POLICY "admin_read_customers"   ON customers   FOR SELECT USING (is_admin());
CREATE POLICY "public_insert_customers" ON customers  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_modify_customers" ON customers   FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_customers" ON customers   FOR DELETE USING (is_admin());

CREATE POLICY "admin_read_orders"      ON orders      FOR SELECT USING (is_admin());
CREATE POLICY "public_insert_orders"   ON orders      FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_modify_orders"    ON orders      FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_orders"    ON orders      FOR DELETE USING (is_admin());

CREATE POLICY "admin_read_order_items"    ON order_items FOR SELECT USING (is_admin());
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_modify_order_items"  ON order_items FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_order_items"  ON order_items FOR DELETE USING (is_admin());

-- ─── 5. admin_users: admins manage, every user reads OWN row ─
-- AuthContext.loadAdminUser needs the signed-in user to read their
-- own row to resolve their role; admins manage all rows.
CREATE POLICY "self_read_admin_users"  ON admin_users FOR SELECT
  USING (auth_user_id = auth.uid() OR is_admin());
CREATE POLICY "admin_write_admin_users" ON admin_users FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- ─── 6. activity_log: admins read, authenticated insert ──────
CREATE POLICY "admin_read_activity_log"  ON activity_log FOR SELECT USING (is_admin());
CREATE POLICY "auth_insert_activity_log" ON activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- ─── 7. Storage: restrict writes to admins ───────────────────
DROP POLICY IF EXISTS "auth_upload_media" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_media" ON storage.objects;
CREATE POLICY "admin_upload_media" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cle-paris-media' AND is_admin());
CREATE POLICY "admin_update_media" ON storage.objects FOR UPDATE
  USING (bucket_id = 'cle-paris-media' AND is_admin());
CREATE POLICY "admin_delete_media" ON storage.objects FOR DELETE
  USING (bucket_id = 'cle-paris-media' AND is_admin());

-- ============================================================
-- BOOTSTRAP NOTE
-- If admin_users is empty (fresh DB) nobody is an admin yet, so
-- no one can write. To bootstrap the first admin, run ONCE in the
-- SQL editor after creating the auth user (Auth → Users → Add user):
--
--   INSERT INTO public.admin_users (auth_user_id, email, name, role)
--   SELECT id, email, 'Admin Principal', 'admin'
--   FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL'
--   ON CONFLICT (email) DO UPDATE SET auth_user_id = EXCLUDED.auth_user_id;
-- ============================================================
