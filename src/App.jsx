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

// Global Real-time Sync Engine - Silent Background Update & Auto-Deploy
function RealtimeSync() {
  const { setChaptersDirect } = useStore();
  const [initialSha, setInitialSha] = useState(null);
  const [jsonMissing, setJsonMissing] = useState(false);

  useEffect(() => {
    const { owner, repo, branch, getToken, filePath } = GITHUB_CONFIG;

    const checkUpdates = async () => {
      try {
        const token = getToken();
        const headers = { Accept: "application/vnd.github+json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        // 1. Get latest commit SHA for the branch to detect ANY change (code or data)
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
          { headers },
        );
        if (!res.ok) return;
        const commitData = await res.json();
        const currentSha = commitData.sha;

        if (!initialSha) {
          setInitialSha(currentSha);
          return;
        }

        // 2. If SHA changed, something is new!
        if (currentSha !== initialSha) {
          // Check if the change was specifically in photos.js
          const fileRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}&sha=${branch}&per_page=1`,
            { headers },
          );

          if (fileRes.ok) {
            const fileCommits = await fileRes.json();
            const latestFileSha = fileCommits[0]?.sha;

            // If the latest commit on the branch IS the same as the latest commit on the data file,
            // then it's a DATA update. We sync it silently.
            if (currentSha === latestFileSha) {
              // Fetch content (Try JSON first if not known to be missing)
              let fetchedData = null;
              if (!jsonMissing) {
                const jsonPath = "src/data/photos.json";

                // Check existence via commits first to avoid console 404
                const checkRes = await fetch(
                  `https://api.github.com/repos/${owner}/${repo}/commits?path=${jsonPath}&sha=${branch}&per_page=1`,
                  { headers },
                );
                const commits = checkRes.ok ? await checkRes.json() : [];
                const exists = Array.isArray(commits) && commits.length > 0;

                if (exists) {
                  const r = await fetch(
                    token
                      ? `https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}?ref=${branch}`
                      : `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${jsonPath}`,
                    {
                      headers: token
                        ? {
                            ...headers,
                            Accept: "application/vnd.github.v3.raw",
                          }
                        : {},
                    },
                  );
                  if (r.ok) {
                    fetchedData = await r.json();
                  }
                } else {
                  setJsonMissing(true);
                }
              }

              // Fallback to JS if JSON failed or is missing
              if (!fetchedData) {
                const r = await fetch(
                  token
                    ? `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
                    : `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
                  {
                    headers: token
                      ? { ...headers, Accept: "application/vnd.github.v3.raw" }
                      : {},
                  },
                );
                if (r.ok) {
                  const text = await r.text();
                  const match = text.match(
                    /export const chapters = (\[[\s\S]*?\]);/,
                  );
                  if (match) fetchedData = new Function(`return ${match[1]}`)();
                }
              }

              if (fetchedData && Array.isArray(fetchedData)) {
                setChaptersDirect(fetchedData);
                setInitialSha(currentSha); // Data is now synchronized
                return;
              }
            } else {
              // If currentSha != latestFileSha, it means the update was NOT just data (it was CODE)
              // We need to reload the page to get the new Vercel deployment
              console.log("New code deployment detected. Reloading...");
              window.location.reload();
            }
          }
        }
      } catch (err) {
        // Silent fail
      }
    };

    const interval = setInterval(checkUpdates, 60000); // Check every minute
    checkUpdates();

    return () => clearInterval(interval);
  }, [initialSha, setChaptersDirect, jsonMissing]);

  return null;
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
