import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMobileMenuOpen: () => void;
}

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Produits',
  '/admin/products/new': 'Nouveau produit',
  '/admin/categories': 'Catégories',
  '/admin/collections': 'Collections',
  '/admin/media': 'Médias',
  '/admin/homepage': 'Homepage',
  '/admin/banner': 'Bannière',
  '/admin/blog': 'Blog',
  '/admin/blog/new': 'Nouveau post',
  '/admin/testimonials': 'Avis clients',
  '/admin/seo': 'SEO',
  '/admin/legal': 'Mentions légales',
  '/admin/i18n': 'Traductions',
  '/admin/settings': 'Paramètres',
  '/admin/users': 'Utilisateurs',
  '/admin/orders': 'Commandes',
  '/admin/customers': 'Clients',
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/products/') && pathname !== '/admin/products/new') {
    return 'Modifier le produit';
  }
  if (pathname.startsWith('/admin/orders/')) return 'Détail commande';
  if (pathname.startsWith('/admin/blog/') && pathname !== '/admin/blog/new') return 'Modifier le post';
  return breadcrumbMap[pathname] ?? 'Admin';
}

export default function Topbar({ onMobileMenuOpen }: TopbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userEmail = localStorage.getItem('cle-admin-email') ?? 'admin@cleparis.store';
  const userInitial = userEmail.charAt(0).toUpperCase();
  const pageTitle = getPageTitle(pathname);

  const handleLogout = () => {
    localStorage.removeItem('cle-admin-auth');
    localStorage.removeItem('cle-admin-email');
    navigate('/admin/login');
  };

  return (
    <header className="bg-[#141414] border-b border-[#262626] px-4 h-14 flex items-center justify-between sticky top-0 z-20">
      {/* Left: mobile hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center text-[#57534e] hover:text-[#a8a29e] transition-colors"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M2 4h12v1.5H2zM2 7.25h12v1.5H2zM2 10.5h12v1.5H2z" />
          </svg>
        </button>
        <h1 className="text-sm font-display font-semibold text-[#e8e2d6] tracking-tight">{pageTitle}</h1>
      </div>

      {/* Right: user menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-expanded={userMenuOpen}
        >
          <div className="w-7 h-7 rounded-full bg-[#c8b89a]/20 border border-[#c8b89a]/30 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-[#c8b89a]">{userInitial}</span>
          </div>
          <span className="hidden sm:block text-xs text-[#57534e] max-w-[160px] truncate">{userEmail}</span>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-[#57534e]">
            <path d="M8 10.5L3 5.5h10z" />
          </svg>
        </button>

        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1a1a] border border-[#262626] rounded-lg shadow-2xl z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#262626]">
                <p className="text-xs text-[#a8a29e] truncate">{userEmail}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-[#57534e] hover:text-[#f87171] hover:bg-white/[0.02] transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
