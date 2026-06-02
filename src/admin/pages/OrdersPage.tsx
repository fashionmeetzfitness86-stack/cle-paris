import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { listOrders } from '../services/orders';
import { mockOrders } from '../mockData';
import type { Order, OrderStatus } from '../types';

const PAGE_SIZE = 20;

const STATUS_FILTERS: { value: 'all' | OrderStatus; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payées' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'refunded', label: 'Remboursées' },
  { value: 'cancelled', label: 'Annulées' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [total, setTotal] = useState<number>(mockOrders.length);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: svcErr } = await listOrders({
        from: page * PAGE_SIZE,
        to: page * PAGE_SIZE + PAGE_SIZE - 1,
        status: filter,
        search: debouncedSearch || undefined,
      });
      if (svcErr) { setError(svcErr.message); return; }
      if (data) {
        setOrders(data);
        setTotal(data.length < PAGE_SIZE ? page * PAGE_SIZE + data.length : page * PAGE_SIZE + PAGE_SIZE + 1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, filter, debouncedSearch]);

  useEffect(() => {
    setPage(0);
  }, [filter, debouncedSearch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Commerce</p>
        <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">Commandes</h2>
        <p className="text-sm text-[#57534e] mt-0.5">{total} commande{total !== 1 ? 's' : ''}</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1 bg-[#1a1a1a] border border-[#262626] rounded p-1 w-fit">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${
                filter === f.value ? 'bg-[#262626] text-[#e8e2d6]' : 'text-[#57534e] hover:text-[#a8a29e]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#57534e]" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par e-mail ou numéro…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm pl-9 pr-3 py-2 placeholder-[#57534e] focus:outline-none focus:border-[#c8b89a] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <EmptyState
            title="Aucune commande trouvée"
            description="Essayez de modifier vos filtres de recherche."
          />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#262626]">
                  {['Commande', 'Client', 'Date', 'Statut', 'Total', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#57534e]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#1f1f1f] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#c8b89a] font-mono">{order.order_number}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#a8a29e]">{order.customer_email}</td>
                    <td className="px-4 py-3 text-sm text-[#57534e]">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#e8e2d6] font-medium">
                      €{order.total.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-xs text-[#57534e] hover:text-[#c8b89a] transition-colors px-2 py-1 border border-[#262626] rounded hover:border-[#c8b89a]/30"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
