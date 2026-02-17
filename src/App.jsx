import { useEffect, useState } from "react";
import LoadingSplash from "./components/LoadingSplash";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import GalleryPage from "./pages/GalleryPage";
import ChapterPage from "./pages/ChapterPage";
import AboutPage from "./pages/AboutPage";
import "./styles/globals.css";
import CustomCursor from "./components/CustomCursor";
import NotFound from "./components/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGuard from "./pages/admin/AdminGuard";
import AdminLogin from "./pages/admin/AdminLogin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    const handlePageLoad = () => setIsLoading(false);

    if (document.readyState === "complete") {
      setIsLoading(false);
    } else {
      window.addEventListener("load", handlePageLoad);
      return () => window.removeEventListener("load", handlePageLoad);
    }
  }, []);

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {isLoading && <LoadingSplash />}
      <ScrollToTop />
      <CustomCursor />
      <div className="relative min-h-screen grain">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="relative z-10">
          {!isAdminRoute && <Navbar />}
          <main>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminGuard>
                    <AdminDashboard />
                  </AdminGuard>
                }
              />

              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/chapter/:slug" element={<ChapterPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
          {!isAdminRoute && <Footer />}
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
