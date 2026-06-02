-- CLÉ PARIS seed data — 2026 collection

insert into public.product_colors (id, label_fr, label_en, hex) values
  ('oatmeal-grey', 'Gris Avoine', 'Oatmeal Grey', '#b8aa92'),
  ('void-black', 'Noir Vide', 'Void Black', '#0a0a0a'),
  ('midnight-onyx', 'Onyx Minuit', 'Midnight Onyx', '#15161a'),
  ('desert-sand', 'Sable du Désert', 'Desert Sand', '#c8b89a')
on conflict (id) do nothing;

insert into public.products (slug, name, category, price_cents, description_fr, description_en, material_fr, material_en, display_order) values
  ('hoodie-signature', 'Hoodie Signature', 'hoodie', 18000,
    'Sweat à capuche signature en coton lourd haut de gamme. Coupe architecturale oversize avec épaules tombantes et capuche doublée à double panneau sans cordon de serrage pour une silhouette minimaliste ultra-structurée.',
    'Signature hooded sweatshirt in premium heavyweight cotton. Architectural oversized cut with drop shoulders and a double-panel lined hood with no drawstring for an ultra-structured minimalist silhouette.',
    '100% Coton French Terry · 480 GSM Ultradense · Coupe Oversize / Épaule Tombante · Fabriqué au Portugal',
    '100% French Terry Cotton · 480 GSM Ultradense · Oversized / Drop Shoulder · Made in Portugal',
    1),
  ('crewneck-signature', 'Crewneck Signature', 'crewneck', 15000,
    'Sweat col rond en molleton de coton biologique épais. Finitions à bords-côtes extra-larges et double piqûre de renforcement sur toutes les coutures structurelles de la silhouette.',
    'Crewneck sweatshirt in thick organic cotton fleece. Extra-wide ribbed finishings and reinforced double stitching across every structural seam.',
    '100% Coton Biologique · 500 GSM Loopback Fleece · Coupe Boxy / Légèrement Raccourcie · Coutures Soie Ton sur Ton',
    '100% Organic Cotton · 500 GSM Loopback Fleece · Boxy / Slightly Cropped · Tonal Silk Seams',
    2),
  ('pantalon-cargo-structure', 'Pantalon Cargo Structuré', 'pants', 26000,
    'Pantalon cargo premium ajusté fabriqué dans un twill de coton rigide de haute tenue. Coupe ergonomique 3D avec plis articulés aux genoux et larges poches latérales à soufflet pour un volume structuré permanent.',
    'Premium fitted cargo trousers in rigid high-tenacity cotton twill. 3D ergonomic cut with articulated knee pleats and wide bellowed side pockets for permanent structured volume.',
    '100% Coton Twill Rigide · Boucles Acier Brossé · Poches Utilitaires 6 Zones · Jambe Droite / Couvre Rotule',
    '100% Rigid Twill Cotton · Brushed Steel Anchors · 6-Zone Utility Pockets · Straight Leg / Over Patella',
    3),
  ('short-cargo-utility', 'Short Cargo Utility', 'shorts', 13000,
    'Short cargo utilitaire taillé dans une gabardine de coton robuste. Poches plaquées grand volume, ajusteurs de taille par sangle technique et boucles de ceinture brutalistes.',
    'Utility cargo short cut from a robust cotton gabardine. Oversized patch pockets, technical strap waist adjusters and brutalist belt loops.',
    'Mélange Coton-Nylon Popeline · Boucles Métal Latérales · Renforts Cargo Modulaires · Coupe Relax / Au-dessus du Genou',
    'Cotton-Nylon Poplin Blend · Side Tab Metal Buckles · Modular Reinforced Cargo · Relaxed / Above Knee',
    4)
on conflict (slug) do nothing;

insert into public.product_images (product_slug, url, position, alt) values
  ('hoodie-signature', '/images/sweat2_model.png', 0, 'Hoodie Signature on model'),
  ('hoodie-signature', '/images/sweat2_flat.jpg', 1, 'Hoodie Signature flat'),
  ('crewneck-signature', '/images/sweat_model.png', 0, 'Crewneck Signature on model'),
  ('crewneck-signature', '/images/sweat_flat.jpg', 1, 'Crewneck Signature flat'),
  ('pantalon-cargo-structure', '/images/pantalon_model.png', 0, 'Cargo trousers on model'),
  ('pantalon-cargo-structure', '/images/pantalon_flat.jpg', 1, 'Cargo trousers flat'),
  ('short-cargo-utility', '/images/short_model.png', 0, 'Cargo short on model'),
  ('short-cargo-utility', '/images/short_flat.jpg', 1, 'Cargo short flat')
on conflict do nothing;

-- variants
do $$
declare s text;
begin
  -- Hoodie: S/M/L/XL × Oatmeal Grey
  foreach s in array array['S','M','L','XL'] loop
    insert into public.product_variants (product_slug, color_id, size, stock)
    values ('hoodie-signature', 'oatmeal-grey', s, 12)
    on conflict (product_slug, color_id, size) do nothing;
  end loop;

  -- Crewneck: S/M/L/XL × Void Black
  foreach s in array array['S','M','L','XL'] loop
    insert into public.product_variants (product_slug, color_id, size, stock)
    values ('crewneck-signature', 'void-black', s, 10)
    on conflict (product_slug, color_id, size) do nothing;
  end loop;

  -- Pantalon: S/M/L/XL × Midnight Onyx
  foreach s in array array['S','M','L','XL'] loop
    insert into public.product_variants (product_slug, color_id, size, stock)
    values ('pantalon-cargo-structure', 'midnight-onyx', s, 8)
    on conflict (product_slug, color_id, size) do nothing;
  end loop;

  -- Short: S/M/L × Desert Sand
  foreach s in array array['S','M','L'] loop
    insert into public.product_variants (product_slug, color_id, size, stock)
    values ('short-cargo-utility', 'desert-sand', s, 14)
    on conflict (product_slug, color_id, size) do nothing;
  end loop;
end $$;
