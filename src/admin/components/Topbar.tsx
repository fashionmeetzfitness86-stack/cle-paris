import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface TopbarProps {
  onMobileMenuOpen: () => void;
}

function getPageTitleKey(pathname: string): string {
  if (pathname.startsWith('/admin/products/') && pathname !== '/admin/products/new') {
    return 'topbar.breadcrumb.productEdit';
  }
  if (pathname === '/admin/products/new') return 'topbar.breadcrumb.productNew';
  if (pathname.startsWith('/admin/orders/') && pathname !== '/admin/orders') return 'topbar.breadcrumb.orderDetail';
  if (pathname === '/admin/blog/new') return 'topbar.breadcrumb.blogNew';
  if (pathname.startsWith('/admin/blog/') && pathname !== '/admin/blog') return 'topbar.breadcrumb.blogEdit';

  const map: Record<string, string> = {
    '/admin': 'topbar.breadcrumb.dashboard',
    '/admin/products': 'topbar.breadcrumb.products',
    '/admin/categories': 'topbar.breadcrumb.categories',
    '/admin/collections': 'topbar.breadcrumb.collections',
    '/admin/media': 'topbar.breadcrumb.media',
    '/admin/homepage': 'topbar.breadcrumb.homepage',
    '/admin/banner': 'topbar.breadcrumb.banner',
    '/admin/blog': 'topbar.breadcrumb.blog',
    '/admin/testimonials': 'topbar.breadcrumb.testimonials',
    '/admin/seo': 'topbar.breadcrumb.seo',
    '/admin/legal': 'topbar.breadcrumb.legal',
    '/admin/i18n': 'topbar.breadcrumb.i18n',
    '/admin/settings': 'topbar.breadcrumb.settings',
    '/admin/users': 'topbar.breadcrumb.users',
    '/admin/orders': 'topbar.breadcrumb.orders',
    '/admin/customers': 'topbar.breadcrumb.customers',
  };
  return map[pathname] ?? 'topbar.title';
}

export default function Topbar({ onMobileMenuOpen }: TopbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('admin');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userEmail = localStorage.getItem('cle-admin-email') ?? 'admin@cleparis.store';
  const userInitial = userEmail.charAt(0).toUpperCase();
  const pageTitle = t(getPageTitleKey(pathname));
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'fr';

  const changeLanguage = (lang: 'fr' | 'en') => {
    void i18n.changeLanguage(lang);
    localStorage.setItem('cle-lang', lang);
  };

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
          aria-label={t('topbar.openNav')}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M2 4h12v1.5H2zM2 7.25h12v1.5H2zM2 10.5h12v1.5H2z" />
          </svg>
        </button>
        <h1 className="text-sm font-display font-semibold text-[#e8e2d6] tracking-tight">{pageTitle}</h1>
      </div>

      {/* Right: language toggle + user menu */}
      <div className="flex items-center gap-4">
        {/* Language toggle */}
        <div className="flex items-center gap-0.5 bg-[#1a1a1a] border border-[#262626] rounded p-0.5" aria-label={t('topbar.language')}>
          {(['fr', 'en'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              aria-pressed={currentLang === lang}
              className={`px-2 py-0.5 text-[11px] uppercase tracking-widest rounded transition-colors ${
                currentLang === lang
                  ? 'bg-[#c8b89a] text-[#0f0f0f] font-semibold'
                  : 'text-[#a8a29e] hover:text-[#e8e2d6]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

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
                    {t('topbar.logout')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
