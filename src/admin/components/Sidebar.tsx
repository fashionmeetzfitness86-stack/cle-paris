import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navGroups = [
  {
    title: 'nav.groupShop',
    items: [
      {
        label: 'nav.products',
        path: '/admin/products',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
        ),
      },
      {
        label: 'nav.categories',
        path: '/admin/categories',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M2 3h5v5H2zM9 3h5v5H9zM2 9h12v4H2z" />
          </svg>
        ),
      },
      {
        label: 'nav.collections',
        path: '/admin/collections',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M1 2h14v3H1zM1 7h14v3H1zM1 12h14v2H1z" />
          </svg>
        ),
      },
      {
        label: 'nav.media',
        path: '/admin/media',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <rect x="1" y="1" width="14" height="10" rx="1" />
            <circle cx="11" cy="4.5" r="2" fill="#0f0f0f" />
            <path d="M1 8l3-3 4 4 2-2 5 4" fill="none" stroke="#0f0f0f" strokeWidth="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'nav.groupContent',
    items: [
      {
        label: 'nav.homepage',
        path: '/admin/homepage',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2z" />
          </svg>
        ),
      },
      {
        label: 'nav.banner',
        path: '/admin/banner',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <rect x="1" y="5" width="14" height="6" rx="1" />
          </svg>
        ),
      },
      {
        label: 'nav.blog',
        path: '/admin/blog',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M2 2h12v2H2zM2 6h8v2H2zM2 10h10v2H2zM2 14h6v1H2z" />
          </svg>
        ),
      },
      {
        label: 'nav.testimonials',
        path: '/admin/testimonials',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M8 1l2 4 4.5.7-3.25 3.15.77 4.47L8 11.4l-4.02 2.12.77-4.47L1.5 5.7 6 5z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'nav.groupCommerce',
    items: [
      {
        label: 'nav.orders',
        path: '/admin/orders',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M2 1h12l-2 9H4L2 1zM5 12a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM11 12a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
          </svg>
        ),
      },
      {
        label: 'nav.customers',
        path: '/admin/customers',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <circle cx="8" cy="5" r="3" />
            <path d="M1 14s.5-5 7-5 7 5 7 5H1z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'nav.groupSettings',
    items: [
      {
        label: 'nav.seo',
        path: '/admin/seo',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        label: 'nav.legal',
        path: '/admin/legal',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M3 1h10v14H3zM5 5h6v1H5zM5 7h6v1H5zM5 9h4v1H5z" />
          </svg>
        ),
      },
      {
        label: 'nav.i18n',
        path: '/admin/i18n',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M1 3h8v2H1zM1 7h6v2H1zM7 9l4-8h1l4 8h-1.5l-.8-1.8H9.3L8.5 9H7zm2.8-3h2.4L11 3.5 9.8 6z" />
          </svg>
        ),
      },
      {
        label: 'nav.settingsLabel',
        path: '/admin/settings',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M8 5a3 3 0 100 6A3 3 0 008 5zm0 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM6.5 1h3l.5 2.5a5 5 0 011.7 1L14 3.5l2.1 3.6-2 1.5a5 5 0 010 1.8l2 1.5L14 15.5 11.7 15a5 5 0 01-1.7 1L9.5 18.5h-3L6 16.5a5 5 0 01-1.7-1L2 15.5-.1 11.9l2-1.5a5 5 0 010-1.8l-2-1.5L2 3.5 4.3 4a5 5 0 011.7-1L6.5 1z" />
          </svg>
        ),
      },
      {
        label: 'nav.users',
        path: '/admin/users',
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <circle cx="6" cy="5" r="2.5" />
            <path d="M1 13s.3-4 5-4 5 4 5 4H1z" />
            <path d="M12 7v6M9 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('admin');

  const handleLogout = () => {
    localStorage.removeItem('cle-admin-auth');
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#262626] min-h-[56px]">
        {!collapsed && (
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#e8e2d6] font-display font-semibold">
            {t('nav.brand')}
          </span>
        )}
        <button
          onClick={onToggle}
          className="w-6 h-6 flex items-center justify-center text-[#57534e] hover:text-[#a8a29e] transition-colors duration-200 ml-auto"
          aria-label={t('nav.toggleSidebar')}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            {collapsed ? (
              <path d="M2 4h12v1.5H2zM2 7.25h12v1.5H2zM2 10.5h12v1.5H2z" />
            ) : (
              <path d="M2 4h12v1.5H2zM2 7.25h12v1.5H2zM2 10.5h12v1.5H2z" />
            )}
          </svg>
        </button>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="px-4 pb-1.5 text-[9px] uppercase tracking-[0.25em] text-[#57534e] font-medium">
                {t(group.title)}
              </p>
            )}
            {collapsed && <div className="border-t border-[#262626] mx-3 mb-2" />}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 relative group ${
                        isActive
                          ? 'text-[#e8e2d6] border-l-2 border-[#c8b89a] bg-white/[0.03]'
                          : 'text-[#57534e] border-l-2 border-transparent hover:text-[#a8a29e] hover:bg-white/[0.02]'
                      } ${collapsed ? 'justify-center' : ''}`
                    }
                    title={collapsed ? t(item.label) : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span>{t(item.label)}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-[#262626] py-3 space-y-0.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-4 py-2 text-sm text-[#57534e] hover:text-[#a8a29e] transition-colors duration-200 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? t('nav.viewShop') : undefined}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 flex-shrink-0">
            <path d="M9 2h5v5h-1.5V4.5L6.5 10.5l-1-1L11.5 3.5H9V2zM3 4h3v1.5H4.5v7h7V11H13v2.5H3V4z" />
          </svg>
          {!collapsed && <span>{t('nav.viewShop')}</span>}
        </a>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-[#57534e] hover:text-[#f87171] transition-colors duration-200 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? t('nav.logout') : undefined}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 flex-shrink-0">
            <path d="M6 2H2v12h4v-1.5H3.5V3.5H6V2zM11 4.5l3.5 3.5-3.5 3.5-1-1 1.8-1.8H6.5V7.25h5.25L9.98 5.5l1.02-1z" />
          </svg>
          {!collapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — smooth width transition */}
      <aside
        className={`hidden md:flex flex-col bg-[#141414] border-r border-[#262626] h-screen sticky top-0 flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay — CSS transition, always rendered */}
      <div
        className={`md:hidden fixed inset-0 z-50 flex transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onMobileClose}
        />
        <aside
          className={`relative w-60 bg-[#141414] border-r border-[#262626] h-full flex flex-col z-10 transition-transform duration-300 ease-in-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
