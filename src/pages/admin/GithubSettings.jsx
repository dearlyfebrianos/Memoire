import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GITHUB_CONFIG, verifyToken } from "../../data/githubSync";

export default function GitHubSettings({ onClose }) {
  const [testStatus, setTestStatus] = useState("idle"); // idle | testing | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const repoUrl = `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`;

  useEffect(() => {
    const checkConnection = async () => {
      const token = GITHUB_CONFIG.getToken();
      if (!token) {
        setTestStatus("error");
        setErrorMsg("Token not found in environment variables.");
        return;
      }

      setTestStatus("testing");
      try {
        await verifyToken(token, GITHUB_CONFIG.owner, GITHUB_CONFIG.repo);
        setTestStatus("success");
      } catch (e) {
        setTestStatus("error");
        setErrorMsg(e.message || "Failed to connect to GitHub");
      }
    };

    checkConnection();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg rounded-3xl overflow-hidden"
          style={{
            background: "rgba(10,10,22,0.95)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 pb-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="rgba(255,255,255,0.7)"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <h2
                  className="font-display text-xl"
                  style={{ color: "rgba(255,255,255,0.9)", fontWeight: 300 }}
                >
                  GitHub Service
                </h2>
                <p
                  className="font-body text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Automated sync active
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div
              className="p-5 rounded-2xl"
              style={{
                background:
                  testStatus === "success"
                    ? "rgba(74,222,128,0.06)"
                    : testStatus === "error"
                      ? "rgba(239,68,68,0.06)"
                      : "rgba(255,255,255,0.03)",
                border:
                  testStatus === "success"
                    ? "1px solid rgba(74,222,128,0.15)"
                    : testStatus === "error"
                      ? "1px solid rgba(239,68,68,0.15)"
                      : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    testStatus === "success"
                      ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"
                      : testStatus === "error"
                        ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        : "bg-amber-500 animate-bounce"
                  }`}
                />
                <h4
                  className={`font-display text-xs uppercase tracking-widest font-bold ${
                    testStatus === "success"
                      ? "text-green-400"
                      : testStatus === "error"
                        ? "text-red-400"
                        : "text-amber-400"
                  }`}
                >
                  {testStatus === "testing"
                    ? "Verifying Connection..."
                    : testStatus === "success"
                      ? "System Connected"
                      : "Connection Failed"}
                </h4>
              </div>
              <p
                className="font-body text-xs leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {testStatus === "success"
                  ? "Repo ini telah dikunci dan dikonfigurasi melalui sistem (.env). Sinkronisasi berjalan dengan aman."
                  : testStatus === "error"
                    ? `Terjadi masalah: ${errorMsg}. Pastikan VITE_GITHUB_TOKEN sudah benar di Vercel.`
                    : "Sedang mencoba menghubungi API GitHub untuk memastikan token Anda masih aktif..."}
              </p>
            </div>

            {/* Repo Info Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="font-body text-xs text-white/30 uppercase tracking-widest">
                  Repository
                </span>
                <span className="font-body text-xs text-white/80">
                  {GITHUB_CONFIG.owner}/{GITHUB_CONFIG.repo}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="font-body text-xs text-white/30 uppercase tracking-widest">
                  Branch
                </span>
                <span className="font-body text-xs text-white/80">
                  {GITHUB_CONFIG.branch}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="font-body text-xs text-white/30 uppercase tracking-widest">
                  Sync Mode
                </span>
                <span className="font-body text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white/40 uppercase">
                  Webhook / Auto-Push
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-body text-xs text-white/30 uppercase tracking-widest">
                  Connectivity
                </span>
                <span className="font-body text-xs text-green-400">
                  Encrypted & Secure
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white/60 font-display text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                Visit GitHub Repository
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>

            <p className="text-center font-body text-[9px] text-white/10 uppercase tracking-tighter">
              Admin configuration locked by system owner
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
