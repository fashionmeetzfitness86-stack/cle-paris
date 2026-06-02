import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { listProducts, deleteProduct } from '../services/products';
import { mockProducts } from '../mockData';
import type { Product } from '../types';

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [total, setTotal] = useState<number>(mockProducts.length);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: svcErr } = await listProducts({
        from: page * PAGE_SIZE,
        to: page * PAGE_SIZE + PAGE_SIZE - 1,
        search: debouncedSearch || undefined,
      });
      if (svcErr) { setError(svcErr.message); return; }
      if (data) {
        // Apply archived filter client-side (service doesn't filter by archived)
        const filtered = filter === 'all' ? data : filter === 'archived'
          ? data.filter((p) => p.is_archived)
          : data.filter((p) => !p.is_archived);
        setProducts(filtered);
        setTotal(filtered.length < PAGE_SIZE ? page * PAGE_SIZE + filtered.length : page * PAGE_SIZE + PAGE_SIZE + 1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filter]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, filter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error: svcErr } = await deleteProduct(deleteTarget.id);
      if (svcErr) { setError(svcErr.message); return; }
      setDeleteTarget(null);
      await loadProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Boutique</p>
          <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">Produits</h2>
          <p className="text-sm text-[#57534e] mt-0.5">{total} produit{total !== 1 ? 's' : ''} au total</p>
        </div>
        <Link
          to="/admin/products/new"
          id="new-product-btn"
          className="flex items-center gap-2 bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-xs font-semibold px-4 py-2 rounded transition-colors duration-200"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Nouveau produit
        </Link>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#57534e]" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un produit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm pl-9 pr-3 py-2 placeholder-[#57534e] focus:outline-none focus:border-[#c8b89a] transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-[#1a1a1a] border border-[#262626] rounded p-1">
          {(['all', 'active', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${
                filter === f ? 'bg-[#262626] text-[#e8e2d6]' : 'text-[#57534e] hover:text-[#a8a29e]'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Archivés'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <EmptyState
            title="Aucun produit trouvé"
            description="Essayez de modifier vos filtres ou créez un nouveau produit."
            action={
              <Link to="/admin/products/new" className="text-xs text-[#c8b89a] hover:text-[#e8e2d6] transition-colors">
                + Nouveau produit
              </Link>
            }
          />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#262626]">
                  {['Produit', 'Prix', 'Statut', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#57534e]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-[#1f1f1f] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="text-sm text-[#e8e2d6] font-medium hover:text-[#c8b89a] transition-colors"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-[#57534e] font-mono mt-0.5">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-[#e8e2d6]">€{product.price}</p>
                      {product.compare_at_price && (
                        <p className="text-xs text-[#57534e] line-through mt-0.5">€{product.compare_at_price}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.is_archived ? 'archived' : 'active'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="text-xs text-[#57534e] hover:text-[#c8b89a] transition-colors px-2 py-1 border border-[#262626] rounded hover:border-[#c8b89a]/30"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="text-xs text-[#57534e] hover:text-[#f87171] transition-colors px-2 py-1 border border-[#262626] rounded hover:border-[#f87171]/30"
                        >
                          Suppr.
                        </button>
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
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
