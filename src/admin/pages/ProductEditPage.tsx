import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import Toggle from '../components/Toggle';
import SaveBar from '../components/SaveBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import {
  getProduct,
  upsertProduct,
  listProductColors,
  listProductMedia,
  upsertProductColor,
  deleteProductColor,
  replaceProductVariants,
  insertProductMedia,
  deleteProductMedia,
} from '../services/products';
import { uploadMedia } from '../services/media';
import { listCategories } from '../services/categories';
import { listCollections } from '../services/collections';
import { mockProducts, mockCategories, mockCollections, mockColors, mockVariants, mockProductMedia } from '../mockData';
import type { Product, ProductColor, ProductMedia, Category, Collection } from '../types';
import { isSupabaseConfigured } from '../../lib/supabase';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const langs = ['fr', 'en'] as const;

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Local-only ids for colors/media added before the product is saved.
let tmpCounter = 0;
const tmpId = () => `tmp-${Date.now()}-${tmpCounter++}`;
const isTempId = (v: string) => v.startsWith('tmp-');

export default function ProductEditPage() {
  const { t } = useTranslation('admin');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const existing = isNew ? null : mockProducts.find((p) => p.id === id);

  const emptyForm: Omit<Product, 'id' | 'created_at'> = {
    slug: existing?.slug ?? '',
    name: existing?.name ?? '',
    category_id: existing?.category_id ?? null,
    collection_id: existing?.collection_id ?? null,
    price: existing?.price ?? 0,
    compare_at_price: existing?.compare_at_price ?? null,
    currency: existing?.currency ?? 'EUR',
    description_fr: existing?.description_fr ?? '',
    description_en: existing?.description_en ?? '',
    material_fr: existing?.material_fr ?? '',
    material_en: existing?.material_en ?? '',
    is_archived: existing?.is_archived ?? false,
    is_new: existing?.is_new ?? false,
    is_featured: existing?.is_featured ?? false,
    sort_order: existing?.sort_order ?? 99,
  };

  const [form, setForm] = useState(emptyForm);
  const [descLang, setDescLang] = useState<'fr' | 'en'>('fr');
  const [matLang, setMatLang] = useState<'fr' | 'en'>('fr');
  const [colors, setColors] = useState<ProductColor[]>(
    isNew ? [] : mockColors.filter((c) => c.product_id === id)
  );
  const [media, setMedia] = useState<ProductMedia[]>(
    isNew ? [] : mockProductMedia.filter((m) => m.product_id === id)
  );
  const [stockMap, setStockMap] = useState<Record<string, Record<string, number>>>(() => {
    const result: Record<string, Record<string, number>> = {};
    const prodColors = isNew ? [] : mockColors.filter((c) => c.product_id === id);
    for (const color of prodColors) {
      result[color.id] = {};
      for (const size of SIZES) {
        const v = mockVariants.find((v) => v.color_id === color.id && v.size === size);
        result[color.id][size] = v?.stock ?? 0;
      }
    }
    return result;
  });
  const [newColor, setNewColor] = useState({ label_fr: '', label_en: '', hex: '#1a1a1a', slug: '' });
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  // Real categories/collections from the DB (mock as dev fallback).
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  // Track DB rows removed in the editor so we can delete them on save.
  const [removedColorIds, setRemovedColorIds] = useState<string[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);

  const loadProduct = useCallback(async () => {
    if (isNew || !id || !isSupabaseConfigured()) return;
    setLoading(true);
    const [prodRes, colorsRes, mediaRes] = await Promise.all([
      getProduct(id),
      listProductColors(id),
      listProductMedia(id),
    ]);
    if (prodRes.data) {
      const { id: _id, created_at: _ca, ...rest } = prodRes.data;
      setForm(rest);
    }
    if (colorsRes.data) setColors(colorsRes.data);
    if (mediaRes.data) setMedia(mediaRes.data);
    setLoading(false);
  }, [id, isNew]);

  useEffect(() => { void loadProduct(); }, [loadProduct]);

  // Load real categories + collections so the dropdown ids match the DB.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    void listCategories().then(({ data }) => { if (data) setCategories(data); });
    void listCollections().then(({ data }) => { if (data) setCollections(data); });
  }, []);

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: generateSlug(name) }));
    setHasChanges(true);
  };

  const handleAddColor = () => {
    if (!newColor.label_fr) return;
    // Add locally with a temp id; persisted on Save (works for new products too).
    const color: ProductColor = {
      id: tmpId(),
      product_id: isNew ? '' : (id ?? ''),
      slug: generateSlug(newColor.label_fr),
      label_fr: newColor.label_fr,
      label_en: newColor.label_en,
      hex: newColor.hex,
    };
    setColors((c) => [...c, color]);
    setStockMap((s) => ({ ...s, [color.id]: Object.fromEntries(SIZES.map((sz) => [sz, 0])) }));
    setNewColor({ label_fr: '', label_en: '', hex: '#1a1a1a', slug: '' });
    setHasChanges(true);
  };

  const handleRemoveColor = (colorId: string) => {
    if (!isTempId(colorId)) setRemovedColorIds((r) => [...r, colorId]);
    setColors((c) => c.filter((col) => col.id !== colorId));
    setStockMap((s) => { const next = { ...s }; delete next[colorId]; return next; });
    setHasChanges(true);
  };

  const handleStockChange = (colorId: string, size: string, value: number) => {
    setStockMap((s) => ({ ...s, [colorId]: { ...s[colorId], [size]: value } }));
    setHasChanges(true);
  };

  const handleAddMedia = () => {
    if (!newMediaUrl.trim()) return;
    // Add locally; persisted on Save.
    const item: ProductMedia = {
      id: tmpId(),
      product_id: isNew ? '' : (id ?? ''),
      url: newMediaUrl.trim(),
      alt: form.name,
      type: 'image',
      sort_order: media.length + 1,
    };
    setMedia((m) => [...m, item]);
    setNewMediaUrl('');
    setHasChanges(true);
  };

  const handleRemoveMedia = (mediaId: string) => {
    if (!isTempId(mediaId)) setRemovedMediaIds((r) => [...r, mediaId]);
    setMedia((m) => m.filter((item) => item.id !== mediaId));
    setHasChanges(true);
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const { url, error: upErr } = await uploadMedia(file, 'products');
        if (upErr || !url) { setError(upErr?.message ?? t('productEdit.errUpload')); continue; }
        setMedia((m) => [
          ...m,
          { id: tmpId(), product_id: isNew ? '' : (id ?? ''), url, alt: form.name, type: 'image', sort_order: m.length + 1 },
        ]);
      }
      setHasChanges(true);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    // 1. Create/update the product FIRST so we have its real id.
    const payload = isNew ? form : { ...form, id };
    const { data: savedProduct, error: err } = await upsertProduct(payload);
    if (err || !savedProduct) {
      setError(err?.message ?? t('productEdit.errSaveProduct'));
      setSaving(false);
      return;
    }
    const productId = savedProduct.id;

    try {
      // 2. Delete colors removed in the editor (cascades their variants).
      for (const cid of removedColorIds) await deleteProductColor(cid);

      // 3. Persist colors. Insert temp ones (→ real id), update existing.
      const colorIdMap: Record<string, string> = {};
      for (const color of colors) {
        const base = {
          product_id: productId,
          slug: color.slug || generateSlug(color.label_fr),
          label_fr: color.label_fr,
          label_en: color.label_en,
          hex: color.hex,
        };
        if (isTempId(color.id)) {
          const { data, error: cErr } = await upsertProductColor(base);
          if (cErr || !data) throw new Error(cErr?.message ?? t('productEdit.errSaveColor'));
          colorIdMap[color.id] = data.id;
        } else {
          const { error: cErr } = await upsertProductColor({ id: color.id, ...base });
          if (cErr) throw new Error(cErr.message);
          colorIdMap[color.id] = color.id;
        }
      }

      // 4. Variants per color (using the REAL color id).
      for (const color of colors) {
        const dbColorId = colorIdMap[color.id];
        const variants = SIZES.map((size) => ({
          product_id: productId,
          color_id: dbColorId,
          size,
          stock: stockMap[color.id]?.[size] ?? 0,
          sku: `CLP-${(color.slug || color.label_fr).toUpperCase()}-${size}`,
        }));
        const { error: vErr } = await replaceProductVariants(productId, dbColorId, variants);
        if (vErr) throw new Error(vErr.message);
      }

      // 5. Media: delete removed, insert newly added (in display order).
      for (const mid of removedMediaIds) await deleteProductMedia(mid);
      let order = 1;
      for (const item of media) {
        if (isTempId(item.id)) {
          const { error: mErr } = await insertProductMedia({
            product_id: productId,
            url: item.url,
            alt: item.alt || form.name,
            type: item.type ?? 'image',
            sort_order: order,
          });
          if (mErr) throw new Error(mErr.message);
        }
        order++;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('productEdit.errSaveDetails'));
      setSaving(false);
      return;
    }

    setSaving(false);
    setHasChanges(false);
    navigate('/admin/products');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6 max-w-4xl pb-24">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" className="text-[#57534e] hover:text-[#a8a29e] transition-colors">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M10 3L4 8l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </Link>
        <div>
          <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">
            {isNew ? t('productEdit.newTitle') : t('productEdit.editTitle', { name: form.name })}
          </h2>
          <p className="text-sm text-[#57534e] mt-0.5">
            {isNew ? t('productEdit.newSub') : t('productEdit.editSub')}
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="space-y-5">
        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('productEdit.sectionBasic')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="prod-name" label={t('productEdit.name')} required value={form.name}
              onChange={(e) => handleNameChange((e.target as HTMLInputElement).value)}
            />
            <FormField
              id="prod-slug" label={t('productEdit.slug')} value={form.slug}
              onChange={(e) => { setForm((f) => ({ ...f, slug: (e.target as HTMLInputElement).value })); setHasChanges(true); }}
              hint={t('productEdit.slugHint')}
            />
            <FormField as="select" id="prod-category" label={t('productEdit.category')}
              value={form.category_id ?? ''}
              onChange={(e) => { setForm((f) => ({ ...f, category_id: (e.target as HTMLSelectElement).value || null })); setHasChanges(true); }}
            >
              <option value="">{t('productEdit.noCategory')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
            </FormField>
            <FormField as="select" id="prod-collection" label={t('productEdit.collection')}
              value={form.collection_id ?? ''}
              onChange={(e) => { setForm((f) => ({ ...f, collection_id: (e.target as HTMLSelectElement).value || null })); setHasChanges(true); }}
            >
              <option value="">{t('productEdit.noCollection')}</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
            </FormField>
          </div>
        </section>

        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('productEdit.sectionDescription')}</h3>
            <div className="flex gap-1 bg-[#111] border border-[#262626] rounded p-0.5">
              {langs.map((l) => (
                <button key={l} onClick={() => setDescLang(l)} className={`px-3 py-0.5 text-xs rounded transition-colors ${descLang === l ? 'bg-[#262626] text-[#e8e2d6]' : 'text-[#57534e]'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <FormField as="textarea" id="prod-desc" label={t('productEdit.descriptionLang', { lang: descLang.toUpperCase() })} rows={4}
            value={descLang === 'fr' ? form.description_fr : form.description_en}
            onChange={(e) => {
              const v = (e.target as HTMLTextAreaElement).value;
              setForm((f) => descLang === 'fr' ? { ...f, description_fr: v } : { ...f, description_en: v });
              setHasChanges(true);
            }}
          />
        </section>

        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('productEdit.sectionMaterial')}</h3>
            <div className="flex gap-1 bg-[#111] border border-[#262626] rounded p-0.5">
              {langs.map((l) => (
                <button key={l} onClick={() => setMatLang(l)} className={`px-3 py-0.5 text-xs rounded transition-colors ${matLang === l ? 'bg-[#262626] text-[#e8e2d6]' : 'text-[#57534e]'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <FormField id="prod-material" label={t('productEdit.materialLang', { lang: matLang.toUpperCase() })}
            value={matLang === 'fr' ? form.material_fr : form.material_en}
            onChange={(e) => {
              const v = (e.target as HTMLInputElement).value;
              setForm((f) => matLang === 'fr' ? { ...f, material_fr: v } : { ...f, material_en: v });
              setHasChanges(true);
            }}
          />
        </section>

        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('productEdit.sectionPrice')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField id="prod-price" label={t('productEdit.priceField')} type="number" min="0" step="0.01" value={form.price}
              onChange={(e) => { setForm((f) => ({ ...f, price: parseFloat((e.target as HTMLInputElement).value) || 0 })); setHasChanges(true); }}
            />
            <FormField id="prod-compare" label={t('productEdit.compareField')} type="number" min="0" step="0.01" value={form.compare_at_price ?? ''}
              onChange={(e) => {
                const v = (e.target as HTMLInputElement).value;
                setForm((f) => ({ ...f, compare_at_price: v ? parseFloat(v) : null }));
                setHasChanges(true);
              }}
            />
            <FormField as="select" id="prod-currency" label={t('productEdit.currency')} value={form.currency}
              onChange={(e) => { setForm((f) => ({ ...f, currency: (e.target as HTMLSelectElement).value })); setHasChanges(true); }}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </FormField>
          </div>
        </section>

        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('productEdit.sectionVisibility')}</h3>
          <div className="space-y-3">
            <Toggle id="toggle-new" checked={form.is_new} onChange={(v) => { setForm((f) => ({ ...f, is_new: v })); setHasChanges(true); }} label={t('productEdit.toggleNew')} description={t('productEdit.toggleNewDesc')} />
            <Toggle id="toggle-featured" checked={form.is_featured} onChange={(v) => { setForm((f) => ({ ...f, is_featured: v })); setHasChanges(true); }} label={t('productEdit.toggleFeatured')} description={t('productEdit.toggleFeaturedDesc')} />
            <Toggle id="toggle-archived" checked={form.is_archived} onChange={(v) => { setForm((f) => ({ ...f, is_archived: v })); setHasChanges(true); }} label={t('productEdit.toggleArchived')} description={t('productEdit.toggleArchivedDesc')} />
          </div>
        </section>

        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('productEdit.sectionColors')}</h3>
          {colors.map((color) => (
            <div key={color.id} className="flex items-center gap-3 p-3 bg-[#111] border border-[#262626] rounded">
              <div className="w-6 h-6 rounded-full border border-[#262626] flex-shrink-0" style={{ backgroundColor: color.hex }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e8e2d6]">{color.label_fr} / {color.label_en}</p>
                <p className="text-xs text-[#57534e] font-mono">{color.hex} · {color.slug}</p>
              </div>
              <button onClick={() => handleRemoveColor(color.id)} className="text-xs text-[#57534e] hover:text-[#f87171] transition-colors">✕</button>
            </div>
          ))}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#111] border border-dashed border-[#262626] rounded">
            <FormField id="new-color-fr" label={t('productEdit.labelFr')} value={newColor.label_fr} onChange={(e) => setNewColor((c) => ({ ...c, label_fr: (e.target as HTMLInputElement).value }))} />
            <FormField id="new-color-en" label={t('productEdit.labelEn')} value={newColor.label_en} onChange={(e) => setNewColor((c) => ({ ...c, label_en: (e.target as HTMLInputElement).value }))} />
            <div>
              <label htmlFor="new-color-hex" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">{t('productEdit.color')}</label>
              <input id="new-color-hex" type="color" value={newColor.hex} onChange={(e) => setNewColor((c) => ({ ...c, hex: e.target.value }))} className="w-full h-[34px] bg-[#111] border border-[#262626] rounded cursor-pointer" />
            </div>
            <div className="flex items-end">
              <button onClick={handleAddColor} className="w-full bg-[#262626] hover:bg-[#333] text-[#e8e2d6] text-xs py-2 rounded transition-colors">{t('common.add')}</button>
            </div>
          </div>
        </section>

        {colors.length > 0 && (
          <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('productEdit.sectionStock')}</h3>
            {colors.map((color) => (
              <div key={color.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.hex }} />
                  <p className="text-xs text-[#a8a29e]">{color.label_fr}</p>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {SIZES.map((size) => (
                    <div key={size}>
                      <label className="block text-[10px] text-[#57534e] mb-1 text-center">{size}</label>
                      <input type="number" min="0" value={stockMap[color.id]?.[size] ?? 0}
                        onChange={(e) => handleStockChange(color.id, size, parseInt(e.target.value) || 0)}
                        className="w-full bg-[#111] border border-[#262626] rounded text-center text-[#e8e2d6] text-sm py-1.5 focus:outline-none focus:border-[#c8b89a] transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('productEdit.sectionMedia')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {media.map((item, idx) => (
              <div key={item.id} className="relative group">
                <div className="aspect-[3/4] bg-[#111] rounded overflow-hidden">
                  <img src={item.url} alt={item.alt} className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {idx > 0 && (
                    <button onClick={() => {
                      const next = [...media];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      setMedia(next);
                    }} className="w-5 h-5 bg-black/80 text-white text-xs rounded flex items-center justify-center">↑</button>
                  )}
                  <button onClick={() => handleRemoveMedia(item.id)} className="w-5 h-5 bg-black/80 text-[#f87171] text-xs rounded flex items-center justify-center">✕</button>
                </div>
              </div>
            ))}
          </div>
          {/* Upload depuis l'ordinateur */}
          <label className={`flex items-center justify-center gap-2 border border-dashed border-[#262626] rounded py-4 text-xs transition-colors cursor-pointer ${uploading ? 'opacity-60 cursor-wait' : 'text-[#a8a29e] hover:border-[#c8b89a] hover:text-[#e8e2d6]'}`}>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => { void handleUploadFiles(e.target.files); e.target.value = ''; }}
              className="hidden"
            />
            {uploading ? t('productEdit.uploading') : t('productEdit.uploadFiles')}
          </label>
          {/* Ou coller une URL */}
          <div className="flex gap-2">
            <input type="url" placeholder={t('productEdit.mediaUrlPlaceholder')} value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              className="flex-1 bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 placeholder-[#57534e] focus:outline-none focus:border-[#c8b89a] transition-colors"
            />
            <button onClick={handleAddMedia} className="bg-[#262626] hover:bg-[#333] text-[#e8e2d6] text-xs px-4 py-2 rounded transition-colors">{t('common.add')}</button>
          </div>
        </section>
      </div>

      <SaveBar hasChanges={hasChanges} onSave={handleSave} onDiscard={() => navigate('/admin/products')} saving={saving} />
    </div>
  );
}
