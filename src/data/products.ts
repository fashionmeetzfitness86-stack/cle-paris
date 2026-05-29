import type { Product } from "../types";

export const COLORS = {
  oatmealGrey: { id: "oatmeal-grey", label: { fr: "Gris Avoine", en: "Oatmeal Grey" }, hex: "#b8aa92" },
  voidBlack: { id: "void-black", label: { fr: "Noir Vide", en: "Void Black" }, hex: "#0a0a0a" },
  midnightOnyx: { id: "midnight-onyx", label: { fr: "Onyx Minuit", en: "Midnight Onyx" }, hex: "#15161a" },
  desertSand: { id: "desert-sand", label: { fr: "Sable du Désert", en: "Desert Sand" }, hex: "#c8b89a" },
} as const;

const apparelSizes = ["S", "M", "L", "XL"] as const;
const pantsSizes = ["S", "M", "L", "XL"] as const;
const shortSizes = ["S", "M", "L"] as const;

export const PRODUCTS: Product[] = [
  {
    slug: "hoodie-signature",
    name: "Hoodie Signature",
    category: "hoodie",
    price: 180,
    currency: "EUR",
    description: {
      fr: "Sweat à capuche signature en coton lourd haut de gamme. Coupe architecturale oversize avec épaules tombantes et capuche doublée à double panneau sans cordon de serrage pour une silhouette minimaliste ultra-structurée.",
      en: "Signature hooded sweatshirt in premium heavyweight cotton. Architectural oversized cut with drop shoulders and a double-panel lined hood with no drawstring for an ultra-structured minimalist silhouette.",
    },
    material: {
      fr: "100% Coton French Terry · 480 GSM Ultradense · Coupe Oversize / Épaule Tombante · Fabriqué au Portugal",
      en: "100% French Terry Cotton · 480 GSM Ultradense · Oversized / Drop Shoulder · Made in Portugal",
    },
    colors: [COLORS.oatmealGrey],
    variants: apparelSizes.map((size) => ({ size, colorId: COLORS.oatmealGrey.id, stock: 12 })),
    images: ["/images/sweat2_model.png", "/images/sweat2_flat.jpg"],
  },
  {
    slug: "crewneck-signature",
    name: "Crewneck Signature",
    category: "crewneck",
    price: 150,
    currency: "EUR",
    description: {
      fr: "Sweat col rond en molleton de coton biologique épais. Finitions à bords-côtes extra-larges et double piqûre de renforcement sur toutes les coutures structurelles de la silhouette.",
      en: "Crewneck sweatshirt in thick organic cotton fleece. Extra-wide ribbed finishings and reinforced double stitching across every structural seam.",
    },
    material: {
      fr: "100% Coton Biologique · 500 GSM Loopback Fleece · Coupe Boxy / Légèrement Raccourcie · Coutures Soie Ton sur Ton",
      en: "100% Organic Cotton · 500 GSM Loopback Fleece · Boxy / Slightly Cropped · Tonal Silk Seams",
    },
    colors: [COLORS.voidBlack],
    variants: apparelSizes.map((size) => ({ size, colorId: COLORS.voidBlack.id, stock: 10 })),
    images: ["/images/sweat_model.png", "/images/sweat_flat.jpg"],
  },
  {
    slug: "pantalon-cargo-structure",
    name: "Pantalon Cargo Structuré",
    category: "pants",
    price: 260,
    currency: "EUR",
    description: {
      fr: "Pantalon cargo premium ajusté fabriqué dans un twill de coton rigide de haute tenue. Coupe ergonomique 3D avec plis articulés aux genoux et larges poches latérales à soufflet pour un volume structuré permanent.",
      en: "Premium fitted cargo trousers in rigid high-tenacity cotton twill. 3D ergonomic cut with articulated knee pleats and wide bellowed side pockets for permanent structured volume.",
    },
    material: {
      fr: "100% Coton Twill Rigide · Boucles Acier Brossé · Poches Utilitaires 6 Zones · Jambe Droite / Couvre Rotule",
      en: "100% Rigid Twill Cotton · Brushed Steel Anchors · 6-Zone Utility Pockets · Straight Leg / Over Patella",
    },
    colors: [COLORS.midnightOnyx],
    variants: pantsSizes.map((size) => ({ size, colorId: COLORS.midnightOnyx.id, stock: 8 })),
    images: ["/images/pantalon_model.png", "/images/pantalon_flat.jpg"],
  },
  {
    slug: "short-cargo-utility",
    name: "Short Cargo Utility",
    category: "shorts",
    price: 130,
    currency: "EUR",
    description: {
      fr: "Short cargo utilitaire taillé dans une gabardine de coton robuste. Poches plaquées grand volume, ajusteurs de taille par sangle technique et boucles de ceinture brutalistes.",
      en: "Utility cargo short cut from a robust cotton gabardine. Oversized patch pockets, technical strap waist adjusters and brutalist belt loops.",
    },
    material: {
      fr: "Mélange Coton-Nylon Popeline · Boucles Métal Latérales · Renforts Cargo Modulaires · Coupe Relax / Au-dessus du Genou",
      en: "Cotton-Nylon Poplin Blend · Side Tab Metal Buckles · Modular Reinforced Cargo · Relaxed / Above Knee",
    },
    colors: [COLORS.desertSand],
    variants: shortSizes.map((size) => ({ size, colorId: COLORS.desertSand.id, stock: 14 })),
    images: ["/images/short_model.png", "/images/short_flat.jpg"],
  },
];

export const getProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getActiveProducts = () => PRODUCTS.filter((p) => !p.archived);
export const getArchivedProducts = () => PRODUCTS.filter((p) => p.archived);
