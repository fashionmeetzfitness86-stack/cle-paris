import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#0f0f0f] overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {/* Page entrance animation — re-triggers on route change */}
          <div
            key={location.pathname}
            style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
