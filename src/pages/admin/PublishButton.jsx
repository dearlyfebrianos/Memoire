import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pushToGitHub } from "../../data/githubSync";
import { useStore } from "../../data/useStore";

export default function PublishButton({ onOpenSettings }) {
  const { chapters } = useStore();
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  const hasToken = !!localStorage.getItem("memoire_github_token");

  const handlePublish = async () => {
    if (!hasToken) { onOpenSettings(); return; }
    setStatus("loading");
    setShowResult(false);
    try {
      const res = await pushToGitHub(chapters);
      setResult(res);
      setStatus("success");
      setShowResult(true);
      setTimeout(() => { setStatus("idle"); setShowResult(false); }, 10000);
    } catch (e) {
      setError(e.message);
      setStatus("error");
      setShowResult(true);
      setTimeout(() => { setStatus("idle"); setShowResult(false); }, 6000);
    }
  };

  const bgColor = {
    idle: hasToken ? "rgba(74,222,128,0.1)" : "rgba(232,196,160,0.1)",
    loading: "rgba(251,191,36,0.1)",
    success: "rgba(74,222,128,0.15)",
    error: "rgba(239,68,68,0.1)",
  }[status];

  const borderColor = {
    idle: hasToken ? "rgba(74,222,128,0.3)" : "rgba(232,196,160,0.3)",
    loading: "rgba(251,191,36,0.3)",
    success: "rgba(74,222,128,0.4)",
    error: "rgba(239,68,68,0.3)",
  }[status];

  const textColor = {
    idle: hasToken ? "#4ade80" : "#e8c4a0",
    loading: "#fbbf24",
    success: "#4ade80",
    error: "#fca5a5",
  }[status];

  return (
    <div className="relative">
      <button
        onClick={handlePublish}
        disabled={status === "loading"}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-xs transition-all duration-300 hover:scale-[1.02]"
        style={{ background: bgColor, border: `1px solid ${borderColor}`, color: textColor, cursor: status === "loading" ? "not-allowed" : "pointer" }}
      >
        {status === "loading" && (
          <svg className="animate-spin shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        )}
        {status === "success" && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
        {status === "error" && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
        {status === "idle" && (
          hasToken ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          )
        )}
        <span>
          {status === "idle" && (hasToken ? "Publish ke GitHub" : "Setup GitHub")}
          {status === "loading" && "Mempublish..."}
          {status === "success" && "Berhasil!"}
          {status === "error" && "Gagal"}
        </span>
      </button>

      {/* Result popover */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 top-12 w-80 p-4 rounded-2xl z-50"
            style={{
              background: "rgba(10,10,22,0.98)",
              backdropFilter: "blur(20px)",
              border: status === "success"
                ? "1px solid rgba(74,222,128,0.25)"
                : "1px solid rgba(239,68,68,0.25)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
            }}
          >
            {status === "success" && result && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="font-body text-sm font-medium" style={{ color: "#4ade80" }}>Push berhasil!</p>
                </div>

                <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Commit: <span style={{ color: "rgba(255,255,255,0.75)", fontFamily: "monospace" }}>#{result.commitSha}</span>
                </p>

                {/* Reminder box — penting! */}
                <div className="px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(251,191,36,0.9)" }}>
                    ⏱ Vercel sedang rebuild. Tunggu <strong>30–60 detik</strong>, lalu minta orang lain <strong>refresh halaman</strong> — perubahan hidden/publik akan berlaku untuk semua.
                  </p>
                </div>

                {result.commitUrl && (
                  <a href={result.commitUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-body text-xs transition-opacity hover:opacity-75"
                    style={{ color: "#4ade80", textDecoration: "underline" }}>
                    Lihat commit di GitHub
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                )}
              </div>
            )}

            {status === "error" && (
              <div>
                <p className="font-body text-sm mb-2" style={{ color: "#fca5a5" }}>Push gagal</p>
                <p className="font-body text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)", lineHeight: "1.7" }}>{error}</p>
                <button onClick={onOpenSettings} className="font-body text-xs underline" style={{ color: "#e8c4a0" }}>
                  Cek pengaturan GitHub →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}