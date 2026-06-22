import { Fragment, useState, useEffect } from 'react';
import { listCustomers } from '../services/customers';
import ErrorBanner from '../components/ErrorBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Customer } from '../types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real customers from Supabase.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    listCustomers()
      .then(({ data, error: err }) => {
        if (!alive) return;
        if (err) setError(err.message);
        else setCustomers(data ?? []);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Commerce</p>
        <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">Clients</h2>
        <p className="text-sm text-[#57534e] mt-0.5">{customers.length} clients inscrits</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#57534e]" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher un client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm pl-9 pr-3 py-2 placeholder-[#57534e] focus:outline-none focus:border-[#c8b89a] transition-colors"
        />
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        {loading ? (
          <div className="px-5 py-12"><LoadingSpinner /></div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[#57534e] text-sm">Aucun client trouvé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                {['Nom', 'Email', 'Téléphone', 'Inscrit le', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#57534e]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <Fragment key={customer.id}>
                  <tr
                    className="border-b border-[#1f1f1f] hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === customer.id ? null : customer.id)}
                  >
                    <td className="px-4 py-3 text-sm text-[#e8e2d6] font-medium">
                      {customer.first_name} {customer.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#a8a29e]">{customer.email}</td>
                    <td className="px-4 py-3 text-sm text-[#57534e]">{customer.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-[#57534e]">
                      {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-[#57534e]">
                      <svg
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className={`w-3 h-3 transition-transform ${expanded === customer.id ? 'rotate-180' : ''}`}
                      >
                        <path d="M8 10.5L3 5.5h10z" />
                      </svg>
                    </td>
                  </tr>
                  {expanded === customer.id && (
                    <tr className="border-b border-[#1f1f1f] bg-[#111]">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">ID client</p>
                            <p className="text-xs text-[#a8a29e] font-mono">{customer.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Email</p>
                            <p className="text-xs text-[#a8a29e]">{customer.email}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Téléphone</p>
                            <p className="text-xs text-[#a8a29e]">{customer.phone || '—'}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
