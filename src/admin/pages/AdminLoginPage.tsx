import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isMockMode } from '../../lib/supabase';
import { signIn } from '../lib/auth';
import { updateLastLogin } from '../services/adminUsers';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);

    if (isMockMode()) {
      // Dev-only mock mode — accept any credentials.
      // Never reachable in a production build (see isMockMode).
      await new Promise((r) => setTimeout(r, 600));
      localStorage.setItem('cle-admin-auth', 'true');
      localStorage.setItem('cle-admin-email', email);
      navigate(from, { replace: true });
      return;
    }

    // Real Supabase auth
    const { session, error: authError } = await signIn(email, password);

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes('invalid') || msg.includes('credentials')) {
        setError('Identifiants incorrects. Vérifiez votre e-mail et mot de passe.');
      } else if (msg.includes('rate')) {
        setError('Trop de tentatives. Réessayez dans quelques minutes.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    if (session?.user) {
      await updateLastLogin(session.user.id);
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#e8e2d6 1px, transparent 1px), linear-gradient(90deg, #e8e2d6 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-[11px] uppercase tracking-[0.4em] text-[#e8e2d6] font-display font-semibold block mb-1">
            CLÉ PARIS
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#57534e]">Administration</span>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-8">
          <h2 className="text-[#e8e2d6] font-display font-semibold text-lg mb-1">Connexion</h2>
          <p className="text-[#57534e] text-sm mb-6">Accès réservé aux administrateurs</p>

          {isMockMode() && (
            <div className="mb-4 rounded border border-[#c8b89a]/20 bg-[#c8b89a]/5 px-3 py-2 text-[10px] text-[#c8b89a] uppercase tracking-widest">
              Mode développement — Supabase non connecté
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">
                Adresse e-mail
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cleparis.store"
                autoComplete="email"
                className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2.5 placeholder-[#57534e] focus:outline-none focus:border-[#c8b89a] transition-colors duration-200"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-[10px] uppercase tracking-widest text-[#a8a29e] mb-1.5">
                Mot de passe
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-[#111] border border-[#262626] rounded text-[#e8e2d6] text-sm px-3 py-2.5 placeholder-[#57534e] focus:outline-none focus:border-[#c8b89a] transition-colors duration-200"
              />
            </div>

            {error && <p className="text-[#f87171] text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="w-full bg-[#c8b89a] hover:bg-[#b8a88a] text-[#0f0f0f] text-sm font-semibold py-2.5 rounded transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion…
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        {isMockMode() && (
          <p className="text-center mt-6 text-[10px] text-[#57534e]">
            Mode dev — Entrez n'importe quel e-mail et mot de passe.
          </p>
        )}
      </div>
    </div>
  );
}
