import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { verifyToken, GITHUB_CONFIG } from "../../data/githubSync";

export default function GitHubSettings({ onClose }) {
  const [token, setToken] = useState(
    localStorage.getItem("memoire_github_token") || "",
  );
  const [owner, setOwner] = useState(
    localStorage.getItem("memoire_github_owner") || "dearlyfebrianos",
  );
  const [repo, setRepo] = useState(
    localStorage.getItem("memoire_github_repo") || GITHUB_CONFIG.repo,
  );
  const [branch, setBranch] = useState(
    localStorage.getItem("memoire_github_branch") || "main",
  );
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleVerify = async () => {
    if (!token || !owner || !repo) return;
    setVerifying(true);
    setError("");
    setVerified(null);
    try {
      const result = await verifyToken(token, owner, repo);
      setVerified(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem("memoire_github_token", token);
    localStorage.setItem("memoire_github_owner", owner);
    localStorage.setItem("memoire_github_repo", repo);
    localStorage.setItem("memoire_github_branch", branch);
    GITHUB_CONFIG.owner = owner;
    GITHUB_CONFIG.repo = repo;
    GITHUB_CONFIG.branch = branch;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      if (verified) onClose();
    }, 1500);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.9)",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "14px",
    outline: "none",
    cursor: "text",
  };

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
                  GitHub Settings
                </h2>
                <p
                  className="font-body text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Konfigurasi auto-push ke repo
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

          <div className="p-6 space-y-4">
            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(232,196,160,0.06)",
                border: "1px solid rgba(232,196,160,0.15)",
              }}
            >
              <p
                className="font-body text-xs leading-relaxed"
                style={{ color: "rgba(232,196,160,0.8)" }}
              >
                <strong>Cara dapat GitHub Token:</strong>
                <br />
                GitHub.com → Settings → Developer settings → Personal access
                tokens → Tokens (classic) → Generate new token → centang{" "}
                <strong>repo</strong> → Copy token
              </p>
            </div>

            <div>
              <label
                className="block font-body text-xs mb-2 uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                GitHub Username
              </label>
              <input
                style={inputStyle}
                type="text"
                placeholder="contoh: dearlyfebriano"
                value={owner}
                onChange={(e) => {
                  setOwner(e.target.value);
                  setVerified(null);
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(232,196,160,0.4)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
            </div>

            <div>
              <label
                className="block font-body text-xs mb-2 uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Nama Repo
              </label>
              <input
                style={inputStyle}
                type="text"
                placeholder="contoh: memoire"
                value={repo}
                onChange={(e) => {
                  setRepo(e.target.value);
                  setVerified(null);
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(232,196,160,0.4)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
            </div>

            <div>
              <label
                className="block font-body text-xs mb-2 uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Branch
              </label>
              <input
                style={inputStyle}
                type="text"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(232,196,160,0.4)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
            </div>

            <div>
              <label
                className="block font-body text-xs mb-2 uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Personal Access Token
              </label>
              <input
                style={inputStyle}
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setVerified(null);
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(232,196,160,0.4)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
              <p
                className="font-body text-xs mt-1"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Token disimpan di localStorage browser kamu saja, tidak dikirim
                ke server manapun.
              </p>
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl font-body text-xs"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#fca5a5",
                }}
              >
                ⚠ {error}
              </div>
            )}

            {verified && (
              <div
                className="px-4 py-3 rounded-xl font-body text-xs flex items-center gap-2"
                style={{
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  color: "#4ade80",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Terverifikasi: <strong>{verified.repoName}</strong>{" "}
                {verified.private ? "🔒 Private" : "🌐 Public"} · Branch
                default: {verified.defaultBranch}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleVerify}
                disabled={!token || !owner || !repo || verifying}
                className="flex-1 py-3 rounded-xl font-body text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.5)",
                  cursor: !token || !owner || !repo ? "not-allowed" : "pointer",
                }}
              >
                {verifying ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi Koneksi"
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={!token || !owner || !repo}
                className="flex-1 py-3 rounded-xl font-body text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: saved
                    ? "rgba(74,222,128,0.12)"
                    : "rgba(232,196,160,0.12)",
                  border: `1px solid ${saved ? "rgba(74,222,128,0.3)" : "rgba(232,196,160,0.3)"}`,
                  color: saved ? "#4ade80" : "#e8c4a0",
                  cursor: !token ? "not-allowed" : "pointer",
                }}
              >
                {saved ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Tersimpan!
                  </>
                ) : (
                  "Simpan Config"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}