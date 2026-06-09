import { useState, useEffect, useCallback, Fragment } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import SaveBar from '../components/SaveBar';
import { listI18nEntries, bulkUpdateI18nEntries } from '../services/i18n';
import { mockI18nEntries } from '../mockData';
import type { I18nEntry } from '../types';

type Lang = 'fr' | 'en';

export default function I18nEditorPage() {
  const [entries, setEntries] = useState<I18nEntry[]>(mockI18nEntries);
  const [modified, setModified] = useState<Record<string, I18nEntry>>({});
  const [filterNs, setFilterNs] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await listI18nEntries();
    if (err) setError(err.message);
    else if (data) setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const namespaces = Array.from(new Set(entries.map((e) => e.namespace))).sort();

  const displayed = filterNs ? entries.filter((e) => e.namespace === filterNs) : entries;

  const grouped = displayed.reduce<Record<string, I18nEntry[]>>((acc, e) => {
    if (!acc[e.namespace]) acc[e.namespace] = [];
    acc[e.namespace].push(e);
    return acc;
  }, {});

  const handleChange = (entry: I18nEntry, lang: Lang, value: string) => {
    const updated = { ...entry, [`value_${lang}`]: value };
    setModified((m) => ({ ...m, [entry.id]: updated }));
    setEntries((es) => es.map((e) => e.id === entry.id ? updated : e));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const toSave = Object.values(modified);
    const { error: err } = await bulkUpdateI18nEntries(toSave);
    if (err) setError(err.message);
    else { setModified({}); setHasChanges(false); }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 pb-24">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Configuration</p>
        <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">Traductions</h2>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Namespace filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilterNs('')} className={`px-3 py-1 text-xs rounded border transition-colors ${filterNs === '' ? 'border-[#c8b89a] text-[#c8b89a]' : 'border-[#262626] text-[#57534e] hover:border-[#333]'}`}>Tous</button>
        {namespaces.map((ns) => (
          <button key={ns} onClick={() => setFilterNs(ns)} className={`px-3 py-1 text-xs rounded border transition-colors ${filterNs === ns ? 'border-[#c8b89a] text-[#c8b89a]' : 'border-[#262626] text-[#57534e] hover:border-[#333]'}`}>{ns}</button>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState title="Aucune entrée" description="Les clés de traduction s'afficheront ici." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([ns, nsEntries]) => (
            <Fragment key={ns}>
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-[#262626]">
                  <span className="text-[10px] uppercase tracking-widest text-[#57534e]">{ns}</span>
                </div>
                {nsEntries.map((entry, idx) => (
                  <div key={entry.id} className={`grid grid-cols-3 gap-0 ${idx < nsEntries.length - 1 ? 'border-b border-[#262626]' : ''}`}>
                    <div className="px-4 py-2.5 border-r border-[#262626] flex items-center">
                      <span className="text-xs font-mono text-[#57534e]">{entry.key}</span>
                    </div>
                    <div className="border-r border-[#262626]">
                      <input
                        value={entry.value_fr}
                        onChange={(e) => handleChange(entry, 'fr', e.target.value)}
                        className={`w-full px-4 py-2.5 bg-transparent text-sm text-[#e8e2d6] focus:outline-none focus:bg-[#111] transition-colors ${modified[entry.id] ? 'text-[#c8b89a]' : ''}`}
                        placeholder="FR"
                      />
                    </div>
                    <div>
                      <input
                        value={entry.value_en}
                        onChange={(e) => handleChange(entry, 'en', e.target.value)}
                        className={`w-full px-4 py-2.5 bg-transparent text-sm text-[#e8e2d6] focus:outline-none focus:bg-[#111] transition-colors ${modified[entry.id] ? 'text-[#c8b89a]' : ''}`}
                        placeholder="EN"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      )}

      <SaveBar hasChanges={hasChanges} onSave={handleSave} onDiscard={() => { void load(); setModified({}); setHasChanges(false); }} saving={saving} />
    </div>
  );
}
