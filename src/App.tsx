import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import ArchivePage from "./pages/ArchivePage";
import LegalPage from "./pages/LegalPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminApp from "./admin/AdminApp";
import { useCart } from "./store/cart";

/**
 * /cart — opens the cart drawer and redirects to /collection.
 * No empty cart page; the drawer is the cart experience.
 */
function CartRoute() {
  const navigate = useNavigate();
  const open = useCart((s) => s.open);

  useEffect(() => {
    open();
    navigate("/collection", { replace: true });
  }, [open, navigate]);

  return null;
}

/**
 * Smooth fade-up entrance on every route change.
 * key on location.pathname causes React to remount the div,
 * triggering the .page-enter animation afresh.
 */
function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Admin (no storefront shell) ──────────────────────────── */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* ── Storefront ───────────────────────────────────────────── */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <PageTransition>
                <Routes>
                  <Route path="/"              element={<HomePage />} />
                  {/* Collection + /shop alias */}
                  <Route path="/collection"    element={<CollectionPage />} />
                  <Route path="/shop"          element={<Navigate to="/collection" replace />} />
                  {/* /cart opens drawer then lands on collection */}
                  <Route path="/cart"          element={<CartRoute />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/about"         element={<AboutPage />} />
                  <Route path="/archive"       element={<ArchivePage />} />
                  <Route path="/order/success" element={<OrderSuccessPage />} />
                  <Route path="/legal/:slug"   element={<LegalPage />} />
                  <Route path="*"              element={<NotFoundPage />} />
                </Routes>
              </PageTransition>
            </main>
            <Footer />
            <CartDrawer />
          </div>
        }
      />
    </Routes>
  );
}
