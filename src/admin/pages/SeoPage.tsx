import { useState, useEffect, useCallback } from 'react';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import { listSeoSettings, updateSeoSetting } from '../services/seo';
import { mockSeoSettings } from '../mockData';
import type { SeoSetting } from '../types';

function SeoModal({
  setting,
  onSave,
  onClose,
}: {
  setting: SeoSetting;
  onSave: (s: SeoSetting) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<SeoSetting>(setting);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-xl mx-4 bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[#e8e2d6] font-display font-semibold text-base mb-1">SEO — {setting.page}</h3>
        <p className="text-xs text-[#57534e] mb-4">Métadonnées pour les moteurs de recherche</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField id="seo-title-fr" label="Title FR" value={form.title_fr} onChange={(e) => setForm((f) => ({ ...f, title_fr: (e.target as HTMLInputElement).value }))} />
            <FormField id="seo-title-en" label="Title EN" value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: (e.target as HTMLInputElement).value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField as="textarea" id="seo-desc-fr" label="Description FR" rows={3} value={form.description_fr} onChange={(e) => setForm((f) => ({ ...f, description_fr: (e.target as HTMLTextAreaElement).value }))} />
            <FormField as="textarea" id="seo-desc-en" label="Description EN" rows={3} value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: (e.target as HTMLTextAreaElement).value }))} />
          </div>
          <FormField id="seo-og" label="OG Image URL" type="url" value={form.og_image} onChange={(e) => setForm((f) => ({ ...f, og_image: (e.target as HTMLInputElement).value }))} />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving} className="bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-sm font-semibold px-5 py-2 rounded transition-colors disabled:opacity-60">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button onClick={onClose} className="text-sm text-[#57534e] hover:text-[#a8a29e] px-5 py-2 border border-[#262626] rounded transition-colors">Annuler</button>
        </div>
      </div>
    </div>
  );
}

const pageLabels: Record<string, string> = {
  home: 'Accueil',
  collection: 'Collection',
  about: 'À propos',
  archive: 'Archives',
  blog: 'Blog / Journal',
  product: 'Pages produit',
};

export default function SeoPage() {
  const [settings, setSettings] = useState<SeoSetting[]>(mockSeoSettings);
  const [editTarget, setEditTarget] = useState<SeoSetting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: svcErr } = await listSeoSettings();
      if (svcErr) { setError(svcErr.message); return; }
      if (data) setSettings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (updated: SeoSetting) => {
    try {
      const { data, error: svcErr } = await updateSeoSetting(updated);
      if (svcErr) { setError(svcErr.message); return; }
      if (data) setSettings((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      setEditTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Paramètres</p>
        <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">SEO</h2>
        <p className="text-sm text-[#57534e] mt-0.5">Métadonnées par page</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                {['Page', 'Title FR', 'Title EN', 'OG Image', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#57534e]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={setting.id} className="border-b border-[#1f1f1f] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-[10px] uppercase tracking-widest text-[#c8b89a] bg-[#c8b89a]/10 border border-[#c8b89a]/20 rounded px-1.5 py-0.5">
                      {pageLabels[setting.page] ?? setting.page}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#a8a29e] max-w-[160px] truncate">{setting.title_fr}</td>
                  <td className="px-4 py-3 text-sm text-[#57534e] max-w-[160px] truncate">{setting.title_en}</td>
                  <td className="px-4 py-3">
                    {setting.og_image ? (
                      <div className="w-10 h-6 bg-[#262626] rounded overflow-hidden">
                        <img src={setting.og_image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-xs text-[#57534e]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditTarget(setting)}
                      className="text-xs text-[#57534e] hover:text-[#c8b89a] transition-colors px-2 py-1 border border-[#262626] rounded hover:border-[#c8b89a]/30"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editTarget && (
        <SeoModal
          setting={editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
