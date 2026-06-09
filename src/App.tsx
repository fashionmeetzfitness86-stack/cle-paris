import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
import NotFoundPage from "./pages/NotFoundPage";
import AdminApp from "./admin/AdminApp";

/** Wraps page content with a fade-up entrance on every route change */
function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [key, setKey] = useState(location.pathname);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    setKey(location.pathname);
    // Remove class after animation completes so it doesn't block re-trigger
    const t = setTimeout(() => setAnimating(false), 700);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      key={key}
      className={animating ? "animate-fade-up will-change-transform" : ""}
    >
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin — no storefront shell */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* Storefront */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <PageTransition>
                <Routes>
                  <Route path="/"              element={<HomePage />} />
                  <Route path="/collection"    element={<CollectionPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/about"         element={<AboutPage />} />
                  <Route path="/archive"       element={<ArchivePage />} />
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
