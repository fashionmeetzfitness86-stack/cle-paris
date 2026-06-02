// Admin Dashboard TypeScript Types
import type { ReactNode } from 'react';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  collection_id: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  description_fr: string;
  description_en: string;
  material_fr: string;
  material_en: string;
  is_archived: boolean;
  is_new: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

export type ProductColor = {
  id: string;
  product_id: string;
  slug: string;
  label_fr: string;
  label_en: string;
  hex: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  color_id: string;
  size: string;
  stock: number;
  sku: string;
};

export type ProductMedia = {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  type: 'image' | 'video';
  sort_order: number;
};

export type Category = {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
};

export type Collection = {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  cover_image: string;
  is_active: boolean;
};

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'refunded'
  | 'cancelled';

export type OrderItem = {
  productSlug: string;
  name: string;
  price: number;
  qty: number;
  size: string;
  colorId: string;
  colorLabel: string;
  image: string;
};

export type ShippingAddress = {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  country: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_email: string;
  status: OrderStatus;
  total: number;
  currency: string;
  items: OrderItem[];
  shipping_address: ShippingAddress | null;
  created_at: string;
};

export type Customer = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string;
  body_fr: string;
  body_en: string;
  cover_image: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

export type Testimonial = {
  id: string;
  author: string;
  role: string;
  quote_fr: string;
  quote_en: string;
  rating: number;
  is_visible: boolean;
};

export type LegalPage = {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string;
  body_fr: string;
  body_en: string;
};

export type SeoSetting = {
  id: string;
  page: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  og_image: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  last_login: string | null;
  created_at: string;
};

export type Banner = {
  id: string;
  message_fr: string;
  message_en: string;
  link: string;
  is_active: boolean;
  background_color: string;
  text_color: string;
};

export type HomepageSection = {
  id: string;
  key: string;
  type: string;
  title_fr: string;
  title_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  body_fr: string;
  body_en: string;
  image: string;
  video_url: string;
  link: string;
  sort_order: number;
  is_visible: boolean;
};

export type StoreSetting = {
  key: string;
  value: string;
  type: string;
};

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

export type ContentBlock = {
  id: string;
  page: string;
  block_type: string;
  title_fr: string;
  title_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  body_fr: string;
  body_en: string;
  image: string;
  video_url: string;
  link: string;
  cta_fr: string;
  cta_en: string;
  data: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
};

export type I18nEntry = {
  id: string;
  namespace: string;
  key: string;
  value_fr: string;
  value_en: string;
};

export type NavItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};
