import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import SaveBar from '../components/SaveBar';
import Toggle from '../components/Toggle';
import MediaPickerModal from '../components/MediaPickerModal';
import {
  listHomepageSections,
  updateHomepageSection,
  reorderHomepageSections,
} from '../services/homepage';
import { mockHomepageSections } from '../mockData';
import type { HomepageSection } from '../types';

type Lang = 'fr' | 'en';
type MediaTarget = 'image' | 'video_url' | null;

const TYPE_BADGE_COLORS: Record<string, string> = {
  hero:              'bg-[#c8b89a]/15 text-[#c8b89a]',
  collection_banner: 'bg-blue-400/10 text-blue-400',
  text_block:        'bg-emerald-400/10 text-emerald-400',
  product_grid:      'bg-violet-400/10 text-violet-400',
  testimonial_strip: 'bg-amber-400/10 text-amber-400',
  newsletter:        'bg-rose-400/10 text-rose-400',
};

/** Which fields each section type exposes */
const TYPE_FIELDS: Record<string, {
  showTitle: boolean;
  showSubtitle: boolean;
  showBody: boolean;
  showImage: boolean;
  showVideo: boolean;
  showLink: boolean;
  showCta: boolean;
}> = {
  hero: {
    showTitle: true, showSubtitle: true, showBody: true,
    showImage: true, showVideo: true, showLink: true, showCta: true,
  },
  collection_banner: {
    showTitle: true, showSubtitle: true, showBody: false,
    showImage: true, showVideo: false, showLink: true, showCta: false,
  },
  text_block: {
    showTitle: true, showSubtitle: false, showBody: true,
    showImage: false, showVideo: false, showLink: true, showCta: false,
  },
  product_grid: {
    showTitle: true, showSubtitle: false, showBody: false,
    showImage: false, showVideo: false, showLink: false, showCta: false,
  },
  testimonial_strip: {
    showTitle: true, showSubtitle: true, showBody: true,
    showImage: false, showVideo: false, showLink: false, showCta: false,
  },
  newsletter: {
    showTitle: true, showSubtitle: true, showBody: false,
    showImage: false, showVideo: false, showLink: false, showCta: false,
  },
};

const DEFAULT_FIELDS = {
  showTitle: true, showSubtitle: true, showBody: true,
  showImage: true, showVideo: false, showLink: true, showCta: false,
};

export default function HomepageEditorPage() {
  const { t } = useTranslation('admin');
  const sectionTypeLabel = (type: string) =>
    t(`homepage.type.${type}`, { defaultValue: type });
  const [sections,   setSections]   = useState<HomepageSection[]>(mockHomepageSections);
  const [selected,   setSelected]   = useState<HomepageSection | null>(null);
  const [editLang,   setEditLang]   = useState<Lang>('fr');
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [mediaPicker,setMediaPicker]= useState<MediaTarget>(null);
  const [iframeKey,  setIframeKey]  = useState(0);
  const [previewMode,setPreviewMode]= useState<'desktop'|'mobile'>('desktop');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await listHomepageSections();
    if (err) setError(err.message);
    else if (data) setSections(data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleReorder = async (idx: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setSections(next);
    await reorderHomepageSections(next.map((s) => s.id));
  };

  const handleToggleVisible = async (section: HomepageSection) => {
    const updated = { ...section, is_visible: !section.is_visible };
    setSections((ss) => ss.map((s) => s.id === section.id ? updated : s));
    await updateHomepageSection(updated);
  };

  const updateField = (key: keyof HomepageSection, value: string | boolean | number) => {
    if (!selected) return;
    const updated = { ...selected, [key]: value };
    setSelected(updated);
    setSections((ss) => ss.map((s) => s.id === updated.id ? updated : s));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const { error: err } = await updateHomepageSection(selected);
    if (err) setError(err.message);
    else {
      setHasChanges(false);
      setIframeKey((k) => k + 1); // refresh preview
    }
    setSaving(false);
  };

  const handleMediaSelect = (url: string) => {
    if (!mediaPicker) return;
    updateField(mediaPicker, url);
    setMediaPicker(null);
  };

  const fields = selected ? (TYPE_FIELDS[selected.type] ?? DEFAULT_FIELDS) : DEFAULT_FIELDS;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* ── Left: Section list ──────────────────────────────── */}
        <aside className="w-64 shrink-0 border-r border-[#1e1e1e] flex flex-col">
          <div className="px-4 py-4 border-b border-[#1e1e1e]">
            <p className="text-[9px] uppercase tracking-widest text-[#57534e] mb-0.5">{t('homepage.overline')}</p>
            <h2 className="text-sm font-display font-semibold text-[#e8e2d6]">{t('homepage.title')}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {sections.length === 0 ? (
              <EmptyState title={t('homepage.emptyTitle')} description={t('homepage.emptyDesc')} />
            ) : sections.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => { setSelected(s); setHasChanges(false); }}
                className={`group flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selected?.id === s.id
                    ? 'border-[#c8b89a]/30 bg-[#1a1a1a]'
                    : 'border-[#1e1e1e] bg-transparent hover:border-[#262626]'
                }`}
              >
                {/* Reorder */}
                <div className="flex flex-col gap-0.5 pt-0.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => void handleReorder(idx, -1)}
                    disabled={idx === 0}
                    className="text-[#57534e] hover:text-[#a8a29e] disabled:opacity-20 text-[10px] leading-none"
                  >▲</button>
                  <button
                    onClick={() => void handleReorder(idx, 1)}
                    disabled={idx === sections.length - 1}
                    className="text-[#57534e] hover:text-[#a8a29e] disabled:opacity-20 text-[10px] leading-none"
                  >▼</button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#e8e2d6] truncate">{s.title_fr || s.key}</p>
                  <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded font-medium ${
                    TYPE_BADGE_COLORS[s.type] ?? 'bg-[#262626] text-[#57534e]'
                  }`}>
                    {sectionTypeLabel(s.type)}
                  </span>
                </div>

                {/* Visibility */}
                <div onClick={(e) => e.stopPropagation()}>
                  <Toggle
                    id={`vis-${s.id}`}
                    checked={s.is_visible}
                    onChange={() => void handleToggleVisible(s)}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Center: Field editor ────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[#1e1e1e] overflow-y-auto">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {!selected ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-[#57534e]">{t('homepage.selectPrompt')}</p>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Section header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-medium ${
                    TYPE_BADGE_COLORS[selected.type] ?? 'bg-[#262626] text-[#57534e]'
                  }`}>
                    {sectionTypeLabel(selected.type)}
                  </span>
                  <p className="text-[10px] text-[#57534e] mt-1">{t('homepage.key', { key: selected.key })}</p>
                </div>
                {/* Language toggle */}
                <div className="flex gap-1 bg-[#111] border border-[#262626] rounded p-0.5">
                  {(['fr', 'en'] as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setEditLang(l)}
                      className={`px-3 py-0.5 text-xs rounded transition-colors ${
                        editLang === l ? 'bg-[#262626] text-[#e8e2d6]' : 'text-[#57534e]'
                      }`}
                    >{l.toUpperCase()}</button>
                  ))}
                </div>
              </div>

              {/* Title */}
              {fields.showTitle && (
                <FieldInput
                  label={t('homepage.fieldTitle', { lang: editLang.toUpperCase() })}
                  value={editLang === 'fr' ? selected.title_fr : selected.title_en}
                  onChange={(v) => updateField(editLang === 'fr' ? 'title_fr' : 'title_en', v)}
                />
              )}

              {/* Subtitle */}
              {fields.showSubtitle && (
                <FieldInput
                  label={t('homepage.fieldSubtitle', { lang: editLang.toUpperCase() })}
                  value={editLang === 'fr' ? selected.subtitle_fr : selected.subtitle_en}
                  onChange={(v) => updateField(editLang === 'fr' ? 'subtitle_fr' : 'subtitle_en', v)}
                />
              )}

              {/* Body */}
              {fields.showBody && (
                <FieldTextarea
                  label={t('homepage.fieldBody', { lang: editLang.toUpperCase() })}
                  value={editLang === 'fr' ? selected.body_fr : selected.body_en}
                  onChange={(v) => updateField(editLang === 'fr' ? 'body_fr' : 'body_en', v)}
                />
              )}

              {/* Image */}
              {fields.showImage && (
                <FieldMedia
                  label={t('homepage.fieldImage')}
                  value={selected.image}
                  onChange={(v) => updateField('image', v)}
                  onBrowse={() => setMediaPicker('image')}
                  type="image"
                />
              )}

              {/* Video */}
              {fields.showVideo && (
                <FieldMedia
                  label={t('homepage.fieldVideo')}
                  value={selected.video_url}
                  onChange={(v) => updateField('video_url', v)}
                  onBrowse={() => setMediaPicker('video_url')}
                  type="video"
                />
              )}

              {/* Link */}
              {fields.showLink && (
                <FieldInput
                  label={t('homepage.fieldLink')}
                  value={selected.link}
                  onChange={(v) => updateField('link', v)}
                />
              )}

              {/* Visibility toggle */}
              <div className="flex items-center justify-between border-t border-[#1e1e1e] pt-4">
                <span className="text-xs text-[#a8a29e]">{t('homepage.visibleOnHomepage')}</span>
                <Toggle
                  id="selected-vis"
                  checked={selected.is_visible}
                  onChange={() => updateField('is_visible', !selected.is_visible)}
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="w-full py-2.5 text-xs font-semibold uppercase tracking-widest rounded transition-all duration-200 bg-[#c8b89a] text-[#0f0f0f] hover:bg-[#b8a88a] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? t('common.saving') : hasChanges ? t('common.saveChanges') : t('common.noChanges')}
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Live preview ─────────────────────────────── */}
        <div className="w-[360px] shrink-0 flex flex-col bg-[#0a0a0a]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e1e1e]">
            <p className="text-[10px] uppercase tracking-widest text-[#57534e]">{t('homepage.preview')}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`text-[10px] px-2 py-1 rounded transition-colors ${previewMode === 'desktop' ? 'text-[#c8b89a]' : 'text-[#57534e]'}`}
              >{t('homepage.desktop')}</button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`text-[10px] px-2 py-1 rounded transition-colors ${previewMode === 'mobile' ? 'text-[#c8b89a]' : 'text-[#57534e]'}`}
              >{t('homepage.mobile')}</button>
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="text-[#57534e] hover:text-[#a8a29e] text-xs transition-colors"
                title={t('homepage.refresh')}
              >↻</button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex items-start justify-center p-2">
            <iframe
              key={iframeKey}
              src="/"
              className={`border border-[#1e1e1e] rounded bg-white transition-all duration-300 ${
                previewMode === 'mobile' ? 'w-[375px] h-[700px] scale-[0.85] origin-top' : 'w-full h-full'
              }`}
              title={t('homepage.preview')}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* Save bar (for keyboard shortcut / bottom bar) */}
      <SaveBar
        hasChanges={hasChanges}
        onSave={handleSave}
        onDiscard={() => { setHasChanges(false); void load(); }}
        saving={saving}
      />

      {/* Media picker modal */}
      <MediaPickerModal
        isOpen={mediaPicker !== null}
        onClose={() => setMediaPicker(null)}
        onSelect={handleMediaSelect}
        filter={mediaPicker === 'video_url' ? 'video' : 'image'}
      />
    </>
  );
}

// ── Reusable field components ────────────────────────────────────
function FieldInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors"
      />
    </div>
  );
}

function FieldTextarea({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors resize-none"
      />
    </div>
  );
}

function FieldMedia({
  label, value, onChange, onBrowse, type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBrowse: () => void;
  type: 'image' | 'video';
}) {
  const { t } = useTranslation('admin');
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={type === 'video' ? t('homepage.videoPlaceholder') : t('homepage.imagePlaceholder')}
          className="flex-1 bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors"
        />
        <button
          onClick={onBrowse}
          className="shrink-0 text-xs bg-[#1a1a1a] border border-[#262626] rounded px-3 py-2 text-[#a8a29e] hover:text-[#c8b89a] hover:border-[#c8b89a] transition-colors whitespace-nowrap"
        >
          {t('common.browse')}
        </button>
      </div>
      {/* Image preview */}
      {type === 'image' && value && (
        <div className="mt-2 rounded overflow-hidden border border-[#262626] h-24">
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {/* Video URL indicator */}
      {type === 'video' && value && (
        <p className="mt-1 text-[10px] text-[#57534e] truncate">✓ {value}</p>
      )}
    </div>
  );
}
