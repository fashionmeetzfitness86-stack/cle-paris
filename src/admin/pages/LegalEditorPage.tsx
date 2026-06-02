import { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import SaveBar from '../components/SaveBar';
import { listLegalPages, updateLegalPage } from '../services/legal';
import { mockLegalPages } from '../mockData';
import type { LegalPage } from '../types';

type Lang = 'fr' | 'en';

export default function LegalEditorPage() {
  const [pages, setPages] = useState<LegalPage[]>(mockLegalPages);
  const [selectedId, setSelectedId] = useState<string>(mockLegalPages[0]?.id ?? '');
  const [editLang, setEditLang] = useState<Lang>('fr');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await listLegalPages();
    if (err) setError(err.message);
    else if (data) {
      setPages(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    }
    setLoading(false);
  }, [selectedId]);

  useEffect(() => { void load(); }, [load]);

  const selected = pages.find((p) => p.id === selectedId) ?? null;

  const updateField = (key: keyof LegalPage, value: string) => {
    setPages((ps) => ps.map((p) => p.id === selectedId ? { ...p, [key]: value } : p));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const { error: err } = await updateLegalPage(selected);
    if (err) setError(err.message);
    else setHasChanges(false);
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 pb-24">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Contenu</p>
        <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">Mentions légales</h2>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {pages.length === 0 ? (
        <EmptyState title="Aucune page légale" />
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Page list */}
          <div className="space-y-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => { setSelectedId(page.id); setHasChanges(false); }}
                className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors ${selectedId === page.id ? 'bg-[#1a1a1a] border border-[#c8b89a]/30 text-[#e8e2d6]' : 'text-[#a8a29e] hover:bg-[#1a1a1a] hover:text-[#e8e2d6] border border-transparent'}`}
              >
                {page.title_fr}
              </button>
            ))}
          </div>

          {/* Editor */}
          {selected ? (
            <div className="md:col-span-2 bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#e8e2d6]">{selected.slug}</h3>
                <div className="flex gap-1 bg-[#111] border border-[#262626] rounded p-0.5">
                  {(['fr', 'en'] as Lang[]).map((l) => (
                    <button key={l} onClick={() => setEditLang(l)} className={`px-3 py-0.5 text-xs rounded transition-colors ${editLang === l ? 'bg-[#262626] text-[#e8e2d6]' : 'text-[#57534e]'}`}>{l.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Titre ({editLang.toUpperCase()})</label>
                <input
                  value={editLang === 'fr' ? selected.title_fr : selected.title_en}
                  onChange={(e) => updateField(editLang === 'fr' ? 'title_fr' : 'title_en', e.target.value)}
                  className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Contenu ({editLang.toUpperCase()})</label>
                <textarea
                  rows={12}
                  value={editLang === 'fr' ? selected.body_fr : selected.body_en}
                  onChange={(e) => updateField(editLang === 'fr' ? 'body_fr' : 'body_en', e.target.value)}
                  className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors resize-none font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
          ) : null}
        </div>
      )}

      <SaveBar hasChanges={hasChanges} onSave={handleSave} onDiscard={() => { void load(); setHasChanges(false); }} saving={saving} />
    </div>
  );
}
