import { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import LoadingSplash from "./components/LoadingSplash";
import { useStore } from "./data/useStore";
import { GITHUB_CONFIG } from "./data/githubSync";
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

// Global Real-time Sync Engine - Silent Background Update
function RealtimeSync() {
  const { setChaptersDirect } = useStore();
  const [lastCommit, setLastCommit] = useState(null);

  useEffect(() => {
    const { owner, repo, branch, getToken } = GITHUB_CONFIG;
    const path = "src/data/photos.js";

    const checkUpdates = async () => {
      try {
        const token = getToken();
        const headers = {
          Accept: "application/vnd.github+json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // 1. Cek commit terbaru untuk file data (photos.js)
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?path=${path}&sha=${branch}&per_page=1`,
          { headers },
        );

        if (!res.ok) return;

        const commits = await res.json();
        if (!Array.isArray(commits) || commits.length === 0) return;

        const currentSha = commits[0].sha;

        if (!lastCommit) {
          setLastCommit(currentSha);
          return;
        }

        if (currentSha !== lastCommit) {
          // Sync diam-diam di background
          let text = "";
          if (token) {
            const rawRes = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
              {
                headers: {
                  ...headers,
                  Accept: "application/vnd.github.v3.raw",
                },
              },
            );
            if (rawRes.ok) text = await rawRes.text();
          } else {
            const rawRes = await fetch(
              `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
            );
            if (rawRes.ok) text = await rawRes.text();
          }

          if (text) {
            const match = text.match(/export const chapters = (\[[\s\S]*?\]);/);
            if (match) {
              try {
                const data = new Function(`return ${match[1]}`)();
                if (Array.isArray(data)) {
                  setChaptersDirect(data);
                  setLastCommit(currentSha);
                  // Tidak ada UI alert, data langsung terupdate di layar
                }
              } catch (e) {
                console.error("Silent Sync Error:", e);
              }
            }
          }
        }
      } catch (err) {
        // Silent fail
      }
    };

    const interval = setInterval(checkUpdates, 60000);
    checkUpdates();

    return () => clearInterval(interval);
  }, [lastCommit, setChaptersDirect]);

  return null; // Benar-benar tidak terlihat
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    localStorage.removeItem("memoire_data");

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
      <RealtimeSync />
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
