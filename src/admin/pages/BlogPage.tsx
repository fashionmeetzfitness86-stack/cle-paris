import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { listBlogPosts, deleteBlogPost } from '../services/blog';
import { mockBlogPosts } from '../mockData';
import type { BlogPost } from '../types';

const PAGE_SIZE = 10;

export default function BlogPage() {
  const { t, i18n } = useTranslation('admin');
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'fr-FR';
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [total, setTotal] = useState<number>(mockBlogPosts.length);
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: svcErr } = await listBlogPosts({
        from: page * PAGE_SIZE,
        to: page * PAGE_SIZE + PAGE_SIZE - 1,
      });
      if (svcErr) { setError(svcErr.message); return; }
      if (data) {
        setPosts(data);
        setTotal(data.length < PAGE_SIZE ? page * PAGE_SIZE + data.length : page * PAGE_SIZE + PAGE_SIZE + 1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.loadError'));
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error: svcErr } = await deleteBlogPost(deleteTarget.id);
      if (svcErr) { setError(svcErr.message); return; }
      setDeleteTarget(null);
      await loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.deleteError'));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">{t('blog.overline')}</p>
          <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">{t('blog.title')}</h2>
          <p className="text-sm text-[#57534e] mt-0.5">{t('blog.count', { count: total })}</p>
        </div>
        <Link
          to="/admin/blog/new"
          className="flex items-center gap-2 bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-xs font-semibold px-4 py-2 rounded transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t('blog.new')}
        </Link>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <EmptyState
            title={t('blog.emptyTitle')}
            description={t('blog.emptyDesc')}
            action={
              <Link to="/admin/blog/new" className="text-xs text-[#c8b89a] hover:text-[#e8e2d6] transition-colors">
                {t('blog.emptyAction')}
              </Link>
            }
          />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#262626]">
                  {[t('blog.col.title'), t('blog.col.status'), t('blog.col.publishedAt'), t('blog.col.actions')].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#57534e]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-[#1f1f1f] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {post.cover_image && (
                          <div className="w-10 h-10 bg-[#262626] rounded overflow-hidden flex-shrink-0">
                            <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-[#e8e2d6]">{post.title_fr}</p>
                          <p className="text-xs text-[#57534e] font-mono mt-0.5">{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={post.is_published ? 'published' : 'draft'} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#57534e]">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString(dateLocale) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/admin/blog/${post.id}`} className="text-xs text-[#57534e] hover:text-[#c8b89a] transition-colors px-2 py-1 border border-[#262626] rounded hover:border-[#c8b89a]/30">{t('common.edit')}</Link>
                        <button onClick={() => setDeleteTarget(post)} className="text-xs text-[#57534e] hover:text-[#f87171] transition-colors px-2 py-1 border border-[#262626] rounded hover:border-[#f87171]/30">{t('common.deleteShort')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={t('blog.deleteTitle')}
        message={t('blog.deleteMessage', { name: deleteTarget?.title_fr })}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
