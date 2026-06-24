import { type ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductEditPage from './pages/ProductEditPage';
import CategoriesPage from './pages/CategoriesPage';
import CollectionsPage from './pages/CollectionsPage';
import MediaPage from './pages/MediaPage';
import HomepageEditorPage from './pages/HomepageEditorPage';
import BannerEditorPage from './pages/BannerEditorPage';
import BlogPage from './pages/BlogPage';
import BlogEditPage from './pages/BlogEditPage';
import TestimonialsPage from './pages/TestimonialsPage';
import SeoPage from './pages/SeoPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CustomersPage from './pages/CustomersPage';
import LegalEditorPage from './pages/LegalEditorPage';
import I18nEditorPage from './pages/I18nEditorPage';
import SettingsPage from './pages/SettingsPage';
import ShippingPage from './pages/ShippingPage';
import AdminUsersPage from './pages/AdminUsersPage';
import { isSupabaseConfigured, isMockMode } from '../lib/supabase';

// ─── Auth guard ───────────────────────────────────────────────
function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <svg className="w-6 h-6 animate-spin text-[#c8b89a]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // In dev-only mock mode, fall back to localStorage.
  // In production this is always false (isMockMode), so auth requires a real session.
  const isMockAuth = isMockMode() && localStorage.getItem('cle-admin-auth') === 'true';
  const isAuthed = isSupabaseConfigured() ? !!session : isMockAuth;

  if (!isAuthed) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// ─── Role guard ───────────────────────────────────────────────
function RequireRole({ role, children }: { role: 'admin'; children: ReactNode }) {
  const { adminUser } = useAuth();
  if (adminUser && adminUser.role !== role) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

// ─── Main admin router ────────────────────────────────────────
export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductEditPage />} />
          <Route path="products/:id" element={<ProductEditPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="homepage" element={<HomepageEditorPage />} />
          <Route path="banner" element={<BannerEditorPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/new" element={<BlogEditPage />} />
          <Route path="blog/:id" element={<BlogEditPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="seo" element={<SeoPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="legal" element={<LegalEditorPage />} />
          <Route path="shipping" element={<ShippingPage />} />
          <Route path="i18n" element={<I18nEditorPage />} />
          <Route
            path="settings"
            element={
              <RequireRole role="admin">
                <SettingsPage />
              </RequireRole>
            }
          />
          <Route
            path="users"
            element={
              <RequireRole role="admin">
                <AdminUsersPage />
              </RequireRole>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
