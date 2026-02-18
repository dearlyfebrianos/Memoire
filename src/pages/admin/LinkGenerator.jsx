import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CLOUDINARY_CLOUD_NAME = "memoire_cloudinary_name";
const CLOUDINARY_PRESET = "memoire_cloudinary_preset";
const ACCENT = "#e8c4a0";

function getCloudinaryName() {
  return localStorage.getItem(CLOUDINARY_CLOUD_NAME) || "dg3awuzug";
}

function getCloudinaryPreset() {
  return localStorage.getItem(CLOUDINARY_PRESET) || "ml_default";
}

function uploadToCloudinary(file, cloudName, uploadPreset, onProgress, xhrRef) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const isVideo = file.type.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const xhr = new XMLHttpRequest();
    if (xhrRef) xhrRef.current = xhr;

    xhr.open("POST", url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          directUrl: data.secure_url,
          thumbUrl:
            data.thumbnail_url ||
            (resourceType === "image" ? data.secure_url : ""),
          filename: file.name,
          size: file.size,
          type: resourceType,
        });
      } else {
        const err = JSON.parse(xhr.responseText || "{}");
        reject(
          new Error(
            err?.error?.message || `Gagal upload ${resourceType} ke Cloudinary`,
          ),
        );
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload dibatalkan."));
    xhr.send(formData);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function LinkGenerator({ onClose }) {
  const [cloudName, setCloudName] = useState(getCloudinaryName());
  const [preset, setPreset] = useState(getCloudinaryPreset());
  const [showSetup, setShowSetup] = useState(
    !getCloudinaryName() || !getCloudinaryPreset(),
  );
  const [files, setFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [recentHistory, setRecentHistory] = useState(() => {
    const saved = localStorage.getItem("memoire_recent_links");
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const xhrRef = useRef(null);

  const handleAbort = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setIsUploading(false);
      setUploadQueue([]);
    }
  };

  const handleSaveKeys = () => {
    localStorage.setItem(CLOUDINARY_CLOUD_NAME, cloudName.trim());
    localStorage.setItem(CLOUDINARY_PRESET, preset.trim());
    setShowSetup(false);
  };

  const handleFiles = useCallback((newFiles) => {
    const validFiles = Array.from(newFiles).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    if (validFiles.length === 0) return;

    const items = validFiles.map((f) => ({
      id: Date.now() + Math.random(),
      file: f,
      name: f.name,
      size: f.size,
      type: f.type.startsWith("video/") ? "video" : "image",
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...items]);
    setUploadQueue((prev) => [...prev, ...items]);
  }, []);

  // Process upload queue
  useEffect(() => {
    if (uploadQueue.length === 0) return;

    const processNext = async () => {
      const item = uploadQueue[0];
      if (!item) {
        setIsUploading(false);
        return;
      }

      setIsUploading(true);
      setCurrentProgress(0);

      try {
        const result = await uploadToCloudinary(
          item.file,
          getCloudinaryName(),
          getCloudinaryPreset(),
          (p) => setCurrentProgress(p),
          xhrRef,
        );

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "done", result } : f,
          ),
        );
        const newResult = { ...result, id: item.id, timestamp: Date.now() };
        setResults((prev) => [newResult, ...prev]);

        // Simpan ke history (limit 20 items)
        setRecentHistory((prev) => {
          const updated = [newResult, ...prev].slice(0, 20);
          localStorage.setItem("memoire_recent_links", JSON.stringify(updated));
          return updated;
        });
      } catch (e) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "error", error: e.message } : f,
          ),
        );
      }

      const nextQueue = uploadQueue.slice(1);
      setUploadQueue(nextQueue);
      if (nextQueue.length === 0) {
        // Smooth transition out
        setTimeout(() => setIsUploading(false), 500);
      }
    };

    processNext();
  }, [uploadQueue]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const urls = results.map((r) => r.directUrl).join("\n");
    navigator.clipboard.writeText(urls);
    setCopiedId("all");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setUploadQueue((prev) => prev.filter((f) => f.id !== id));
  };

  const handleConfirmClear = () => {
    setRecentHistory([]);
    localStorage.removeItem("memoire_recent_links");
    setShowClearConfirm(false);
  };

  const handleClearAll = () => {
    setFiles([]);
    setUploadQueue([]);
    setResults([]);
  };

  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;

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
        onClick={() => !isUploading && onClose()}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden"
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
            className="flex items-center justify-between p-6 pb-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(56,189,248,0.1)",
                  border: "1px solid rgba(56,189,248,0.25)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <h2
                  className="font-display text-xl"
                  style={{ color: "rgba(255,255,255,0.9)", fontWeight: 300 }}
                >
                  Generator Link Hub
                </h2>
                <p
                  className="font-body text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Upload foto/video → dapatkan link otomatis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                title="Recent History"
                style={{
                  background: showHistory
                    ? "rgba(56,189,248,0.15)"
                    : "rgba(255,255,255,0.06)",
                  border: showHistory
                    ? "1px solid rgba(56,189,248,0.3)"
                    : "1px solid rgba(255,255,255,0.1)",
                  color: showHistory ? "#38bdf8" : "rgba(255,255,255,0.4)",
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
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => setShowSetup(!showSetup)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                title="Pengaturan API Key"
                style={{
                  background: showSetup
                    ? "rgba(232,196,160,0.1)"
                    : "rgba(255,255,255,0.06)",
                  border: showSetup
                    ? "1px solid rgba(232,196,160,0.3)"
                    : "1px solid rgba(255,255,255,0.1)",
                  color: showSetup ? "#e8c4a0" : "rgba(255,255,255,0.4)",
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
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
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
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* History Panel */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 rounded-2xl mb-4 bg-sky-400/5 border border-sky-400/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-display text-xs tracking-widest uppercase text-sky-400">
                        Recent Generated Links
                      </h4>
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="font-body text-[10px] text-white/30 hover:text-red-400 transition-colors"
                      >
                        Clear History
                      </button>
                    </div>

                    {/* Confirmation Overlay for Clear History */}
                    <AnimatePresence>
                      {showClearConfirm && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute inset-x-5 top-16 bottom-5 z-20 flex flex-col items-center justify-center p-6 text-center rounded-2xl"
                          style={{
                            background: "rgba(10,10,22,0.92)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#fca5a5"
                              strokeWidth="2"
                            >
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </div>
                          <h5 className="font-display text-sm text-white/90 mb-1">
                            Hapus Semua History?
                          </h5>
                          <p className="font-body text-[10px] text-white/40 mb-6 px-4">
                            Tindakan ini tidak bisa dibatalkan. Kamu akan
                            kehilangan semua link yang baru di-generate.
                          </p>
                          <div className="flex gap-3 w-full max-w-[200px]">
                            <button
                              onClick={() => setShowClearConfirm(false)}
                              className="flex-1 py-2 rounded-xl font-body text-[10px] text-white/60 hover:bg-white/5 transition-colors"
                              style={{
                                border: "1px solid rgba(255,255,255,0.1)",
                              }}
                            >
                              Batal
                            </button>
                            <button
                              onClick={handleConfirmClear}
                              className="flex-1 py-2 rounded-xl font-body text-[10px] text-white font-bold"
                              style={{ background: "#ef4444" }}
                            >
                              Hapus
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {recentHistory.length === 0 ? (
                      <p className="font-body text-xs text-white/20 py-4 text-center italic">
                        Belum ada history upload.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {recentHistory.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black">
                              {h.type === "image" ? (
                                <img
                                  src={h.directUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-sky-500/10">
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="text-sky-400"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-body text-[10px] text-white/50 truncate">
                                {h.filename}
                              </p>
                              <button
                                onClick={() => handleCopy(h.directUrl, h.id)}
                                className="font-body text-[9px] text-sky-400 hover:underline"
                              >
                                {copiedId === h.id ? "Copied!" : "Copy Link"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* API Key Setup */}
            <AnimatePresence>
              {showSetup && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className="p-5 rounded-2xl mb-4 space-y-4"
                    style={{
                      background: "rgba(56,189,248,0.04)",
                      border: "1px solid rgba(56,189,248,0.15)",
                    }}
                  >
                    <p
                      className="font-body text-xs leading-relaxed"
                      style={{ color: "rgba(232,196,160,0.8)" }}
                    >
                      <strong>Info Upload:</strong>
                      <br />
                      - **Media:** Menggunakan Cloudinary (Gambar & Video).
                      <br />- **Requirement:** Perlu Cloud Name & Preset
                      (Unsigned).
                      <span className="block mt-1 opacity-60">
                        ImgBB & Pixeldrain ditiadakan karena sering mengalami
                        masalah koneksi SSL/CORS di beberapa jaringan.
                      </span>
                    </p>

                    <div className="space-y-4">
                      <div
                        className="p-3 rounded-xl space-y-3"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <div>
                          <label
                            className="block font-body text-[10px] mb-1.5 uppercase tracking-widest"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                          >
                            Cloudinary Cloud Name
                          </label>
                          <input
                            style={inputStyle}
                            type="text"
                            placeholder="Contoh: dxabc123"
                            value={cloudName}
                            onChange={(e) => setCloudName(e.target.value)}
                          />
                        </div>

                        <div>
                          <label
                            className="block font-body text-[10px] mb-1.5 uppercase tracking-widest"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                          >
                            Cloudinary Upload Preset (Unsigned)
                          </label>
                          <div className="flex gap-2">
                            <input
                              style={inputStyle}
                              type="text"
                              placeholder="Contoh: ml_default"
                              value={preset}
                              onChange={(e) => setPreset(e.target.value)}
                            />
                            <button
                              onClick={handleSaveKeys}
                              disabled={!cloudName.trim() || !preset.trim()}
                              className="shrink-0 px-5 py-2.5 rounded-xl font-body text-sm transition-all"
                              style={{
                                background: "rgba(56,189,248,0.12)",
                                border: "1px solid rgba(56,189,248,0.3)",
                                color: "#38bdf8",
                              }}
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drop zone */}
            <div
              className="relative rounded-2xl transition-all duration-300 cursor-pointer"
              style={{
                border: dragActive
                  ? "2px dashed #38bdf8"
                  : "2px dashed rgba(255,255,255,0.12)",
                background: dragActive
                  ? "rgba(56,189,248,0.06)"
                  : "rgba(255,255,255,0.02)",
                padding: files.length > 0 ? "20px" : "40px 20px",
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: dragActive
                      ? "rgba(56,189,248,0.15)"
                      : "rgba(255,255,255,0.05)",
                    border: `1px solid ${dragActive ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={dragActive ? "#38bdf8" : "rgba(255,255,255,0.3)"}
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <p
                    className="font-body text-sm mb-1"
                    style={{
                      color: dragActive ? "#38bdf8" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {dragActive
                      ? "Lepaskan file!"
                      : "Klik atau drop foto/video kamu"}
                  </p>
                  <p
                    className="font-body text-xs"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    Media otomatis di-host di Cloudinary
                  </p>
                </div>
              </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="font-display text-sm"
                    style={{ color: "rgba(255,255,255,0.7)", fontWeight: 400 }}
                  >
                    Hasil Link ({results.length})
                  </h3>
                  <button
                    onClick={handleCopyAll}
                    style={{ color: "#38bdf8" }}
                    className="font-body text-xs"
                  >
                    {copiedId === "all" ? "Tersalin!" : "Salin Semua"}
                  </button>
                </div>

                <div className="space-y-3">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl flex items-center gap-3"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-black flex items-center justify-center">
                        {r.type === "image" ? (
                          <img
                            src={r.directUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video className="w-full h-full object-cover">
                            <source src={r.directUrl} />
                          </video>
                        )}
                      </div>

                      {/* Info & Copy */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="font-body shrink-0"
                            style={{
                              fontSize: "0.6rem",
                              color: r.type === "image" ? "#e8c4a0" : "#38bdf8",
                              background: "rgba(255,255,255,0.05)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {r.type.toUpperCase()}
                          </span>
                          <p
                            className="font-body text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-none"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            {r.filename}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative min-w-0">
                            <input
                              type="text"
                              readOnly
                              value={r.directUrl}
                              className="w-full font-body text-[10px] sm:text-xs bg-black/30 p-2 sm:p-2.5 rounded-lg outline-none text-white/60 pr-8"
                            />
                            <div
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                              style={{
                                background:
                                  r.type === "image"
                                    ? "#e8c4a022"
                                    : "#38bdf822",
                              }}
                            />
                          </div>
                          <button
                            onClick={() => handleCopy(r.directUrl, r.id)}
                            className="shrink-0 px-3 sm:px-4 py-2 rounded-lg font-body text-[10px] sm:text-xs transition-colors"
                            style={{
                              background:
                                copiedId === r.id ? "#4ade8022" : "#38bdf822",
                              color: copiedId === r.id ? "#4ade80" : "#38bdf8",
                              border: `1px solid ${copiedId === r.id ? "#4ade8033" : "transparent"}`,
                            }}
                          >
                            {copiedId === r.id ? "Ok" : "Salin"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-display text-sm tracking-widest uppercase"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Sudah Selesai
            </button>
          </div>
        </motion.div>

        {/* Loading Splash */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-6"
              style={{
                background: "rgba(10,10,22,0.85)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="relative flex flex-col items-center gap-8">
                {/* Rotating Circle */}
                <div className="relative w-32 h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-full h-full rounded-full border-[3px] border-transparent"
                    style={{
                      borderTopColor: "#38bdf8",
                      borderRightColor: "#38bdf8",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="font-display text-3xl font-light"
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {currentProgress}%
                    </span>
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                  <motion.h3
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="font-display text-xl tracking-wider text-white/90"
                  >
                    {currentProgress === 100
                      ? "MEMPROSES..."
                      : "SEDANG MENGUPLOAD"}
                  </motion.h3>
                  <p className="font-body text-sm text-white/40 max-w-[200px]">
                    {currentProgress === 100
                      ? "Menyiapkan link untuk kamu..."
                      : "Mohon tunggu sebentar, file kamu sedang diproses..."}
                  </p>
                </div>

                {/* Small indicator bar */}
                <div className="w-48 h-1 rounded-full overflow-hidden bg-white/5 border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentProgress}%` }}
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500"
                  />
                </div>

                {/* Cancel Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAbort}
                  className="mt-4 px-6 py-2 rounded-xl font-body text-xs border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Batal Upload
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
