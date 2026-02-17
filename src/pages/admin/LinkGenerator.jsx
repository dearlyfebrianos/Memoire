import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const IMGBB_KEY_STORAGE = "memoire_imgbb_key";
const PIXELDRAIN_KEY_STORAGE = "memoire_pixeldrain_key";
const ACCENT = "#e8c4a0";

function getImgbbKey() {
  return localStorage.getItem(IMGBB_KEY_STORAGE) || "";
}

function getPixeldrainKey() {
  return localStorage.getItem(PIXELDRAIN_KEY_STORAGE) || "";
}

async function uploadToImgBB(file, apiKey) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result.split(",")[1];
        const formData = new FormData();
        formData.append("key", apiKey);
        formData.append("image", base64);
        formData.append("name", file.name.replace(/\.[^/.]+$/, ""));

        const res = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err?.error?.message || "Upload gagal");
        }

        const data = await res.json();
        console.log("ImgBB Response:", data); // Helpful for the user to debug in console

        // ImgBB API structure:
        // data.data.image.url -> Direct raw image link (i.ibb.co)
        // data.data.display_url -> Direct display link (usually same as i.ibb.co)
        // data.data.url -> Often the VIEWER page link (ibb.co)

        const direct =
          data.data.image?.url || data.data.display_url || data.data.url;
        const viewer = data.data.url_viewer || data.data.url;

        resolve({
          url: viewer,
          directUrl: direct,
          thumbUrl: data.data.thumb?.url || direct,
          deleteUrl: data.data.delete_url,
          filename: file.name,
          size: file.size,
          width: data.data.width,
          height: data.data.height,
          type: "image",
        });
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

async function uploadToPixeldrain(file, apiKey) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  if (apiKey) {
    // Pixeldrain uses Basic Auth: user="", password=api_key
    headers["Authorization"] = "Basic " + btoa(":" + apiKey);
  }

  const res = await fetch("https://pixeldrain.com/api/file", {
    method: "POST",
    body: formData,
    headers,
    credentials: "omit",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Pixeldrain error:", errorText);

    if (res.status === 401) {
      throw new Error(
        "Pixeldrain Error: API Key tidak valid atau diperlukan. Pastikan kamu sudah memasukkan API Key di pengaturan.",
      );
    }

    throw new Error(`Gagal upload video: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const fileId = data.id;

  // Pixeldrain direct link structure: https://pixeldrain.com/api/file/[id]
  // This link works well for <video> tags
  return {
    url: `https://pixeldrain.com/u/${fileId}`,
    directUrl: `https://pixeldrain.com/api/file/${fileId}`,
    thumbUrl: "", // Pixeldrain doesn't provide easy thumbnails for video via API
    filename: file.name,
    size: file.size,
    type: "video",
  };
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function LinkGenerator({ onClose }) {
  const [apiKey, setApiKey] = useState(getImgbbKey());
  const [pdKey, setPdKey] = useState(getPixeldrainKey());
  const [showSetup, setShowSetup] = useState(
    !getImgbbKey() || !getPixeldrainKey(),
  );
  const [files, setFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const fileInputRef = useRef(null);

  const handleSaveKeys = () => {
    localStorage.setItem(IMGBB_KEY_STORAGE, apiKey.trim());
    localStorage.setItem(PIXELDRAIN_KEY_STORAGE, pdKey.trim());
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
      if (!item) return;

      const key = getImgbbKey();

      // If image but no key, skip and mark as error
      if (item.type === "image" && !key) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "error",
                  error: "Setup API Key dulu untuk upload gambar.",
                }
              : f,
          ),
        );
        setShowSetup(true);
        setUploadQueue((prev) => prev.slice(1));
        return;
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "uploading" } : f)),
      );

      try {
        let result;
        if (item.type === "image") {
          result = await uploadToImgBB(item.file, getImgbbKey());
        } else {
          result = await uploadToPixeldrain(item.file, getPixeldrainKey());
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "done", result } : f,
          ),
        );
        setResults((prev) => [{ ...result, id: item.id }, ...prev]);
      } catch (e) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "error", error: e.message } : f,
          ),
        );
      }

      setUploadQueue((prev) => prev.slice(1));
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
        onClick={onClose}
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
                onClick={() => setShowSetup(!showSetup)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                title="Pengaturan API Key"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
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
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: "rgba(232,196,160,0.06)",
                        border: "1px solid rgba(232,196,160,0.15)",
                      }}
                    >
                      <p
                        className="font-body text-xs leading-relaxed"
                        style={{ color: "rgba(232,196,160,0.8)" }}
                      >
                        <strong>Info Upload:</strong>
                        <br />
                        - **Gambar:** Menggunakan ImgBB (perlu API Key).
                        <br />- **Video:** Menggunakan Pixeldrain (Otomatis,
                        tanpa setup).
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          className="block font-body text-xs mb-2 uppercase tracking-widest"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          ImgBB API Key (Gambar)
                        </label>
                        <input
                          style={inputStyle}
                          type="text"
                          placeholder="Paste ImgBB Key..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                      </div>

                      <div>
                        <label
                          className="block font-body text-xs mb-2 uppercase tracking-widest"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          Pixeldrain API Key (Video)
                        </label>
                        <div className="flex gap-2">
                          <input
                            style={inputStyle}
                            type="password"
                            placeholder="Paste Pixeldrain API Key..."
                            value={pdKey}
                            onChange={(e) => setPdKey(e.target.value)}
                          />
                          <button
                            onClick={handleSaveKeys}
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
                        <p className="mt-2 text-[10px] opacity-40 font-body">
                          Dapatkan link di{" "}
                          <a
                            href="https://pixeldrain.com/user/settings"
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            pengaturan Pixeldrain
                          </a>
                        </p>
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
                    Video otomatis di-host di Pixeldrain
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
                      className="p-3 rounded-xl flex gap-3"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black flex items-center justify-center">
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
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-body"
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
                            className="font-body text-xs truncate"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            {r.filename}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={r.directUrl}
                            className="flex-1 font-body text-xs bg-black/30 p-2 rounded-lg outline-none text-white/60"
                          />
                          <button
                            onClick={() => handleCopy(r.directUrl, r.id)}
                            className="px-3 py-2 rounded-lg font-body text-xs"
                            style={{
                              background:
                                copiedId === r.id ? "#4ade8022" : "#38bdf822",
                              color: copiedId === r.id ? "#4ade80" : "#38bdf8",
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
      </motion.div>
    </AnimatePresence>
  );
}
