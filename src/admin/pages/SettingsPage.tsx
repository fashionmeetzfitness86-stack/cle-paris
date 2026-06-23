import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import SaveBar from '../components/SaveBar';
import { listSettings, bulkUpdateSettings } from '../services/settings';
import { mockStoreSettings } from '../mockData';
import type { StoreSetting } from '../types';

function SettingInput({ setting, onChange }: { setting: StoreSetting; onChange: (key: string, value: string) => void }) {
  return (
    <div className="grid grid-cols-2 items-center gap-4 py-3 border-b border-[#262626] last:border-0">
      <div>
        <p className="text-sm text-[#e8e2d6]">{setting.key.replace(/_/g, ' ')}</p>
        <p className="text-xs text-[#57534e]">{setting.type}</p>
      </div>
      <input
        value={setting.value}
        type={setting.type === 'number' ? 'number' : 'text'}
        onChange={(e) => onChange(setting.key, e.target.value)}
        className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-1.5 focus:outline-none focus:border-[#c8b89a] transition-colors"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation('admin');
  const [settings, setSettings] = useState<StoreSetting[]>(mockStoreSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await listSettings();
    if (err) setError(err.message);
    else if (data) setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleChange = (key: string, value: string) => {
    setSettings((ss) => ss.map((s) => s.key === key ? { ...s, value } : s));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error: err } = await bulkUpdateSettings(settings);
    if (err) setError(err.message);
    else setHasChanges(false);
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  // Group settings by prefix
  const groups: Record<string, StoreSetting[]> = {};
  for (const s of settings) {
    const prefix = s.key.split('_')[0] ?? 'general';
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(s);
  }

  return (
    <div className="p-6 pb-24 max-w-2xl">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">{t('settings.overline')}</p>
        <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">{t('settings.title')}</h2>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="space-y-4">
        {Object.entries(groups).map(([groupName, groupSettings]) => (
          <div key={groupName} className="bg-[#1a1a1a] border border-[#262626] rounded-lg px-5 py-2">
            <p className="text-[10px] uppercase tracking-widest text-[#57534e] py-2 border-b border-[#262626] mb-1">{groupName}</p>
            {groupSettings.map((s) => (
              <SettingInput key={s.key} setting={s} onChange={handleChange} />
            ))}
          </div>
        ))}
      </div>

      <SaveBar hasChanges={hasChanges} onSave={handleSave} onDiscard={() => { void load(); setHasChanges(false); }} saving={saving} />
    </div>
  );
}
