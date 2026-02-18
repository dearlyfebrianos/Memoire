import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generatePhotosJS,
  generateAuthJS,
  pushBackupToGitHub,
  restoreFromBackup,
  pushToGitHub,
  pushAuthToGitHub,
} from "../../data/githubSync";

// Helper: Download content as file
const downloadFile = (content, filename) => {
  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function BackupManager({ chapters, credentials }) {
  const [status, setStatus] = useState("idle"); // idle | backing_up | restoring | success | error
  const [msg, setMsg] = useState("");
  const [restoreType, setRestoreType] = useState(null); // 'photos' | 'auth'

  // Backup Handler
  const handleBackup = async () => {
    setStatus("backing_up");
    try {
      // 1. Generate Content
      const photosContent = generatePhotosJS(chapters);
      const authContent = generateAuthJS(credentials);

      // 2. Download Locally
      downloadFile(photosContent, "photos_backup.js");
      setTimeout(() => downloadFile(authContent, "authData_backup.js"), 500);

      // 3. Push to GitHub Backup Folder
      const folderName = await pushBackupToGitHub(chapters, credentials);

      setStatus("success");
      setMsg(`Backup saved to GitHub folder: ${folderName}`);
      setTimeout(() => setStatus("idle"), 8000);
    } catch (e) {
      setStatus("error");
      setMsg(e.message || "Backup failed on GitHub side");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  // Upload/Restore Handler
  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Strict Filename Validation
    const validNames =
      type === "photos"
        ? ["photos.js", "photos_backup.js"]
        : ["authData.js", "authData_backup.js"];

    if (!validNames.includes(file.name)) {
      setStatus("error");
      setMsg(`Salah file bro! Harusnya: ${validNames.join(" atau ")}`);
      e.target.value = null;
      return;
    }

    setStatus("restoring");
    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target.result;

      // 2. Advanced Logic & Security Validation
      try {
        // Security Check: Broadened scanning for dangerous patterns
        const dangerousPatterns = [
          "eval(",
          "Function(",
          "setTimeout(",
          "setInterval(",
          "document.cookie",
          "localStorage",
          "sessionStorage",
          "indexedDB",
          "fetch(",
          "XMLHttpRequest",
          "WebSocket",
          ".innerHTML",
          ".outerHTML",
          ".insertAdjacentHTML",
          ".setAttribute",
          "window.",
          "document.",
          "process.",
          "require(",
        ];

        const foundPattern = dangerousPatterns.find((p) => content.includes(p));
        if (foundPattern) {
          throw new Error(
            `Security Alert: Suspicious pattern '${foundPattern}' detected! Restoration blocked.`,
          );
        }

        if (type === "photos") {
          // Must define the chapters export
          if (!content.trim().startsWith("export const chapters = [")) {
            throw new Error(
              "Format Invalid: File harus diawali 'export const chapters = ['",
            );
          }
          // Deep structure check (Heuristic)
          const requiredKeys = ["id:", "slug:", "label:", "photos: ["];
          const missingKey = requiredKeys.find((key) => !content.includes(key));
          if (missingKey) {
            throw new Error(
              `Corrupt Data: Properti wajib '${missingKey.replace(":", "")}' hilang.`,
            );
          }
        }

        if (type === "auth") {
          // Must define the credentials export
          if (!content.includes("export const CREDENTIALS")) {
            throw new Error(
              "Invalid structure: Missing export const CREDENTIALS",
            );
          }
        }

        // 3. Push/Restore to Live Path
        await restoreFromBackup(type, content);

        setStatus("success");
        setMsg(`Restored ${file.name} successfully! Refreshing...`);

        // Auto-refresh after delay to load new data
        setTimeout(() => window.location.reload(), 3000);
      } catch (err) {
        setStatus("error");
        setMsg("Validation Error: " + err.message);
      }
    };

    reader.readAsText(file);
    // Reset input
    e.target.value = null;
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-8">
        <h2 className="font-display text-4xl text-white/90">
          System Backup & Restore
        </h2>
        <p className="font-body text-sm text-white/40 max-w-2xl leading-relaxed">
          Securely backup your entire memory database and access credentials.
          Backups are saved locally to your device AND to a timestamped folder
          on GitHub.
        </p>
      </div>

      {/* Backup Section */}
      <div className="relative group p-1 rounded-[32px] bg-gradient-to-b from-white/10 to-transparent">
        <div className="bg-[#0a0a0f] rounded-[28px] p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-[#e8c4a0]/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e8c4a0]/20 to-orange-500/10 border border-[#e8c4a0]/30 flex items-center justify-center text-[#e8c4a0] shadow-lg shadow-[#e8c4a0]/10 shrink-0">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-xl text-white/90 mb-1">
                  Backup All Data
                </h3>
                <div className="flex flex-col gap-1 items-center sm:items-start">
                  <p className="font-body text-xs text-white/40">Includes:</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
                      photos.js
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
                      authData.js
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleBackup}
              disabled={status === "backing_up"}
              className="w-full md:w-auto justify-center px-8 py-4 rounded-xl bg-[#e8c4a0] hover:bg-[#d8b490] text-[#0a0a0f] font-display text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3 shadow-xl shadow-[#e8c4a0]/20"
            >
              {status === "backing_up" ? (
                <>
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Backup
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Restore Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restore Photos */}
        <div className="p-1 rounded-[24px] bg-gradient-to-b from-white/5 to-transparent">
          <div className="h-full bg-[#0a0a0f] rounded-[20px] p-6 flex flex-col justify-between gap-6 border border-white/5 hover:border-white/10 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <h4 className="font-display text-lg text-white/80">
                  Restore Memories
                </h4>
              </div>
              <p className="font-body text-xs text-white/40 leading-relaxed mb-4">
                Replace current content with a backup file.
                <br />
                <strong className="text-white/60">Target:</strong>{" "}
                src/data/photos.js
              </p>
            </div>

            <label className="w-full cursor-pointer group/upload">
              <input
                type="file"
                accept=".js"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "photos")}
                disabled={status === "restoring"}
              />
              <div className="w-full py-3 rounded-lg border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 text-white/40 group-hover/upload:text-blue-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="font-display text-xs tracking-wider uppercase">
                  Upload photos.js
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Restore Auth */}
        <div className="p-1 rounded-[24px] bg-gradient-to-b from-white/5 to-transparent">
          <div className="h-full bg-[#0a0a0f] rounded-[20px] p-6 flex flex-col justify-between gap-6 border border-white/5 hover:border-white/10 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h4 className="font-display text-lg text-white/80">
                  Restore Access
                </h4>
              </div>
              <p className="font-body text-xs text-white/40 leading-relaxed mb-4">
                Replace admin credentials with a backup file.
                <br />
                <strong className="text-white/60">Target:</strong>{" "}
                src/data/authData.js
              </p>
            </div>

            <label className="w-full cursor-pointer group/upload">
              <input
                type="file"
                accept=".js"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "auth")}
                disabled={status === "restoring"}
              />
              <div className="w-full py-3 rounded-lg border border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2 text-white/40 group-hover/upload:text-purple-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="font-display text-xs tracking-wider uppercase">
                  Upload authData.js
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(status === "success" ||
          status === "error" ||
          status === "restoring") && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl border shadow-2xl flex items-center gap-4 ${status === "error" ? "bg-[#0f0f12] border-red-500/20" : "bg-[#0f0f12] border-green-500/20"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${status === "error" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}
            >
              {status === "restoring" ? (
                <svg
                  className="animate-spin"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : status === "error" ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div>
              <h4
                className={`font-display text-sm ${status === "error" ? "text-red-200" : "text-green-200"}`}
              >
                {status === "restoring"
                  ? "Restoring..."
                  : status === "error"
                    ? "Operation Failed"
                    : "Success"}
              </h4>
              <p
                className={`font-body text-xs ${status === "error" ? "text-red-400/60" : "text-green-400/60"} max-w-[240px]`}
              >
                {status === "restoring"
                  ? "Uploading and restoring file..."
                  : msg}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
