import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import SaveBar from '../components/SaveBar';
import { getShipping, updateShipping, type ShippingSettings } from '../services/shipping';
import { COUNTRIES } from '../../lib/countries';

export default function ShippingPage() {
  const { t, i18n } = useTranslation('admin');
  const lang = i18n.language?.startsWith('en') ? 'en' : 'fr';

  const [form, setForm] = useState<ShippingSettings>({
    national_countries: ['FR'],
    national_price: 0,
    international_price: 0,
    free_shipping_threshold: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [freeEnabled, setFreeEnabled] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await getShipping();
    if (err) setError(err.message);
    else if (data) {
      setForm(data);
      setFreeEnabled(data.free_shipping_threshold != null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggleCountry = (code: string) => {
    setForm((f) => {
      const has = f.national_countries.includes(code);
      return {
        ...f,
        national_countries: has
          ? f.national_countries.filter((c) => c !== code)
          : [...f.national_countries, code],
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const payload: ShippingSettings = {
      ...form,
      free_shipping_threshold: freeEnabled ? Number(form.free_shipping_threshold ?? 0) : null,
    };
    const { error: err } = await updateShipping(payload);
    if (err) setError(err.message);
    else setHasChanges(false);
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6 max-w-3xl pb-24">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">{t('shipping.overline')}</p>
        <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">{t('shipping.title')}</h2>
        <p className="text-sm text-[#57534e] mt-0.5">{t('shipping.subtitle')}</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* National zone */}
      <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('shipping.nationalZone')}</h3>
          <p className="text-xs text-[#57534e] mt-1">{t('shipping.nationalZoneHint')}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COUNTRIES.map((c) => {
            const on = form.national_countries.includes(c.code);
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => toggleCountry(c.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded border text-sm text-left transition-colors ${
                  on
                    ? 'border-[#c8b89a] bg-[#c8b89a]/10 text-[#e8e2d6]'
                    : 'border-[#262626] text-[#57534e] hover:border-[#3a3a3a]'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-sm border flex-shrink-0 ${on ? 'bg-[#c8b89a] border-[#c8b89a]' : 'border-[#57534e]'}`} />
                {c[lang]}
              </button>
            );
          })}
        </div>
      </section>

      {/* Prices */}
      <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('shipping.prices')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nat-price" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">{t('shipping.nationalPrice')}</label>
            <input
              id="nat-price" type="number" min="0" step="0.01" value={form.national_price}
              onChange={(e) => { setForm((f) => ({ ...f, national_price: parseFloat(e.target.value) || 0 })); setHasChanges(true); }}
              className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="int-price" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">{t('shipping.internationalPrice')}</label>
            <input
              id="int-price" type="number" min="0" step="0.01" value={form.international_price}
              onChange={(e) => { setForm((f) => ({ ...f, international_price: parseFloat(e.target.value) || 0 })); setHasChanges(true); }}
              className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Free shipping threshold */}
      <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('shipping.freeShipping')}</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox" checked={freeEnabled}
            onChange={(e) => { setFreeEnabled(e.target.checked); setHasChanges(true); }}
            className="accent-[#c8b89a] w-4 h-4"
          />
          <span className="text-sm text-[#a8a29e]">{t('shipping.freeEnable')}</span>
        </label>
        {freeEnabled && (
          <div>
            <label htmlFor="free-thr" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">{t('shipping.freeThreshold')}</label>
            <input
              id="free-thr" type="number" min="0" step="0.01" value={form.free_shipping_threshold ?? 0}
              onChange={(e) => { setForm((f) => ({ ...f, free_shipping_threshold: parseFloat(e.target.value) || 0 })); setHasChanges(true); }}
              className="w-full max-w-[200px] bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors"
            />
          </div>
        )}
      </section>

      <SaveBar hasChanges={hasChanges} onSave={handleSave} onDiscard={load} saving={saving} />
    </div>
  );
}
