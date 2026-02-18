import { useEffect, useState, memo } from "react";
import LoadingSplash from "./components/LoadingSplash";
import { useStore } from "./data/useStore";
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

// Global Real-time Sync Engine
function RealtimeSync() {
  const { setChaptersDirect } = useStore();
  const [lastCommit, setLastCommit] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasNewCode, setHasNewCode] = useState(false);

  useEffect(() => {
    const owner = "dearlyfebrianos";
    const repo = "Memoire";
    const branch = "main";
    const path = "src/data/photos.js";

    const checkUpdates = async () => {
      try {
        console.log("Checking for real-time updates...");
        // 1. Cek commit terbaru untuk file data
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?path=${path}&sha=${branch}&per_page=1`,
        );
        if (!res.ok) return;

        const commits = await res.json();
        if (commits.length === 0) return;

        const currentSha = commits[0].sha;

        // Jika ini pertama kali, simpan SHA-nya
        if (!lastCommit) {
          setLastCommit(currentSha);
          return;
        }

        // Jika SHA berubah, berarti ada data baru!
        if (currentSha !== lastCommit) {
          console.log("New data detected! Syncing seamlessly...");
          setIsSyncing(true);

          // Ambil file RAW dari GitHub
          const rawRes = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
          );
          if (rawRes.ok) {
            const text = await rawRes.text();
            // Regex untuk ambil array chapters
            const match = text.match(/export const chapters = (\[[\s\S]*?\]);/);
            if (match) {
              try {
                // Konversi string array menjadi data asli JS secara aman
                const data = new Function(`return ${match[1]}`)();
                if (Array.isArray(data)) {
                  setChaptersDirect(data);
                  setLastCommit(currentSha);
                  console.log("Sync complete. Gallery updated.");
                }
              } catch (e) {
                console.error("Failed to parse remote data:", e);
              }
            }
          }
          setIsSyncing(false);
          // Beri waktu cooldown sebelum hilang pulsanya
          setTimeout(() => setIsSyncing(false), 3000);
        }

        // 2. (Opsional) Cek jika ada update kode (fitur) secara keseluruhan
        const repoRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
        );
        if (repoRes.ok) {
          const repoData = await repoRes.json();
          if (
            repoData.sha !== currentSha &&
            repoData.sha !== lastCommit &&
            lastCommit
          ) {
            // Jika commit terakhir repo bukan commit terakhir photos.js, berarti ada update fitur
            setHasNewCode(true);
          }
        }
      } catch (err) {
        console.warn("Real-time sync error:", err);
      }
    };

    // Jalankan setiap 60 detik (aman dari rate limit GitHub unauthenticated)
    const interval = setInterval(checkUpdates, 60000);
    // Jalankan pertama kali segera
    checkUpdates();

    return () => clearInterval(interval);
  }, [lastCommit, setChaptersDirect]);

  if (!isSyncing && !hasNewCode) return null;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 shadow-2xl"
      style={{
        background: "rgba(10,10,22,0.85)",
        backdropFilter: "blur(20px)",
      }}
    >
      {isSyncing ? (
        <>
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-body text-[10px] tracking-widest uppercase text-sky-400 font-bold">
            Syncing Memories...
          </span>
        </>
      ) : hasNewCode ? (
        <>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-body text-[10px] tracking-widest uppercase text-amber-200">
            Fitur Baru Tersedia
          </span>
          <button
            onClick={() => window.location.reload()}
            className="px-2 py-1 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 font-body text-[9px] hover:bg-amber-400/20 transition-all"
          >
            Update
          </button>
        </>
      ) : null}
    </motion.div>
  );
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
