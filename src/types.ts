export type Lang = "fr" | "en";

export type ProductColor = {
  id: string;
  label: { fr: string; en: string };
  hex: string;
};

export type ProductVariant = {
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
  colorId: string;
  stock: number;
};

export type Product = {
  slug: string;
  name: string;
  category: "hoodie" | "crewneck" | "pants" | "shorts" | "tshirt" | "accessory";
  price: number;
  currency: "EUR";
  description: { fr: string; en: string };
  material: { fr: string; en: string };
  colors: ProductColor[];
  variants: ProductVariant[];
  images: string[];
  archived?: boolean;
};

export type CartItem = {
  productSlug: string;
  size: ProductVariant["size"];
  colorId: string;
  qty: number;
};
