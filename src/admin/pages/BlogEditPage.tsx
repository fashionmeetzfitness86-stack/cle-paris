import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import Toggle from '../components/Toggle';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import SaveBar from '../components/SaveBar';
import { getBlogPost, upsertBlogPost } from '../services/blog';
import { mockBlogPosts } from '../mockData';
import type { BlogPost } from '../types';

const langs = ['fr', 'en'] as const;



export default function BlogEditPage() {
  const { t, i18n } = useTranslation('admin');
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'fr-FR';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const existing = isNew ? null : mockBlogPosts.find((p) => p.id === id);

  const [form, setForm] = useState<Omit<BlogPost, 'id' | 'created_at'>>({
    slug: existing?.slug ?? '',
    title_fr: existing?.title_fr ?? '',
    title_en: existing?.title_en ?? '',
    body_fr: existing?.body_fr ?? '',
    body_en: existing?.body_en ?? '',
    cover_image: existing?.cover_image ?? '',
    is_published: existing?.is_published ?? false,
    published_at: existing?.published_at ?? null,
  });
  const [originalForm, setOriginalForm] = useState<Omit<BlogPost, 'id' | 'created_at'>>(form);
  const [bodyLang, setBodyLang] = useState<'fr' | 'en'>('fr');
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  const loadPost = useCallback(async () => {
    if (isNew || !id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: svcErr } = await getBlogPost(id);
      if (svcErr) { setError(svcErr.message); return; }
      if (data) {
        const loaded: Omit<BlogPost, 'id' | 'created_at'> = {
          slug: data.slug,
          title_fr: data.title_fr,
          title_en: data.title_en,
          body_fr: data.body_fr,
          body_en: data.body_en,
          cover_image: data.cover_image,
          is_published: data.is_published,
          published_at: data.published_at,
        };
        setForm(loaded);
        setOriginalForm(loaded);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.loadError'));
    } finally {
      setLoading(false);
    }
  }, [id, isNew, t]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = isNew ? form : { ...form, id };
      const { data, error: svcErr } = await upsertBlogPost(payload);
      if (svcErr) { setError(svcErr.message); return; }
      if (data) {
        setOriginalForm(form);
        navigate('/admin/blog');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(originalForm);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/blog" className="text-[#57534e] hover:text-[#a8a29e] transition-colors">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M10 3L4 8l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </Link>
        <div>
          <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">
            {isNew ? t('blog.editNewTitle') : t('blog.editTitle', { name: form.title_fr || '…' })}
          </h2>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="space-y-5">
        {/* Meta */}
        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('blog.sectionMeta')}</h3>
          <FormField id="blog-slug" label={t('blog.slug')} required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: (e.target as HTMLInputElement).value }))} />
          <div className="grid grid-cols-2 gap-4">
            <FormField id="blog-title-fr" label={t('blog.titleFr')} value={form.title_fr} onChange={(e) => setForm((f) => ({ ...f, title_fr: (e.target as HTMLInputElement).value }))} />
            <FormField id="blog-title-en" label={t('blog.titleEn')} value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: (e.target as HTMLInputElement).value }))} />
          </div>
          <FormField id="blog-cover" label={t('blog.coverImage')} value={form.cover_image} onChange={(e) => setForm((f) => ({ ...f, cover_image: (e.target as HTMLInputElement).value }))} />
          {form.cover_image && (
            <div className="aspect-video w-full max-w-sm bg-[#111] rounded overflow-hidden">
              <img src={form.cover_image} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
        </section>

        {/* Body */}
        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('blog.sectionContent')}</h3>
            <div className="flex gap-1 bg-[#111] border border-[#262626] rounded p-0.5">
              {langs.map((l) => (
                <button key={l} onClick={() => setBodyLang(l)} className={`px-3 py-0.5 text-xs rounded transition-colors ${bodyLang === l ? 'bg-[#262626] text-[#e8e2d6]' : 'text-[#57534e]'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <FormField
            as="textarea"
            id="blog-body"
            label={t('blog.bodyLang', { lang: bodyLang.toUpperCase() })}
            rows={12}
            value={bodyLang === 'fr' ? form.body_fr : form.body_en}
            onChange={(e) => {
              const v = (e.target as HTMLTextAreaElement).value;
              setForm((f) => bodyLang === 'fr' ? { ...f, body_fr: v } : { ...f, body_en: v });
            }}
          />
        </section>

        {/* Publish */}
        <section className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#57534e]">{t('blog.sectionPublish')}</h3>
          <Toggle
            id="blog-published"
            checked={form.is_published}
            onChange={(v) => setForm((f) => ({ ...f, is_published: v, published_at: v ? new Date().toISOString() : null }))}
            label={t('blog.togglePublished')}
            description={t('blog.togglePublishedDesc')}
          />
          {form.published_at && (
            <p className="text-xs text-[#57534e]">
              {t('blog.publishedOn', { date: new Date(form.published_at).toLocaleDateString(dateLocale) })}
            </p>
          )}
        </section>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-sm font-semibold px-6 py-2.5 rounded transition-colors disabled:opacity-60"
          >
            {saving ? t('common.saving') : t('common.save')}
          </button>
          <Link to="/admin/blog" className="text-sm text-[#57534e] hover:text-[#a8a29e] px-6 py-2.5 border border-[#262626] rounded hover:border-[#57534e] transition-colors">
            {t('common.cancel')}
          </Link>
        </div>
      </div>

      <SaveBar
        hasChanges={hasChanges}
        onSave={handleSave}
        onDiscard={handleDiscard}
        saving={saving}
      />
    </div>
  );
}
