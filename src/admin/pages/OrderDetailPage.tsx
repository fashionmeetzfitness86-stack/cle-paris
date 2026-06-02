import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import { getOrder, updateOrderStatus } from '../services/orders';
import { mockOrders } from '../mockData';
import type { Order, OrderStatus } from '../types';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payé' },
  { value: 'processing', label: 'Traitement' },
  { value: 'shipped', label: 'Expédié' },
  { value: 'delivered', label: 'Livré' },
  { value: 'refunded', label: 'Remboursé' },
  { value: 'cancelled', label: 'Annulé' },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const fallback = mockOrders.find((o) => o.id === id) ?? null;

  const [order, setOrder] = useState<Order | null>(fallback);
  const [status, setStatus] = useState<OrderStatus>(fallback?.status ?? 'pending');
  const [loading, setLoading] = useState(!fallback);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: svcErr } = await getOrder(id);
      if (svcErr) { setError(svcErr.message); return; }
      if (data) {
        setOrder(data);
        setStatus(data.status);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusSave = async () => {
    if (!order) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error: svcErr } = await updateOrderStatus(order.id, status);
      if (svcErr) { setError(svcErr.message); return; }
      if (data) setOrder(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-[#57534e]">Commande introuvable.</p>
        <Link to="/admin/orders" className="text-sm text-[#c8b89a] mt-2 block">← Retour aux commandes</Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 150 ? 0 : 9.9;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to="/admin/orders" className="text-[#57534e] hover:text-[#a8a29e] transition-colors mt-1">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M10 3L4 8l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-display font-semibold text-[#e8e2d6] font-mono">{order.order_number}</h2>
            <Badge variant={order.status} />
          </div>
          <p className="text-sm text-[#57534e] mt-0.5">
            {new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Order items */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#262626]">
              <h3 className="text-xs uppercase tracking-widest text-[#57534e]">Articles commandés</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#262626]">
                  {['Produit', 'Taille / Couleur', 'Qté', 'Prix'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-[10px] uppercase tracking-widest text-[#57534e]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-[#1f1f1f]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <div className="w-8 h-10 bg-[#262626] rounded overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="text-sm text-[#e8e2d6]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#a8a29e]">{item.size} / {item.colorLabel}</td>
                    <td className="px-4 py-3 text-sm text-[#a8a29e]">{item.qty}</td>
                    <td className="px-4 py-3 text-sm text-[#e8e2d6]">€{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Customer info */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h3 className="text-xs uppercase tracking-widest text-[#57534e] mb-3">Informations client</h3>
            <p className="text-sm text-[#e8e2d6] mb-1">{order.customer_email}</p>
            {order.shipping_address && (
              <div className="text-xs text-[#a8a29e] space-y-0.5 mt-2">
                <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                <p>{order.shipping_address.line1}</p>
                {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                <p>{order.shipping_address.postal_code} {order.shipping_address.city}</p>
                <p>{order.shipping_address.country}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h3 className="text-xs uppercase tracking-widest text-[#57534e] mb-3">Statut</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors mb-3"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleStatusSave}
              disabled={saving}
              className={`w-full text-xs font-semibold py-2 rounded transition-colors disabled:opacity-60 ${
                saved
                  ? 'bg-green-400/20 text-green-400 border border-green-400/20'
                  : 'bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f]'
              }`}
            >
              {saving ? 'Mise à jour…' : saved ? '✓ Mis à jour' : 'Mettre à jour'}
            </button>
          </div>

          {/* Summary */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h3 className="text-xs uppercase tracking-widest text-[#57534e] mb-3">Résumé</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#a8a29e]">Sous-total</span>
                <span className="text-[#e8e2d6]">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#a8a29e]">Livraison</span>
                <span className="text-[#e8e2d6]">{shipping === 0 ? 'Offerte' : `€${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-[#262626] pt-2 flex justify-between text-sm font-semibold">
                <span className="text-[#a8a29e]">Total</span>
                <span className="text-[#e8e2d6]">€{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
