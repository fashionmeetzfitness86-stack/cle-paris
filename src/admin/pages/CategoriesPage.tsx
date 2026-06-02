import { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import { listCategories, upsertCategory, deleteCategory } from '../services/categories';
import { mockCategories } from '../mockData';
import type { Category } from '../types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [newCat, setNewCat] = useState({ slug: '', name_fr: '', name_en: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: svcErr } = await listCategories();
      if (svcErr) { setError(svcErr.message); return; }
      if (data) setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAdd = async () => {
    if (!newCat.name_fr || !newCat.slug) return;
    setSaving(true);
    try {
      const { data, error: svcErr } = await upsertCategory(newCat);
      if (svcErr) { setError(svcErr.message); return; }
      if (data) setCategories((c) => [...c, data]);
      setNewCat({ slug: '', name_fr: '', name_en: '' });
      setShowAddForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const { data, error: svcErr } = await upsertCategory(editTarget);
      if (svcErr) { setError(svcErr.message); return; }
      if (data) setCategories((c) => c.map((cat) => (cat.id === data.id ? data : cat)));
      setEditTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error: svcErr } = await deleteCategory(deleteTarget.id);
      if (svcErr) { setError(svcErr.message); return; }
      setCategories((c) => c.filter((cat) => cat.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Boutique</p>
          <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">Catégories</h2>
          <p className="text-sm text-[#57534e] mt-0.5">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-xs font-semibold px-4 py-2 rounded transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Nouvelle catégorie
        </button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-[#1a1a1a] border border-dashed border-[#c8b89a]/30 rounded-lg p-5">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e] mb-4">Ajouter une catégorie</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <FormField id="new-cat-slug" label="Slug" value={newCat.slug} onChange={(e) => setNewCat((c) => ({ ...c, slug: (e.target as HTMLInputElement).value }))} required />
            <FormField id="new-cat-fr" label="Nom FR" value={newCat.name_fr} onChange={(e) => setNewCat((c) => ({ ...c, name_fr: (e.target as HTMLInputElement).value }))} required />
            <FormField id="new-cat-en" label="Nom EN" value={newCat.name_en} onChange={(e) => setNewCat((c) => ({ ...c, name_en: (e.target as HTMLInputElement).value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-xs font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60">
              {saving ? 'Ajout…' : 'Ajouter'}
            </button>
            <button onClick={() => setShowAddForm(false)} className="text-xs text-[#57534e] hover:text-[#a8a29e] px-4 py-2 border border-[#262626] rounded transition-colors">Annuler</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : categories.length === 0 ? (
          <EmptyState title="Aucune catégorie créée" description="Ajoutez votre première catégorie ci-dessus." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                {['Slug', 'Nom FR', 'Nom EN', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#57534e]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-[#1f1f1f] hover:bg-white/[0.02] transition-colors">
                  {editTarget?.id === cat.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input value={editTarget.slug} onChange={(e) => setEditTarget((t) => t ? { ...t, slug: e.target.value } : t)} className="w-full bg-[#111] border border-[#c8b89a]/40 rounded text-[#e8e2d6] text-sm px-2 py-1 focus:outline-none" />
                      </td>
                      <td className="px-4 py-2">
                        <input value={editTarget.name_fr} onChange={(e) => setEditTarget((t) => t ? { ...t, name_fr: e.target.value } : t)} className="w-full bg-[#111] border border-[#c8b89a]/40 rounded text-[#e8e2d6] text-sm px-2 py-1 focus:outline-none" />
                      </td>
                      <td className="px-4 py-2">
                        <input value={editTarget.name_en} onChange={(e) => setEditTarget((t) => t ? { ...t, name_en: e.target.value } : t)} className="w-full bg-[#111] border border-[#c8b89a]/40 rounded text-[#e8e2d6] text-sm px-2 py-1 focus:outline-none" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button onClick={handleSaveEdit} disabled={saving} className="text-xs text-green-400 hover:text-green-300 transition-colors disabled:opacity-60">
                            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                          </button>
                          <button onClick={() => setEditTarget(null)} className="text-xs text-[#57534e] hover:text-[#a8a29e] transition-colors">Annuler</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm text-[#a8a29e] font-mono">{cat.slug}</td>
                      <td className="px-4 py-3 text-sm text-[#e8e2d6]">{cat.name_fr}</td>
                      <td className="px-4 py-3 text-sm text-[#a8a29e]">{cat.name_en}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setEditTarget(cat)} className="text-xs text-[#57534e] hover:text-[#c8b89a] transition-colors px-2 py-1 border border-[#262626] rounded hover:border-[#c8b89a]/30">Modifier</button>
                          <button onClick={() => setDeleteTarget(cat)} className="text-xs text-[#57534e] hover:text-[#f87171] transition-colors px-2 py-1 border border-[#262626] rounded hover:border-[#f87171]/30">Suppr.</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer la catégorie"
        message={`Supprimer "${deleteTarget?.name_fr}" ?`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
