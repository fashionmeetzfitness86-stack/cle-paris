import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Toggle from '../components/Toggle';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import SaveBar from '../components/SaveBar';
import { getBanner, updateBanner } from '../services/banner';
import { mockBanner } from '../mockData';
import type { Banner } from '../types';

export default function BannerEditorPage() {
  const [banner, setBanner] = useState<Banner>(mockBanner);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await getBanner();
    if (err) setError(err.message);
    else if (data) setBanner(data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const set = <K extends keyof Banner>(key: K, value: Banner[K]) => {
    setBanner((b) => ({ ...b, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error: err } = await updateBanner(banner);
    if (err) setError(err.message);
    else { setHasChanges(false); }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6 max-w-2xl pb-24">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Contenu</p>
        <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">Bannière</h2>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Live preview */}
      <div
        className="rounded-lg px-4 py-2 text-sm text-center font-medium transition-all"
        style={{ backgroundColor: banner.background_color, color: banner.text_color }}
      >
        {banner.message_fr || 'Aperçu bannière'}
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-5">
        <Toggle
          id="banner-active"
          checked={banner.is_active}
          onChange={(v) => set('is_active', v)}
          label="Bannière active"
          description="Afficher la bannière sur le site"
        />

        <div className="space-y-4">
          <div>
            <label htmlFor="banner-msg-fr" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Message FR</label>
            <input
              id="banner-msg-fr"
              value={banner.message_fr}
              onChange={(e) => set('message_fr', e.target.value)}
              className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2.5 focus:outline-none focus:border-[#c8b89a] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="banner-msg-en" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Message EN</label>
            <input
              id="banner-msg-en"
              value={banner.message_en}
              onChange={(e) => set('message_en', e.target.value)}
              className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2.5 focus:outline-none focus:border-[#c8b89a] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="banner-link" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Lien</label>
            <input
              id="banner-link"
              value={banner.link}
              onChange={(e) => set('link', e.target.value)}
              className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2.5 focus:outline-none focus:border-[#c8b89a] transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="banner-bg" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Fond</label>
              <div className="flex gap-2 items-center">
                <input id="banner-bg" type="color" value={banner.background_color} onChange={(e) => set('background_color', e.target.value)} className="w-10 h-10 bg-[#111] border border-[#262626] rounded cursor-pointer" />
                <span className="text-sm text-[#a8a29e] font-mono">{banner.background_color}</span>
              </div>
            </div>
            <div>
              <label htmlFor="banner-text-color" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Texte</label>
              <div className="flex gap-2 items-center">
                <input id="banner-text-color" type="color" value={banner.text_color} onChange={(e) => set('text_color', e.target.value)} className="w-10 h-10 bg-[#111] border border-[#262626] rounded cursor-pointer" />
                <span className="text-sm text-[#a8a29e] font-mono">{banner.text_color}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SaveBar
        hasChanges={hasChanges}
        onSave={handleSave}
        onDiscard={() => { setBanner(mockBanner); setHasChanges(false); navigate(0); }}
        saving={saving}
      />
    </div>
  );
}
