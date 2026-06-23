import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import { listOrders, countOrders, revenueThisMonth } from '../services/orders';
import { countCustomers } from '../services/customers';
import { listActivity } from '../services/activity';
import type { ActivityEntry } from '../services/activity';
import { listProducts } from '../services/products';
import type { Order } from '../types';

export default function DashboardPage() {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'fr-FR';
  // Start empty/zero — never seed real-looking numbers from mock data.
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, productsRes, orders5Res] = await Promise.all([
        countOrders(),
        listProducts(),
        listOrders({ from: 0, to: 4 }),
      ]);
      const [rev, custCount, actEntries] = await Promise.all([
        revenueThisMonth(),
        countCustomers(),
        listActivity(10),
      ]);

      setOrderCount(ordersRes);
      if (productsRes.data) setProductCount(productsRes.data.filter((p) => !p.is_archived).length);
      if (orders5Res.data) setRecentOrders(orders5Res.data);
      setRevenue(rev);
      setCustomerCount(custCount);
      setActivity(actEntries);
    } catch (e) {
      // Surface the failure instead of masking it with believable fake KPIs.
      setError(e instanceof Error ? e.message : t('dashboard.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="p-6 space-y-8">
      {/* Page header */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">{t('dashboard.overline')}</p>
        <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">{t('dashboard.title')}</h2>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {loading && <LoadingSpinner />}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.statOrders')}
          value={orderCount}
          delta={t('dashboard.statOrdersDelta')}
          positive
          accent
          icon={
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path d="M2 1h12l-2 9H4L2 1z" />
              <circle cx="5" cy="12.5" r="1.5" />
              <circle cx="11" cy="12.5" r="1.5" />
            </svg>
          }
        />
        <StatCard
          label={t('dashboard.statRevenue')}
          value={`€${revenue.toLocaleString(locale)}`}
          icon={
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm1 10H7V8H5.5V6.5L8 4l2.5 2.5H9V11z" />
            </svg>
          }
        />
        <StatCard
          label={t('dashboard.statProducts')}
          value={productCount}
          icon={
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          }
        />
        <StatCard
          label={t('dashboard.statCustomers')}
          value={customerCount}
          positive
          icon={
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <circle cx="8" cy="5" r="3" />
              <path d="M1 14s.5-5 7-5 7 5 7 5H1z" />
            </svg>
          }
        />
      </div>

      {/* Recent orders */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626]">
          <div>
            <h3 className="text-sm font-display font-semibold text-[#e8e2d6]">{t('dashboard.recentOrders')}</h3>
            <p className="text-xs text-[#57534e] mt-0.5">{t('dashboard.recentOrdersSub')}</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-[10px] uppercase tracking-widest text-[#c8b89a] hover:text-[#e8e2d6] transition-colors"
          >
            {t('common.viewAll')}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                {[t('dashboard.col.order'), t('dashboard.col.customer'), t('dashboard.col.date'), t('dashboard.col.status'), t('dashboard.col.total')].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-widest text-[#57534e]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-[#1f1f1f] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="text-sm text-[#c8b89a] hover:text-[#e8e2d6] transition-colors font-mono">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#a8a29e]">{order.customer_email}</td>
                  <td className="px-5 py-3 text-sm text-[#57534e]">
                    {new Date(order.created_at).toLocaleDateString(locale)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={order.status} />
                  </td>
                  <td className="px-5 py-3 text-sm text-[#e8e2d6] font-medium">
                    €{order.total.toLocaleString(locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Feed */}
      {activity.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#262626]">
            <h3 className="text-sm font-display font-semibold text-[#e8e2d6]">{t('dashboard.activity')}</h3>
            <p className="text-xs text-[#57534e] mt-0.5">{t('dashboard.activitySub')}</p>
          </div>
          <ul className="divide-y divide-[#1f1f1f]">
            {activity.map((entry) => (
              <li key={entry.id} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#c8b89a] bg-[#c8b89a]/10 border border-[#c8b89a]/20 rounded px-1.5 py-0.5">
                    {entry.entity_type}
                  </span>
                  <span className="text-sm text-[#a8a29e]">{entry.action}</span>
                </div>
                <span className="text-xs text-[#57534e] whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/products"
          className="group bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 hover:border-[#333] transition-all duration-200 flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-[#262626] rounded-lg flex items-center justify-center text-[#c8b89a] group-hover:bg-[#c8b89a]/10 transition-colors">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e8e2d6]">{t('dashboard.manageProducts')}</p>
            <p className="text-xs text-[#57534e] mt-0.5">{t('dashboard.manageProductsSub', { count: productCount })}</p>
          </div>
        </Link>
        <Link
          to="/admin/media"
          className="group bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 hover:border-[#333] transition-all duration-200 flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-[#262626] rounded-lg flex items-center justify-center text-[#c8b89a] group-hover:bg-[#c8b89a]/10 transition-colors">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">
              <rect x="1" y="1" width="14" height="10" rx="1" />
              <circle cx="11" cy="4" r="2" fill="#1a1a1a" />
              <path d="M1 8l3-3 4 4 2-2 5 4" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e8e2d6]">{t('dashboard.mediaLibrary')}</p>
            <p className="text-xs text-[#57534e] mt-0.5">{t('dashboard.mediaLibrarySub')}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
