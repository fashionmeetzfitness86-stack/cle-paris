import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { mockProducts, mockCategories, mockCollections, mockColors, mockVariants, mockProductMedia } from '../mockData';
import type { Product, ProductColor, ProductMedia } from '../types';
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

export default function ProductEditPage() {
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: generateSlug(name) }));
    setHasChanges(true);
  };

  const handleAddColor = async () => {
    if (!newColor.label_fr) return;
    const colorPayload: Omit<ProductColor, 'id'> = {
      product_id: id ?? 'new',
      ...newColor,
      slug: generateSlug(newColor.label_fr),
    };
    const { data, error: err } = await upsertProductColor(colorPayload);
    if (err || !data) return;
    setColors((c) => [...c, data]);
    setStockMap((s) => ({ ...s, [data.id]: Object.fromEntries(SIZES.map((sz) => [sz, 0])) }));
    setNewColor({ label_fr: '', label_en: '', hex: '#1a1a1a', slug: '' });
  };

  const handleRemoveColor = async (colorId: string) => {
    await deleteProductColor(colorId);
    setColors((c) => c.filter((col) => col.id !== colorId));
    setStockMap((s) => { const next = { ...s }; delete next[colorId]; return next; });
  };

  const handleStockChange = (colorId: string, size: string, value: number) => {
    setStockMap((s) => ({ ...s, [colorId]: { ...s[colorId], [size]: value } }));
    setHasChanges(true);
  };

  const handleAddMedia = async () => {
    if (!newMediaUrl.trim()) return;
    const payload: Omit<ProductMedia, 'id'> = {
      product_id: id ?? 'new',
      url: newMediaUrl.trim(),
      alt: form.name,
      type: 'image',
      sort_order: media.length + 1,
    };
    const { data } = await insertProductMedia(payload);
    if (data) setMedia((m) => [...m, data]);
    setNewMediaUrl('');
  };

  const handleRemoveMedia = async (mediaId: string) => {
    await deleteProductMedia(mediaId);
    setMedia((m) => m.filter((item) => item.id !== mediaId));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const payload = isNew ? form : { ...form, id };
    const { error: err } = await upsertProduct(payload);

    if (err) { setError(err.message); setSaving(false); return; }

    // Save variants
    for (const color of colors) {
      const variants = SIZES.map((size) => ({
        product_id: id ?? 'new',
        color_id: color.id,
        size,
        stock: stockMap[color.id]?.[size] ?? 0,
        sku: `CLP-${color.slug.toUpperCase()}-${size}`,
      }));
      await replaceProductVariants(id ?? 'new', color.id, variants);
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
            {isNew ? 'Nouveau produit' : `Modifier — ${form.name}`}
          </h2>
          <p className="text-sm text-[#57534e] mt-0.5">
            {isNew ? 'Créer un nouveau produit' : 'Modifier les informations du produit'}
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="space-y-5">
        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">Informations de base</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="prod-name" label="Nom du produit" required value={form.name}
              onChange={(e) => handleNameChange((e.target as HTMLInputElement).value)}
            />
            <FormField
              id="prod-slug" label="Slug" value={form.slug}
              onChange={(e) => { setForm((f) => ({ ...f, slug: (e.target as HTMLInputElement).value })); setHasChanges(true); }}
              hint="Généré automatiquement depuis le nom"
            />
            <FormField as="select" id="prod-category" label="Catégorie"
              value={form.category_id ?? ''}
              onChange={(e) => { setForm((f) => ({ ...f, category_id: (e.target as HTMLSelectElement).value || null })); setHasChanges(true); }}
            >
              <option value="">— Sans catégorie —</option>
              {mockCategories.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
            </FormField>
            <FormField as="select" id="prod-collection" label="Collection"
              value={form.collection_id ?? ''}
              onChange={(e) => { setForm((f) => ({ ...f, collection_id: (e.target as HTMLSelectElement).value || null })); setHasChanges(true); }}
            >
              <option value="">— Sans collection —</option>
              {mockCollections.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
            </FormField>
          </div>
        </section>

        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-[#57534e]">Description</h3>
            <div className="flex gap-1 bg-[#111] border border-[#262626] rounded p-0.5">
              {langs.map((l) => (
                <button key={l} onClick={() => setDescLang(l)} className={`px-3 py-0.5 text-xs rounded transition-colors ${descLang === l ? 'bg-[#262626] text-[#e8e2d6]' : 'text-[#57534e]'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <FormField as="textarea" id="prod-desc" label={`Description (${descLang.toUpperCase()})`} rows={4}
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
            <h3 className="text-xs uppercase tracking-widest text-[#57534e]">Matière</h3>
            <div className="flex gap-1 bg-[#111] border border-[#262626] rounded p-0.5">
              {langs.map((l) => (
                <button key={l} onClick={() => setMatLang(l)} className={`px-3 py-0.5 text-xs rounded transition-colors ${matLang === l ? 'bg-[#262626] text-[#e8e2d6]' : 'text-[#57534e]'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <FormField id="prod-material" label={`Matière (${matLang.toUpperCase()})`}
            value={matLang === 'fr' ? form.material_fr : form.material_en}
            onChange={(e) => {
              const v = (e.target as HTMLInputElement).value;
              setForm((f) => matLang === 'fr' ? { ...f, material_fr: v } : { ...f, material_en: v });
              setHasChanges(true);
            }}
          />
        </section>

        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">Prix</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField id="prod-price" label="Prix (€)" type="number" min="0" step="0.01" value={form.price}
              onChange={(e) => { setForm((f) => ({ ...f, price: parseFloat((e.target as HTMLInputElement).value) || 0 })); setHasChanges(true); }}
            />
            <FormField id="prod-compare" label="Prix barré (€)" type="number" min="0" step="0.01" value={form.compare_at_price ?? ''}
              onChange={(e) => {
                const v = (e.target as HTMLInputElement).value;
                setForm((f) => ({ ...f, compare_at_price: v ? parseFloat(v) : null }));
                setHasChanges(true);
              }}
            />
            <FormField as="select" id="prod-currency" label="Devise" value={form.currency}
              onChange={(e) => { setForm((f) => ({ ...f, currency: (e.target as HTMLSelectElement).value })); setHasChanges(true); }}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </FormField>
          </div>
        </section>

        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">Visibilité</h3>
          <div className="space-y-3">
            <Toggle id="toggle-new" checked={form.is_new} onChange={(v) => { setForm((f) => ({ ...f, is_new: v })); setHasChanges(true); }} label="Nouveauté" description="Afficher le badge «New» sur le produit" />
            <Toggle id="toggle-featured" checked={form.is_featured} onChange={(v) => { setForm((f) => ({ ...f, is_featured: v })); setHasChanges(true); }} label="Mis en avant" description="Apparaît dans la sélection homepage" />
            <Toggle id="toggle-archived" checked={form.is_archived} onChange={(v) => { setForm((f) => ({ ...f, is_archived: v })); setHasChanges(true); }} label="Archivé" description="Masquer le produit de la boutique" />
          </div>
        </section>

        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">Couleurs</h3>
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
            <FormField id="new-color-fr" label="Label FR" value={newColor.label_fr} onChange={(e) => setNewColor((c) => ({ ...c, label_fr: (e.target as HTMLInputElement).value }))} />
            <FormField id="new-color-en" label="Label EN" value={newColor.label_en} onChange={(e) => setNewColor((c) => ({ ...c, label_en: (e.target as HTMLInputElement).value }))} />
            <div>
              <label htmlFor="new-color-hex" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Couleur</label>
              <input id="new-color-hex" type="color" value={newColor.hex} onChange={(e) => setNewColor((c) => ({ ...c, hex: e.target.value }))} className="w-full h-[34px] bg-[#111] border border-[#262626] rounded cursor-pointer" />
            </div>
            <div className="flex items-end">
              <button onClick={handleAddColor} className="w-full bg-[#262626] hover:bg-[#333] text-[#e8e2d6] text-xs py-2 rounded transition-colors">Ajouter</button>
            </div>
          </div>
        </section>

        {colors.length > 0 && (
          <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[#57534e]">Stock par taille</h3>
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
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">Médias</h3>
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
          <div className="flex gap-2">
            <input type="url" placeholder="https://… URL de l'image" value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              className="flex-1 bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 placeholder-[#57534e] focus:outline-none focus:border-[#c8b89a] transition-colors"
            />
            <button onClick={handleAddMedia} className="bg-[#262626] hover:bg-[#333] text-[#e8e2d6] text-xs px-4 py-2 rounded transition-colors">Ajouter</button>
          </div>
        </section>
      </div>

      <SaveBar hasChanges={hasChanges} onSave={handleSave} onDiscard={() => navigate('/admin/products')} saving={saving} />
    </div>
  );
}
