import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Toggle from '../components/Toggle';
import FormField from '../components/FormField';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import { listCollections, upsertCollection, deleteCollection } from '../services/collections';
import { mockCollections } from '../mockData';
import type { Collection } from '../types';

function CollectionModal({
  collection,
  onSave,
  onClose,
}: {
  collection: Partial<Collection> | null;
  onSave: (c: Omit<Collection, 'id'> & { id?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useTranslation('admin');
  const [form, setForm] = useState<Partial<Collection>>(collection ?? {
    slug: '', name_fr: '', name_en: '', description_fr: '', description_en: '', cover_image: '', is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSave = async () => {
    if (!form.name_fr || !form.slug) return;
    setSaving(true);
    await onSave({
      id: (collection as Collection)?.id,
      slug: form.slug ?? '',
      name_fr: form.name_fr ?? '',
      name_en: form.name_en ?? '',
      description_fr: form.description_fr ?? '',
      description_en: form.description_en ?? '',
      cover_image: form.cover_image ?? '',
      is_active: form.is_active ?? true,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[#e8e2d6] font-display font-semibold text-base mb-4">
          {(collection as Collection)?.id ? t('collections.editTitle') : t('collections.newModalTitle')}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField id="col-name-fr" label={t('collections.nameFr')} required value={form.name_fr ?? ''} onChange={(e) => setForm((f) => ({ ...f, name_fr: (e.target as HTMLInputElement).value }))} />
            <FormField id="col-name-en" label={t('collections.nameEn')} value={form.name_en ?? ''} onChange={(e) => setForm((f) => ({ ...f, name_en: (e.target as HTMLInputElement).value }))} />
          </div>
          <FormField id="col-slug" label={t('collections.slug')} required value={form.slug ?? ''} onChange={(e) => setForm((f) => ({ ...f, slug: (e.target as HTMLInputElement).value }))} />
          <FormField as="textarea" id="col-desc-fr" label={t('collections.descriptionFr')} rows={3} value={form.description_fr ?? ''} onChange={(e) => setForm((f) => ({ ...f, description_fr: (e.target as HTMLTextAreaElement).value }))} />
          <FormField as="textarea" id="col-desc-en" label={t('collections.descriptionEn')} rows={3} value={form.description_en ?? ''} onChange={(e) => setForm((f) => ({ ...f, description_en: (e.target as HTMLTextAreaElement).value }))} />
          <FormField id="col-cover" label={t('collections.coverImage')} value={form.cover_image ?? ''} onChange={(e) => setForm((f) => ({ ...f, cover_image: (e.target as HTMLInputElement).value }))} />
          <Toggle id="col-active" checked={form.is_active ?? true} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} label={t('collections.toggleActive')} description={t('collections.toggleActiveDesc')} />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving} className="bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-sm font-semibold px-5 py-2 rounded transition-colors disabled:opacity-60">
            {saving ? t('common.saving') : t('common.save')}
          </button>
          <button onClick={onClose} className="text-sm text-[#57534e] hover:text-[#a8a29e] px-5 py-2 border border-[#262626] rounded transition-colors">{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  const { t } = useTranslation('admin');
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const [editTarget, setEditTarget] = useState<Collection | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: svcErr } = await listCollections();
      if (svcErr) { setError(svcErr.message); return; }
      if (data) setCollections(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleSave = async (col: Omit<Collection, 'id'> & { id?: string }) => {
    try {
      const { data, error: svcErr } = await upsertCollection(col);
      if (svcErr) { setError(svcErr.message); return; }
      if (data) {
        setCollections((prev) => {
          const exists = prev.some((c) => c.id === data.id);
          return exists ? prev.map((c) => (c.id === data.id ? data : c)) : [...prev, data];
        });
      }
      setEditTarget(null);
      setShowNew(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.saveError'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error: svcErr } = await deleteCollection(deleteTarget.id);
      if (svcErr) { setError(svcErr.message); return; }
      setCollections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.deleteError'));
      setDeleteTarget(null);
    }
  };

  const handleToggleActive = async (col: Collection, v: boolean) => {
    setCollections((prev) => prev.map((c) => c.id === col.id ? { ...c, is_active: v } : c));
    try {
      await upsertCollection({ ...col, is_active: v });
    } catch {
      // revert on error
      setCollections((prev) => prev.map((c) => c.id === col.id ? { ...c, is_active: !v } : c));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">{t('collections.overline')}</p>
          <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">{t('collections.title')}</h2>
          <p className="text-sm text-[#57534e] mt-0.5">{t('collections.count', { count: collections.length })}</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-xs font-semibold px-4 py-2 rounded transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t('collections.new')}
        </button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner />
      ) : collections.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg px-5 py-12 text-center">
          <EmptyState title={t('collections.emptyTitle')} description={t('collections.emptyDesc')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div key={col.id} className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden hover:border-[#333] transition-all">
              <div className="aspect-video bg-[#111]">
                {col.cover_image ? (
                  <img src={col.cover_image} alt={col.name_fr} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#57534e] text-xs">{t('collections.noImage')}</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#e8e2d6]">{col.name_fr}</p>
                    <p className="text-xs text-[#57534e] font-mono mt-0.5">{col.slug}</p>
                  </div>
                  <Toggle
                    id={`col-toggle-${col.id}`}
                    checked={col.is_active}
                    onChange={(v) => handleToggleActive(col, v)}
                  />
                </div>
                <p className="text-xs text-[#57534e] line-clamp-2 mb-3">{col.description_fr || '—'}</p>
                <div className="flex gap-2">
                  <button onClick={() => setEditTarget(col)} className="text-xs text-[#57534e] hover:text-[#c8b89a] transition-colors px-3 py-1 border border-[#262626] rounded hover:border-[#c8b89a]/30">{t('common.edit')}</button>
                  <button onClick={() => setDeleteTarget(col)} className="text-xs text-[#57534e] hover:text-[#f87171] transition-colors px-3 py-1 border border-[#262626] rounded hover:border-[#f87171]/30">{t('common.delete')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showNew || editTarget) && (
        <CollectionModal
          collection={editTarget}
          onSave={handleSave}
          onClose={() => { setEditTarget(null); setShowNew(false); }}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={t('collections.deleteTitle')}
        message={t('collections.deleteMessage', { name: deleteTarget?.name_fr })}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
