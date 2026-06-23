import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Toggle from '../components/Toggle';
import FormField from '../components/FormField';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import { listTestimonials, upsertTestimonial, deleteTestimonial } from '../services/testimonials';
import { mockTestimonials } from '../mockData';
import type { Testimonial } from '../types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`w-3 h-3 ${n <= rating ? 'text-[#fbbf24]' : 'text-[#262626]'}`}
        >
          <path d="M8 1l2 4 4.5.7-3.25 3.15.77 4.47L8 11.4l-4.02 2.12.77-4.47L1.5 5.7 6 5z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialModal({
  testimonial,
  onSave,
  onClose,
}: {
  testimonial: Partial<Testimonial> | null;
  onSave: (tm: Omit<Testimonial, 'id'> & { id?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useTranslation('admin');
  const [form, setForm] = useState<Partial<Testimonial>>(
    testimonial ?? { author: '', role: '', quote_fr: '', quote_en: '', rating: 5, is_visible: true }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.author || !form.quote_fr) return;
    setSaving(true);
    await onSave({
      id: (testimonial as Testimonial)?.id,
      author: form.author ?? '',
      role: form.role ?? '',
      quote_fr: form.quote_fr ?? '',
      quote_en: form.quote_en ?? '',
      rating: form.rating ?? 5,
      is_visible: form.is_visible ?? true,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[#e8e2d6] font-display font-semibold text-base mb-4">
          {(testimonial as Testimonial)?.id ? t('testimonials.editTitle') : t('testimonials.addTitle')}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField id="test-author" label={t('testimonials.author')} required value={form.author ?? ''} onChange={(e) => setForm((f) => ({ ...f, author: (e.target as HTMLInputElement).value }))} />
            <FormField id="test-role" label={t('testimonials.role')} value={form.role ?? ''} onChange={(e) => setForm((f) => ({ ...f, role: (e.target as HTMLInputElement).value }))} />
          </div>
          <FormField as="textarea" id="test-quote-fr" label={t('testimonials.quoteFr')} required rows={3} value={form.quote_fr ?? ''} onChange={(e) => setForm((f) => ({ ...f, quote_fr: (e.target as HTMLTextAreaElement).value }))} />
          <FormField as="textarea" id="test-quote-en" label={t('testimonials.quoteEn')} rows={3} value={form.quote_en ?? ''} onChange={(e) => setForm((f) => ({ ...f, quote_en: (e.target as HTMLTextAreaElement).value }))} />
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">{t('testimonials.rating')}</label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setForm((f) => ({ ...f, rating: n }))}
                  className="focus:outline-none"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className={`w-5 h-5 transition-colors ${n <= (form.rating ?? 5) ? 'text-[#fbbf24]' : 'text-[#262626] hover:text-[#fbbf24]/50'}`}>
                    <path d="M8 1l2 4 4.5.7-3.25 3.15.77 4.47L8 11.4l-4.02 2.12.77-4.47L1.5 5.7 6 5z" />
                  </svg>
                </button>
              ))}
              <span className="text-xs text-[#57534e] ml-1">{t('testimonials.ratingValue', { rating: form.rating })}</span>
            </div>
          </div>
          <Toggle id="test-visible" checked={form.is_visible ?? true} onChange={(v) => setForm((f) => ({ ...f, is_visible: v }))} label={t('testimonials.toggleVisible')} description={t('testimonials.toggleVisibleDesc')} />
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

export default function TestimonialsPage() {
  const { t } = useTranslation('admin');
  const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials);
  const [editTarget, setEditTarget] = useState<Testimonial | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: svcErr } = await listTestimonials();
      if (svcErr) { setError(svcErr.message); return; }
      if (data) setTestimonials(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const handleSave = async (payload: Omit<Testimonial, 'id'> & { id?: string }) => {
    try {
      const { data, error: svcErr } = await upsertTestimonial(payload);
      if (svcErr) { setError(svcErr.message); return; }
      if (data) {
        setTestimonials((prev) => {
          const exists = prev.some((item) => item.id === data.id);
          return exists ? prev.map((item) => (item.id === data.id ? data : item)) : [...prev, data];
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
      const { error: svcErr } = await deleteTestimonial(deleteTarget.id);
      if (svcErr) { setError(svcErr.message); return; }
      setTestimonials((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.deleteError'));
      setDeleteTarget(null);
    }
  };

  const handleToggleVisible = async (tm: Testimonial, v: boolean) => {
    setTestimonials((prev) => prev.map((item) => item.id === tm.id ? { ...item, is_visible: v } : item));
    try {
      await upsertTestimonial({ ...tm, is_visible: v });
    } catch {
      setTestimonials((prev) => prev.map((item) => item.id === tm.id ? { ...item, is_visible: !v } : item));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">{t('testimonials.overline')}</p>
          <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">{t('testimonials.title')}</h2>
          <p className="text-sm text-[#57534e] mt-0.5">{t('testimonials.count', { count: testimonials.length })}</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-xs font-semibold px-4 py-2 rounded transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t('testimonials.new')}
        </button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner />
      ) : testimonials.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg px-5 py-12">
          <EmptyState title={t('testimonials.emptyTitle')} description={t('testimonials.emptyDesc')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((tm) => (
            <div
              key={tm.id}
              className={`bg-[#1a1a1a] border rounded-lg p-5 transition-all ${tm.is_visible ? 'border-[#262626]' : 'border-[#1f1f1f] opacity-60'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <StarRating rating={tm.rating} />
                <Toggle
                  id={`test-vis-${tm.id}`}
                  checked={tm.is_visible}
                  onChange={(v) => handleToggleVisible(tm, v)}
                />
              </div>
              <p className="text-sm text-[#a8a29e] italic mb-3 line-clamp-3">&ldquo;{tm.quote_fr}&rdquo;</p>
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#e8e2d6]">{tm.author}</p>
                <p className="text-[10px] text-[#57534e]">{tm.role}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditTarget(tm)} className="text-xs text-[#57534e] hover:text-[#c8b89a] transition-colors px-3 py-1 border border-[#262626] rounded hover:border-[#c8b89a]/30">{t('common.edit')}</button>
                <button onClick={() => setDeleteTarget(tm)} className="text-xs text-[#57534e] hover:text-[#f87171] transition-colors px-3 py-1 border border-[#262626] rounded hover:border-[#f87171]/30">{t('common.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showNew || editTarget) && (
        <TestimonialModal
          testimonial={editTarget}
          onSave={handleSave}
          onClose={() => { setEditTarget(null); setShowNew(false); }}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={t('testimonials.deleteTitle')}
        message={t('testimonials.deleteMessage', { name: deleteTarget?.author })}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
