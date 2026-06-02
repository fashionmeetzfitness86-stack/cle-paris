import type {
  Product,
  ProductColor,
  ProductVariant,
  ProductMedia,
  Category,
  Collection,
  Order,
  Customer,
  BlogPost,
  Testimonial,
  LegalPage,
  SeoSetting,
  AdminUser,
  Banner,
  HomepageSection,
  StoreSetting,
  MediaItem,
  I18nEntry,
} from './types';

// ─── Categories ─────────────────────────────────────────────────────────────
export const mockCategories: Category[] = [
  { id: 'cat-1', slug: 'hauts', name_fr: 'Hauts', name_en: 'Tops' },
  { id: 'cat-2', slug: 'bas', name_fr: 'Bas', name_en: 'Bottoms' },
  { id: 'cat-3', slug: 'accessoires', name_fr: 'Accessoires', name_en: 'Accessories' },
];

// ─── Collections ─────────────────────────────────────────────────────────────
export const mockCollections: Collection[] = [
  {
    id: 'col-1',
    slug: 'ombre',
    name_fr: 'Ombre Saison',
    name_en: 'Shadow Season',
    description_fr: 'Une collection inspirée par les ombres portées du crépuscule parisien.',
    description_en: 'A collection inspired by the long shadows of Parisian dusk.',
    cover_image: 'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=800',
    is_active: true,
  },
];

// ─── Products ────────────────────────────────────────────────────────────────
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    slug: 'manteau-crepuscule',
    name: 'Manteau Crépuscule',
    category_id: 'cat-1',
    collection_id: 'col-1',
    price: 420,
    compare_at_price: 580,
    currency: 'EUR',
    description_fr: 'Manteau oversize en laine mélangée. Silhouette structurée, finitions à la main.',
    description_en: 'Oversized blended wool coat. Structured silhouette, hand-finished details.',
    material_fr: '80% Laine, 20% Cachemire',
    material_en: '80% Wool, 20% Cashmere',
    is_archived: false,
    is_new: true,
    is_featured: true,
    sort_order: 1,
    created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'prod-2',
    slug: 'blouson-graphite',
    name: 'Blouson Graphite',
    category_id: 'cat-1',
    collection_id: 'col-1',
    price: 290,
    compare_at_price: null,
    currency: 'EUR',
    description_fr: 'Blouson technique en tissu déperlant. Coupe boxy, zips métalliques.',
    description_en: 'Technical jacket in water-repellent fabric. Boxy cut, metal zips.',
    material_fr: '100% Polyester recyclé',
    material_en: '100% Recycled Polyester',
    is_archived: false,
    is_new: false,
    is_featured: true,
    sort_order: 2,
    created_at: '2024-09-05T10:00:00Z',
  },
  {
    id: 'prod-3',
    slug: 'pantalon-sablier',
    name: 'Pantalon Sablier',
    category_id: 'cat-2',
    collection_id: 'col-1',
    price: 195,
    compare_at_price: null,
    currency: 'EUR',
    description_fr: 'Pantalon taille haute à jambes larges. Tissu fluide en viscose.',
    description_en: 'High-waist wide-leg trousers. Fluid viscose fabric.',
    material_fr: '100% Viscose',
    material_en: '100% Viscose',
    is_archived: false,
    is_new: true,
    is_featured: false,
    sort_order: 3,
    created_at: '2024-09-10T10:00:00Z',
  },
  {
    id: 'prod-4',
    slug: 'cache-col-urbain',
    name: 'Cache-Col Urbain',
    category_id: 'cat-3',
    collection_id: null,
    price: 85,
    compare_at_price: null,
    currency: 'EUR',
    description_fr: 'Cache-col en laine mérinos. Peut se porter de multiples façons.',
    description_en: 'Merino wool snood. Can be styled multiple ways.',
    material_fr: '100% Laine Mérinos',
    material_en: '100% Merino Wool',
    is_archived: false,
    is_new: false,
    is_featured: false,
    sort_order: 4,
    created_at: '2024-09-15T10:00:00Z',
  },
];

// ─── Product Colors ───────────────────────────────────────────────────────────
export const mockColors: ProductColor[] = [
  { id: 'color-1', product_id: 'prod-1', slug: 'noir', label_fr: 'Noir', label_en: 'Black', hex: '#1a1a1a' },
  { id: 'color-2', product_id: 'prod-1', slug: 'ecru', label_fr: 'Écru', label_en: 'Ecru', hex: '#e8e2d6' },
  { id: 'color-3', product_id: 'prod-2', slug: 'graphite', label_fr: 'Graphite', label_en: 'Graphite', hex: '#4a4a4a' },
  { id: 'color-4', product_id: 'prod-3', slug: 'sable', label_fr: 'Sable', label_en: 'Sand', hex: '#c8b89a' },
];

// ─── Product Variants ─────────────────────────────────────────────────────────
export const mockVariants: ProductVariant[] = [
  { id: 'var-1', product_id: 'prod-1', color_id: 'color-1', size: 'S', stock: 3, sku: 'CLP-MC-BLK-S' },
  { id: 'var-2', product_id: 'prod-1', color_id: 'color-1', size: 'M', stock: 5, sku: 'CLP-MC-BLK-M' },
  { id: 'var-3', product_id: 'prod-1', color_id: 'color-1', size: 'L', stock: 2, sku: 'CLP-MC-BLK-L' },
  { id: 'var-4', product_id: 'prod-1', color_id: 'color-2', size: 'S', stock: 4, sku: 'CLP-MC-ECR-S' },
  { id: 'var-5', product_id: 'prod-1', color_id: 'color-2', size: 'M', stock: 6, sku: 'CLP-MC-ECR-M' },
  { id: 'var-6', product_id: 'prod-2', color_id: 'color-3', size: 'M', stock: 8, sku: 'CLP-BG-GRP-M' },
  { id: 'var-7', product_id: 'prod-2', color_id: 'color-3', size: 'L', stock: 4, sku: 'CLP-BG-GRP-L' },
  { id: 'var-8', product_id: 'prod-3', color_id: 'color-4', size: 'XS', stock: 2, sku: 'CLP-PS-SBL-XS' },
  { id: 'var-9', product_id: 'prod-3', color_id: 'color-4', size: 'S', stock: 5, sku: 'CLP-PS-SBL-S' },
];

// ─── Product Media ────────────────────────────────────────────────────────────
export const mockProductMedia: ProductMedia[] = [
  { id: 'media-p1', product_id: 'prod-1', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400', alt: 'Manteau Crépuscule', type: 'image', sort_order: 1 },
  { id: 'media-p2', product_id: 'prod-2', url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400', alt: 'Blouson Graphite', type: 'image', sort_order: 1 },
  { id: 'media-p3', product_id: 'prod-3', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400', alt: 'Pantalon Sablier', type: 'image', sort_order: 1 },
  { id: 'media-p4', product_id: 'prod-4', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', alt: 'Cache-Col Urbain', type: 'image', sort_order: 1 },
];

// ─── Orders ──────────────────────────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    order_number: 'CLP-2024-0047',
    customer_email: 'camille.martin@gmail.com',
    status: 'delivered',
    total: 420,
    currency: 'EUR',
    items: [
      { productSlug: 'manteau-crepuscule', name: 'Manteau Crépuscule', price: 420, qty: 1, size: 'M', colorId: 'color-1', colorLabel: 'Noir', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=100' },
    ],
    shipping_address: { firstName: 'Camille', lastName: 'Martin', line1: '14 Rue de Rivoli', city: 'Paris', postal_code: '75001', country: 'FR' },
    created_at: '2024-11-12T14:32:00Z',
  },
  {
    id: 'ord-2',
    order_number: 'CLP-2024-0046',
    customer_email: 'leo.bernard@outlook.fr',
    status: 'shipped',
    total: 485,
    currency: 'EUR',
    items: [
      { productSlug: 'blouson-graphite', name: 'Blouson Graphite', price: 290, qty: 1, size: 'L', colorId: 'color-3', colorLabel: 'Graphite', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=100' },
      { productSlug: 'cache-col-urbain', name: 'Cache-Col Urbain', price: 85, qty: 1, size: 'TU', colorId: '', colorLabel: 'Gris', image: '' },
    ],
    shipping_address: { firstName: 'Léo', lastName: 'Bernard', line1: '3 Allée des Roses', line2: 'Apt 12', city: 'Lyon', postal_code: '69001', country: 'FR' },
    created_at: '2024-11-14T09:15:00Z',
  },
  {
    id: 'ord-3',
    order_number: 'CLP-2024-0045',
    customer_email: 'sofia.rossi@gmail.com',
    status: 'paid',
    total: 195,
    currency: 'EUR',
    items: [
      { productSlug: 'pantalon-sablier', name: 'Pantalon Sablier', price: 195, qty: 1, size: 'S', colorId: 'color-4', colorLabel: 'Sable', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=100' },
    ],
    shipping_address: { firstName: 'Sofia', lastName: 'Rossi', line1: '22 Via Roma', city: 'Milano', postal_code: '20121', country: 'IT' },
    created_at: '2024-11-15T18:00:00Z',
  },
  {
    id: 'ord-4',
    order_number: 'CLP-2024-0044',
    customer_email: 'nina.schmidt@web.de',
    status: 'pending',
    total: 710,
    currency: 'EUR',
    items: [
      { productSlug: 'manteau-crepuscule', name: 'Manteau Crépuscule', price: 420, qty: 1, size: 'S', colorId: 'color-2', colorLabel: 'Écru', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=100' },
      { productSlug: 'pantalon-sablier', name: 'Pantalon Sablier', price: 195, qty: 1, size: 'XS', colorId: 'color-4', colorLabel: 'Sable', image: '' },
    ],
    shipping_address: { firstName: 'Nina', lastName: 'Schmidt', line1: 'Unter den Linden 5', city: 'Berlin', postal_code: '10117', country: 'DE' },
    created_at: '2024-11-16T11:22:00Z',
  },
  {
    id: 'ord-5',
    order_number: 'CLP-2024-0043',
    customer_email: 'marc.dupont@free.fr',
    status: 'refunded',
    total: 290,
    currency: 'EUR',
    items: [
      { productSlug: 'blouson-graphite', name: 'Blouson Graphite', price: 290, qty: 1, size: 'M', colorId: 'color-3', colorLabel: 'Graphite', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=100' },
    ],
    shipping_address: { firstName: 'Marc', lastName: 'Dupont', line1: '7 Rue des Lilas', city: 'Bordeaux', postal_code: '33000', country: 'FR' },
    created_at: '2024-11-10T16:45:00Z',
  },
];

// ─── Customers ────────────────────────────────────────────────────────────────
export const mockCustomers: Customer[] = [
  { id: 'cust-1', email: 'camille.martin@gmail.com', first_name: 'Camille', last_name: 'Martin', phone: '+33 6 12 34 56 78', created_at: '2024-09-20T10:00:00Z' },
  { id: 'cust-2', email: 'leo.bernard@outlook.fr', first_name: 'Léo', last_name: 'Bernard', phone: '+33 7 98 76 54 32', created_at: '2024-10-01T10:00:00Z' },
  { id: 'cust-3', email: 'sofia.rossi@gmail.com', first_name: 'Sofia', last_name: 'Rossi', phone: '+39 02 1234 5678', created_at: '2024-10-15T10:00:00Z' },
  { id: 'cust-4', email: 'nina.schmidt@web.de', first_name: 'Nina', last_name: 'Schmidt', phone: '+49 30 1234 5678', created_at: '2024-11-01T10:00:00Z' },
  { id: 'cust-5', email: 'marc.dupont@free.fr', first_name: 'Marc', last_name: 'Dupont', phone: '+33 5 56 78 90 12', created_at: '2024-11-05T10:00:00Z' },
  { id: 'cust-6', email: 'alice.fontaine@icloud.com', first_name: 'Alice', last_name: 'Fontaine', phone: '+33 6 45 67 89 01', created_at: '2024-11-08T10:00:00Z' },
  { id: 'cust-7', email: 'pierre.moreau@gmail.com', first_name: 'Pierre', last_name: 'Moreau', phone: '+33 6 23 45 67 89', created_at: '2024-11-10T10:00:00Z' },
  { id: 'cust-8', email: 'elena.vasquez@gmail.com', first_name: 'Elena', last_name: 'Vasquez', phone: '+34 91 123 45 67', created_at: '2024-11-14T10:00:00Z' },
];

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export const mockBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'art-du-vetement-sans-superflu',
    title_fr: "L'art du vêtement sans superflu",
    title_en: 'The art of the unadorned garment',
    body_fr: 'Le minimalisme ne consiste pas à retrancher, mais à révéler. Chaque couture de CLÉ PARIS raconte une intention...',
    body_en: 'Minimalism is not about subtraction, but revelation. Every seam at CLÉ PARIS tells an intention...',
    cover_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    is_published: true,
    published_at: '2024-10-15T09:00:00Z',
    created_at: '2024-10-14T10:00:00Z',
  },
  {
    id: 'blog-2',
    slug: 'palette-automne-hiver',
    title_fr: 'La palette automne-hiver 2024',
    title_en: 'The autumn-winter 2024 palette',
    body_fr: 'Cette saison, nous avons travaillé avec des teinturiers lyonnais pour développer une palette de couleurs inspirée...',
    body_en: 'This season, we worked with Lyon dyers to develop a colour palette inspired by...',
    cover_image: 'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=800',
    is_published: true,
    published_at: '2024-11-01T09:00:00Z',
    created_at: '2024-10-30T10:00:00Z',
  },
  {
    id: 'blog-3',
    slug: 'behind-the-scenes-atelier',
    title_fr: "Dans l'atelier : coulisses d'une collection",
    title_en: "Behind the scenes: a collection's journey",
    body_fr: 'Les premières esquisses arrivent toujours de nuit. Sur de grandes feuilles de papier calque...',
    body_en: 'The first sketches always arrive at night. On large sheets of tracing paper...',
    cover_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    is_published: false,
    published_at: null,
    created_at: '2024-11-15T10:00:00Z',
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    author: 'Chloé V.',
    role: 'Architecte, Paris',
    quote_fr: 'Des pièces qui durent. Le Manteau Crépuscule est devenu une seconde peau cet hiver.',
    quote_en: 'Pieces that last. The Crépuscule coat has become a second skin this winter.',
    rating: 5,
    is_visible: true,
  },
  {
    id: 'test-2',
    author: 'Thomas B.',
    role: 'Photographe, Lyon',
    quote_fr: "La qualité parle d'elle-même. Ni logo, ni superflu. Juste du beau travail.",
    quote_en: 'The quality speaks for itself. No logos, no excess. Just beautiful work.',
    rating: 5,
    is_visible: true,
  },
  {
    id: 'test-3',
    author: 'Isabelle M.',
    role: 'Consultant, Genève',
    quote_fr: 'Un vestiaire essentiel, construit pour durer. CLÉ PARIS est ma référence depuis un an.',
    quote_en: 'An essential wardrobe, built to last. CLÉ PARIS has been my reference for a year.',
    rating: 5,
    is_visible: false,
  },
];

// ─── SEO Settings ─────────────────────────────────────────────────────────────
export const mockSeoSettings: SeoSetting[] = [
  { id: 'seo-1', page: 'home', title_fr: 'CLÉ PARIS — Mode Essentielle', title_en: 'CLÉ PARIS — Essential Fashion', description_fr: 'Streetwear de luxe parisien. Pièces intemporelles conçues pour durer.', description_en: 'Parisian luxury streetwear. Timeless pieces designed to last.', og_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200' },
  { id: 'seo-2', page: 'collection', title_fr: 'Collection — CLÉ PARIS', title_en: 'Collection — CLÉ PARIS', description_fr: 'Découvrez la collection CLÉ PARIS. Mode parisienne contemporaine.', description_en: 'Discover the CLÉ PARIS collection. Contemporary Parisian fashion.', og_image: '' },
  { id: 'seo-3', page: 'about', title_fr: 'À propos — CLÉ PARIS', title_en: 'About — CLÉ PARIS', description_fr: 'Notre histoire, nos valeurs, notre vision de la mode durable.', description_en: 'Our story, our values, our vision of sustainable fashion.', og_image: '' },
  { id: 'seo-4', page: 'archive', title_fr: 'Archives — CLÉ PARIS', title_en: 'Archive — CLÉ PARIS', description_fr: "Collections passées et pièces d'archives CLÉ PARIS.", description_en: 'Past collections and archive pieces from CLÉ PARIS.', og_image: '' },
  { id: 'seo-5', page: 'blog', title_fr: 'Journal — CLÉ PARIS', title_en: 'Journal — CLÉ PARIS', description_fr: 'Le journal CLÉ PARIS : coulisses, inspirations, et savoir-faire.', description_en: 'The CLÉ PARIS journal: behind the scenes, inspirations, and craftsmanship.', og_image: '' },
];

// ─── Legal Pages ──────────────────────────────────────────────────────────────
export const mockLegalPages: LegalPage[] = [
  {
    id: 'legal-1',
    slug: 'mentions-legales',
    title_fr: 'Mentions légales',
    title_en: 'Legal Notice',
    body_fr: 'CLÉ PARIS SAS, au capital de 50 000 €, RCS Paris B 123 456 789. Siège social : 1 Rue de la Paix, 75001 Paris.',
    body_en: 'CLÉ PARIS SAS, share capital €50,000, RCS Paris B 123 456 789. Registered office: 1 Rue de la Paix, 75001 Paris.',
  },
  {
    id: 'legal-2',
    slug: 'cgv',
    title_fr: 'Conditions Générales de Vente',
    title_en: 'Terms & Conditions',
    body_fr: 'Les présentes Conditions Générales de Vente régissent les relations contractuelles entre CLÉ PARIS et ses clients.',
    body_en: 'These Terms and Conditions govern the contractual relationship between CLÉ PARIS and its customers.',
  },
  {
    id: 'legal-3',
    slug: 'confidentialite',
    title_fr: 'Politique de confidentialité',
    title_en: 'Privacy Policy',
    body_fr: 'CLÉ PARIS collecte vos données personnelles uniquement dans le cadre de la gestion de vos commandes.',
    body_en: 'CLÉ PARIS collects your personal data only for the purpose of managing your orders.',
  },
  {
    id: 'legal-4',
    slug: 'livraison-retours',
    title_fr: 'Livraison & Retours',
    title_en: 'Shipping & Returns',
    body_fr: 'Livraison gratuite en France métropolitaine à partir de 150 €. Retours acceptés sous 30 jours.',
    body_en: 'Free shipping in metropolitan France for orders over €150. Returns accepted within 30 days.',
  },
];

// ─── Banner ──────────────────────────────────────────────────────────────────
export const mockBanner: Banner = {
  id: 'banner-1',
  message_fr: 'Livraison offerte en France à partir de 150 € — Collection Ombre disponible maintenant',
  message_en: 'Free shipping in France from €150 — Ombre Collection now available',
  link: '/collection',
  is_active: true,
  background_color: '#1a1a1a',
  text_color: '#e8e2d6',
};

// ─── Homepage Sections ────────────────────────────────────────────────────────
export const mockHomepageSections: HomepageSection[] = [
  {
    id: 'hp-1',
    key: 'hero',
    type: 'hero',
    title_fr: 'La Mode Sans Compromis',
    title_en: 'Fashion Without Compromise',
    subtitle_fr: 'Collection Ombre Saison 2024',
    subtitle_en: 'Ombre Season Collection 2024',
    body_fr: 'Des pièces pensées pour durer. Un vestiaire construit sur l\'essentiel.',
    body_en: 'Pieces designed to last. A wardrobe built on essentials.',
    image: 'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=1600',
    video_url: '',
    link: '/collection',
    sort_order: 1,
    is_visible: true,
  },
  {
    id: 'hp-2',
    key: 'featured_collection',
    type: 'collection_banner',
    title_fr: 'Ombre Saison',
    title_en: 'Shadow Season',
    subtitle_fr: 'Automne-Hiver 2024',
    subtitle_en: 'Autumn-Winter 2024',
    body_fr: 'Inspirée par les ombres portées du crépuscule parisien.',
    body_en: 'Inspired by the long shadows of Parisian dusk.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    video_url: '',
    link: '/collection',
    sort_order: 2,
    is_visible: true,
  },
  {
    id: 'hp-3',
    key: 'about_teaser',
    type: 'about_block',
    title_fr: 'Notre Philosophy',
    title_en: 'Our Philosophy',
    subtitle_fr: '',
    subtitle_en: '',
    body_fr: 'CLÉ PARIS est né d\'une conviction simple.',
    body_en: 'CLÉ PARIS was born from a simple belief.',
    image: '',
    video_url: '',
    link: '/about',
    sort_order: 3,
    is_visible: true,
  },
  {
    id: 'hp-4',
    key: 'testimonials',
    type: 'testimonials',
    title_fr: 'Ils nous font confiance',
    title_en: 'Trusted by many',
    subtitle_fr: '',
    subtitle_en: '',
    body_fr: '',
    body_en: '',
    image: '',
    video_url: '',
    link: '',
    sort_order: 4,
    is_visible: true,
  },
  {
    id: 'hp-5',
    key: 'newsletter',
    type: 'newsletter',
    title_fr: 'Rejoignez le cercle',
    title_en: 'Join the circle',
    subtitle_fr: 'Accès prioritaire aux nouvelles collections',
    subtitle_en: 'Priority access to new collections',
    body_fr: '',
    body_en: '',
    image: '',
    video_url: '',
    link: '',
    sort_order: 5,
    is_visible: false,
  },
];

// ─── Store Settings ───────────────────────────────────────────────────────────
export const mockStoreSettings: StoreSetting[] = [
  { key: 'store_name', value: 'CLÉ PARIS', type: 'string' },
  { key: 'contact_email', value: 'bonjour@cleparis.store', type: 'string' },
  { key: 'currency', value: 'EUR', type: 'string' },
  { key: 'free_shipping_threshold', value: '150', type: 'number' },
  { key: 'shipping_delay_fr', value: '2-4 jours ouvrés', type: 'string' },
  { key: 'shipping_delay_en', value: '2-4 working days', type: 'string' },
  { key: 'returns_window_days', value: '30', type: 'number' },
  { key: 'instagram_url', value: 'https://instagram.com/cleparis', type: 'string' },
  { key: 'twitter_url', value: 'https://x.com/cleparis', type: 'string' },
];

// ─── Media Items ──────────────────────────────────────────────────────────────
export const mockMediaItems: MediaItem[] = [
  { id: 'med-1', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800', filename: 'manteau-crepuscule-01.jpg', mime_type: 'image/jpeg', size_bytes: 245000, created_at: '2024-09-01T10:00:00Z' },
  { id: 'med-2', url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800', filename: 'blouson-graphite-01.jpg', mime_type: 'image/jpeg', size_bytes: 312000, created_at: '2024-09-05T10:00:00Z' },
  { id: 'med-3', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800', filename: 'pantalon-sablier-01.jpg', mime_type: 'image/jpeg', size_bytes: 198000, created_at: '2024-09-10T10:00:00Z' },
  { id: 'med-4', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', filename: 'cache-col-urbain-01.jpg', mime_type: 'image/jpeg', size_bytes: 156000, created_at: '2024-09-15T10:00:00Z' },
  { id: 'med-5', url: 'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=800', filename: 'hero-ombre-saison.jpg', mime_type: 'image/jpeg', size_bytes: 512000, created_at: '2024-09-01T10:00:00Z' },
  { id: 'med-6', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', filename: 'collection-cover.jpg', mime_type: 'image/jpeg', size_bytes: 445000, created_at: '2024-09-01T10:00:00Z' },
  { id: 'med-7', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', filename: 'blog-cover-01.jpg', mime_type: 'image/jpeg', size_bytes: 120000, created_at: '2024-10-14T10:00:00Z' },
  { id: 'med-8', url: 'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=400', filename: 'blog-cover-02.jpg', mime_type: 'image/jpeg', size_bytes: 134000, created_at: '2024-10-30T10:00:00Z' },
];

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const mockAdminUsers: AdminUser[] = [
  { id: 'admin-1', email: 'admin@cleparis.store', name: 'Admin Principal', role: 'admin', last_login: '2024-11-16T08:00:00Z', created_at: '2024-09-01T10:00:00Z' },
  { id: 'admin-2', email: 'editor@cleparis.store', name: 'Marie Éditrice', role: 'editor', last_login: '2024-11-15T14:30:00Z', created_at: '2024-10-01T10:00:00Z' },
];

// ─── I18n Entries ─────────────────────────────────────────────────────────────
export const mockI18nEntries: I18nEntry[] = [
  // Nav
  { id: 'i18n-1', namespace: 'nav', key: 'collection', value_fr: 'Collection', value_en: 'Collection' },
  { id: 'i18n-2', namespace: 'nav', key: 'about', value_fr: 'À propos', value_en: 'About' },
  { id: 'i18n-3', namespace: 'nav', key: 'archive', value_fr: 'Archives', value_en: 'Archive' },
  { id: 'i18n-4', namespace: 'nav', key: 'cart', value_fr: 'Panier', value_en: 'Cart' },
  // Home
  { id: 'i18n-5', namespace: 'home', key: 'hero_title', value_fr: 'La Mode Sans Compromis', value_en: 'Fashion Without Compromise' },
  { id: 'i18n-6', namespace: 'home', key: 'hero_cta', value_fr: 'Découvrir', value_en: 'Discover' },
  { id: 'i18n-7', namespace: 'home', key: 'new_arrivals', value_fr: 'Nouveautés', value_en: 'New Arrivals' },
  // Product
  { id: 'i18n-8', namespace: 'product', key: 'add_to_cart', value_fr: 'Ajouter au panier', value_en: 'Add to cart' },
  { id: 'i18n-9', namespace: 'product', key: 'size_guide', value_fr: 'Guide des tailles', value_en: 'Size guide' },
  { id: 'i18n-10', namespace: 'product', key: 'out_of_stock', value_fr: 'Rupture de stock', value_en: 'Out of stock' },
  { id: 'i18n-11', namespace: 'product', key: 'description', value_fr: 'Description', value_en: 'Description' },
  { id: 'i18n-12', namespace: 'product', key: 'material', value_fr: 'Matière', value_en: 'Material' },
  // Cart
  { id: 'i18n-13', namespace: 'cart', key: 'title', value_fr: 'Votre panier', value_en: 'Your cart' },
  { id: 'i18n-14', namespace: 'cart', key: 'empty', value_fr: 'Votre panier est vide', value_en: 'Your cart is empty' },
  { id: 'i18n-15', namespace: 'cart', key: 'checkout', value_fr: 'Commander', value_en: 'Checkout' },
  { id: 'i18n-16', namespace: 'cart', key: 'subtotal', value_fr: 'Sous-total', value_en: 'Subtotal' },
  // About
  { id: 'i18n-17', namespace: 'about', key: 'title', value_fr: 'À propos de CLÉ PARIS', value_en: 'About CLÉ PARIS' },
  { id: 'i18n-18', namespace: 'about', key: 'manifesto_title', value_fr: 'Notre manifeste', value_en: 'Our manifesto' },
  // Archive
  { id: 'i18n-19', namespace: 'archive', key: 'title', value_fr: 'Archives', value_en: 'Archive' },
  { id: 'i18n-20', namespace: 'archive', key: 'empty', value_fr: 'Aucune archive disponible', value_en: 'No archive available' },
  // Footer
  { id: 'i18n-21', namespace: 'footer', key: 'legal', value_fr: 'Mentions légales', value_en: 'Legal notice' },
  { id: 'i18n-22', namespace: 'footer', key: 'privacy', value_fr: 'Confidentialité', value_en: 'Privacy' },
  { id: 'i18n-23', namespace: 'footer', key: 'contact', value_fr: 'Contact', value_en: 'Contact' },
];
