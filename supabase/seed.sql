-- ============================================================
-- CLÉ PARIS — Seed data (2026 collection)
-- Targets the canonical schema (001_cleparis_schema.sql):
--   products(uuid, slug, category_id, price, …)
--   product_colors(uuid, product_id, slug, label_fr/en, hex)
--   product_media(uuid, product_id, url, alt, type, sort_order)
--   product_variants(uuid, product_id, color_id uuid, size, stock)
-- Idempotent: safe to re-run (ON CONFLICT … DO NOTHING).
-- Categories are seeded by 001_cleparis_schema.sql (hauts / bas / accessoires).
-- ============================================================

-- Fixed UUIDs so colors/media/variants can reference products deterministically.
INSERT INTO public.products
  (id, slug, name, category_id, price, currency,
   description_fr, description_en, material_fr, material_en,
   is_new, is_featured, sort_order)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'hoodie-signature', 'Hoodie Signature',
   '11111111-0001-0001-0001-000000000001', 180, 'EUR',
   'Sweat à capuche signature en coton lourd haut de gamme. Coupe architecturale oversize avec épaules tombantes et capuche doublée à double panneau sans cordon de serrage pour une silhouette minimaliste ultra-structurée.',
   'Signature hooded sweatshirt in premium heavyweight cotton. Architectural oversized cut with drop shoulders and a double-panel lined hood with no drawstring for an ultra-structured minimalist silhouette.',
   '100% Coton French Terry · 480 GSM Ultradense · Coupe Oversize / Épaule Tombante · Fabriqué au Portugal',
   '100% French Terry Cotton · 480 GSM Ultradense · Oversized / Drop Shoulder · Made in Portugal',
   true, true, 1),
  ('a0000000-0000-0000-0000-000000000002', 'crewneck-signature', 'Crewneck Signature',
   '11111111-0001-0001-0001-000000000001', 150, 'EUR',
   'Sweat col rond en molleton de coton biologique épais. Finitions à bords-côtes extra-larges et double piqûre de renforcement sur toutes les coutures structurelles de la silhouette.',
   'Crewneck sweatshirt in thick organic cotton fleece. Extra-wide ribbed finishings and reinforced double stitching across every structural seam.',
   '100% Coton Biologique · 500 GSM Loopback Fleece · Coupe Boxy / Légèrement Raccourcie · Coutures Soie Ton sur Ton',
   '100% Organic Cotton · 500 GSM Loopback Fleece · Boxy / Slightly Cropped · Tonal Silk Seams',
   true, false, 2),
  ('a0000000-0000-0000-0000-000000000003', 'pantalon-cargo-structure', 'Pantalon Cargo Structuré',
   '11111111-0001-0001-0001-000000000002', 260, 'EUR',
   'Pantalon cargo premium ajusté fabriqué dans un twill de coton rigide de haute tenue. Coupe ergonomique 3D avec plis articulés aux genoux et larges poches latérales à soufflet pour un volume structuré permanent.',
   'Premium fitted cargo trousers in rigid high-tenacity cotton twill. 3D ergonomic cut with articulated knee pleats and wide bellowed side pockets for permanent structured volume.',
   '100% Coton Twill Rigide · Boucles Acier Brossé · Poches Utilitaires 6 Zones · Jambe Droite / Couvre Rotule',
   '100% Rigid Twill Cotton · Brushed Steel Anchors · 6-Zone Utility Pockets · Straight Leg / Over Patella',
   true, false, 3),
  ('a0000000-0000-0000-0000-000000000004', 'short-cargo-utility', 'Short Cargo Utility',
   '11111111-0001-0001-0001-000000000002', 130, 'EUR',
   'Short cargo utilitaire taillé dans une gabardine de coton robuste. Poches plaquées grand volume, ajusteurs de taille par sangle technique et boucles de ceinture brutalistes.',
   'Utility cargo short cut from a robust cotton gabardine. Oversized patch pockets, technical strap waist adjusters and brutalist belt loops.',
   'Mélange Coton-Nylon Popeline · Boucles Métal Latérales · Renforts Cargo Modulaires · Coupe Relax / Au-dessus du Genou',
   'Cotton-Nylon Poplin Blend · Side Tab Metal Buckles · Modular Reinforced Cargo · Relaxed / Above Knee',
   true, false, 4)
ON CONFLICT (slug) DO NOTHING;

-- One color per product (matches the static catalog).
INSERT INTO public.product_colors (id, product_id, slug, label_fr, label_en, hex) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'oatmeal-grey',  'Gris Avoine',      'Oatmeal Grey',  '#b8aa92'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'void-black',    'Noir Vide',        'Void Black',    '#0a0a0a'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'midnight-onyx', 'Onyx Minuit',      'Midnight Onyx', '#15161a'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'desert-sand',   'Sable du Désert',  'Desert Sand',   '#c8b89a')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_media (product_id, url, alt, type, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', '/images/sweat2_model.png', 'Hoodie Signature on model', 'image', 1),
  ('a0000000-0000-0000-0000-000000000001', '/images/sweat2_flat.jpg',  'Hoodie Signature flat',     'image', 2),
  ('a0000000-0000-0000-0000-000000000002', '/images/sweat_model.png',  'Crewneck Signature on model','image', 1),
  ('a0000000-0000-0000-0000-000000000002', '/images/sweat_flat.jpg',   'Crewneck Signature flat',   'image', 2),
  ('a0000000-0000-0000-0000-000000000003', '/images/pantalon_model.png','Cargo trousers on model',  'image', 1),
  ('a0000000-0000-0000-0000-000000000003', '/images/pantalon_flat.jpg', 'Cargo trousers flat',      'image', 2),
  ('a0000000-0000-0000-0000-000000000004', '/images/short_model.png',  'Cargo short on model',      'image', 1),
  ('a0000000-0000-0000-0000-000000000004', '/images/short_flat.jpg',   'Cargo short flat',          'image', 2)
ON CONFLICT DO NOTHING;

-- Variants: sizes per product, all in stock.
DO $$
DECLARE
  s text;
  rec record;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('a0000000-0000-0000-0000-000000000001'::uuid, 'c0000000-0000-0000-0000-000000000001'::uuid, ARRAY['S','M','L','XL'], 12),
      ('a0000000-0000-0000-0000-000000000002'::uuid, 'c0000000-0000-0000-0000-000000000002'::uuid, ARRAY['S','M','L','XL'], 10),
      ('a0000000-0000-0000-0000-000000000003'::uuid, 'c0000000-0000-0000-0000-000000000003'::uuid, ARRAY['S','M','L','XL'], 8),
      ('a0000000-0000-0000-0000-000000000004'::uuid, 'c0000000-0000-0000-0000-000000000004'::uuid, ARRAY['S','M','L'],      14)
    ) AS t(product_id uuid, color_id uuid, sizes text[], stock int)
  LOOP
    FOREACH s IN ARRAY rec.sizes LOOP
      INSERT INTO public.product_variants (product_id, color_id, size, stock)
      SELECT rec.product_id, rec.color_id, s, rec.stock
      WHERE NOT EXISTS (
        SELECT 1 FROM public.product_variants
        WHERE product_id = rec.product_id AND color_id = rec.color_id AND size = s
      );
    END LOOP;
  END LOOP;
END $$;
