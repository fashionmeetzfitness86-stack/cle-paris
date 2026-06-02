import { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import Badge from '../components/Badge';
import { listAdminUsers, upsertAdminUser, deleteAdminUser } from '../services/adminUsers';
import { mockAdminUsers } from '../mockData';
import type { AdminUser } from '../types';

const PAGE_SIZE = 20;

interface FormState {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await listAdminUsers();
    if (err) setError(err.message);
    else if (data) setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const paged = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    const { error: err } = await upsertAdminUser(form);
    if (err) setError(err.message);
    else { setForm(null); void load(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    const { error: err } = await deleteAdminUser(confirmId);
    if (!err) { void load(); }
    setConfirmId(null);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#57534e] mb-1">Configuration</p>
          <h2 className="text-xl font-display font-semibold text-[#e8e2d6]">Utilisateurs admin</h2>
        </div>
        <button
          onClick={() => setForm({ name: '', email: '', role: 'editor' })}
          className="text-xs bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] font-semibold px-4 py-2 rounded transition-colors"
        >
          + Inviter
        </button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState title="Aucun utilisateur admin" action={<button onClick={() => setForm({ name: '', email: '', role: 'editor' })} className="text-xs text-[#c8b89a] border border-[#c8b89a]/30 px-4 py-2 rounded hover:bg-[#c8b89a]/10 transition-colors">Inviter le premier admin</button>} />
      ) : (
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626]">
                {['Nom', 'E-mail', 'Rôle', 'Dernière connexion', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#57534e] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((user) => (
                <tr key={user.id} className="border-b border-[#262626] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-[#e8e2d6]">{user.name}</td>
                  <td className="px-4 py-3 text-[#a8a29e]">{user.email}</td>
                  <td className="px-4 py-3"><Badge variant={user.role} /></td>
                  <td className="px-4 py-3 text-[#57534e] text-xs">{user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => setForm({ id: user.id, name: user.name, email: user.email, role: user.role })} className="text-xs text-[#57534e] hover:text-[#a8a29e] transition-colors">Modifier</button>
                      <button onClick={() => setConfirmId(user.id)} className="text-xs text-[#57534e] hover:text-[#f87171] transition-colors">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={users.length} onPageChange={setPage} />
        </div>
      )}

      {/* Form modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setForm(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[#e8e2d6] font-display font-semibold mb-4">{form.id ? 'Modifier' : 'Inviter'} un utilisateur</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="user-name" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Nom</label>
                <input id="user-name" value={form.name} onChange={(e) => setForm((f) => f ? { ...f, name: e.target.value } : null)} className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors" />
              </div>
              <div>
                <label htmlFor="user-email" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">E-mail</label>
                <input id="user-email" type="email" value={form.email} onChange={(e) => setForm((f) => f ? { ...f, email: e.target.value } : null)} className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors" />
              </div>
              <div>
                <label htmlFor="user-role" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Rôle</label>
                <select id="user-role" value={form.role} onChange={(e) => setForm((f) => f ? { ...f, role: e.target.value as 'admin' | 'editor' } : null)} className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2 focus:outline-none focus:border-[#c8b89a] transition-colors">
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setForm(null)} className="px-4 py-2 text-sm text-[#a8a29e] border border-[#262626] rounded hover:border-[#57534e] transition-colors">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-[#c8b89a] text-[#0f0f0f] font-semibold rounded hover:bg-[#b8a88a] transition-colors disabled:opacity-60">
                {saving ? '…' : form.id ? 'Sauvegarder' : 'Inviter'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmId}
        title="Supprimer l'utilisateur"
        message="Cet utilisateur perdra immédiatement l'accès à l'administration."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
        danger
      />
    </div>
  );
}
