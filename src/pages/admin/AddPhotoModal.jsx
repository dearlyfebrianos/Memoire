import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../data/useStore";
import { isVideoUrl, getMediaType } from "../../data/githubSync";

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
};

function focusStyle(accent) {
  return { borderColor: `${accent}55`, boxShadow: `0 0 0 3px ${accent}10` };
}

export default function AddPhotoModal({ chapters, defaultChapterId, onClose }) {
  const { addPhoto } = useStore();
  const [chapterId, setChapterId] = useState(
    defaultChapterId || chapters[0]?.id || "",
  );
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [mediaInputs, setMediaInputs] = useState([{ url: "", type: "auto" }]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(null);
  const [mediaErrors, setMediaErrors] = useState({});

  const accent =
    chapters.find((c) => c.id === chapterId)?.accentColor || "#e8c4a0";

  const setMediaUrl = (i, val) => {
    const arr = [...mediaInputs];
    arr[i] = {
      url: val,
      type: val.trim() ? (isVideoUrl(val) ? "video" : "image") : "auto",
    };
    setMediaInputs(arr);
    setMediaErrors((e) => {
      const n = { ...e };
      delete n[i];
      return n;
    });
  };

  const addMediaField = () =>
    setMediaInputs([...mediaInputs, { url: "", type: "auto" }]);

  const removeMediaField = (i) => {
    if (mediaInputs.length === 1) {
      setMediaUrl(0, "");
      return;
    }
    setMediaInputs(mediaInputs.filter((_, idx) => idx !== i));
    if (previewIdx === i) setPreviewIdx(null);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };
  const onTagKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const validItems = mediaInputs.filter((m) => m.url.trim() !== "");
  const canSave = title.trim() && validItems.length > 0 && chapterId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);

    const mediaItems = validItems.map((m) => ({
      type: m.type === "auto" ? getMediaType(m.url) : m.type,
      url: m.url.trim(),
    }));

    try {
      // addPhoto now triggers autoSync which returns a promise in our logic
      await addPhoto(chapterId, { title, caption, mediaItems, date, tags });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setSaving(false);
      alert("Failed to save: " + err.message);
    }
  };

  const videoCount = validItems.filter(
    (m) => m.type === "video" || isVideoUrl(m.url),
  ).length;
  const imageCount = validItems.length - videoCount;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl rounded-3xl overflow-hidden"
          style={{
            background: "rgba(10,10,22,0.97)",
            border: `1px solid ${accent}25`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2
                className="font-display text-2xl"
                style={{ color: "rgba(255,255,255,0.9)", fontWeight: 300 }}
              >
                Tambah Kenangan
              </h2>
              <p
                className="font-body text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Bisa campurkan foto & video sekaligus
              </p>
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

          {success ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(74,222,128,0.1)",
                  border: "1px solid rgba(74,222,128,0.3)",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p
                className="font-display text-xl"
                style={{ color: "rgba(255,255,255,0.8)", fontWeight: 300 }}
              >
                Kenangan berhasil disimpan!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Chapter *
                </label>
                <div className="flex flex-wrap gap-2">
                  {chapters.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChapterId(ch.id)}
                      className="px-3 py-2 rounded-xl font-body text-xs flex items-center gap-1.5"
                      style={{
                        background:
                          chapterId === ch.id
                            ? `${ch.accentColor}18`
                            : "rgba(255,255,255,0.04)",
                        border:
                          chapterId === ch.id
                            ? `1px solid ${ch.accentColor}45`
                            : "1px solid rgba(255,255,255,0.08)",
                        color:
                          chapterId === ch.id
                            ? ch.accentColor
                            : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {ch.emoji} {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label
                      className="font-body text-xs uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Link Foto / Video *
                    </label>
                    {validItems.length > 0 && (
                      <span
                        className="ml-2 font-body text-xs"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        {imageCount > 0 && `${imageCount} foto`}
                        {imageCount > 0 && videoCount > 0 && " · "}
                        {videoCount > 0 && `${videoCount} video`}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addMediaField}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg font-body text-xs"
                    style={{
                      background: `${accent}10`,
                      border: `1px solid ${accent}25`,
                      color: accent,
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Tambah
                  </button>
                </div>

                <div
                  className="mb-3 px-3 py-2 rounded-xl flex items-start gap-2"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    style={{ marginTop: "1px", flexShrink: 0 }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p
                    className="font-body leading-relaxed"
                    style={{
                      fontSize: "0.65rem",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    Mendukung:{" "}
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>
                      link foto biasa
                    </span>
                    ,{" "}
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>
                      YouTube
                    </span>{" "}
                    (youtube.com/watch atau youtu.be),{" "}
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>
                      Google Drive
                    </span>
                    , file .mp4/.webm. Auto-detect otomatis.
                  </p>
                </div>

                <div className="space-y-2">
                  {mediaInputs.map((item, i) => {
                    const detectedType = item.url.trim()
                      ? getMediaType(item.url)
                      : null;
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex gap-2 items-center">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background:
                                detectedType === "video"
                                  ? `${accent}15`
                                  : detectedType === "image"
                                    ? "rgba(255,255,255,0.06)"
                                    : "rgba(255,255,255,0.04)",
                              border: detectedType
                                ? `1px solid ${detectedType === "video" ? accent + "40" : "rgba(255,255,255,0.12)"}`
                                : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {detectedType === "video" ? (
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill={accent}
                              >
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            ) : detectedType === "image" ? (
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="rgba(255,255,255,0.4)"
                                strokeWidth="2"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="2"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            ) : (
                              <span
                                className="font-body"
                                style={{
                                  fontSize: "0.55rem",
                                  color: "rgba(255,255,255,0.25)",
                                }}
                              >
                                {i + 1}
                              </span>
                            )}
                          </div>

                          <input
                            style={inputStyle}
                            type="url"
                            placeholder="https://youtube.com/watch?v=... atau https://i.ibb.co/..."
                            value={item.url}
                            onChange={(e) => setMediaUrl(i, e.target.value)}
                            onFocus={(e) =>
                              Object.assign(e.target.style, focusStyle(accent))
                            }
                            onBlur={(e) => {
                              e.target.style.borderColor =
                                "rgba(255,255,255,0.1)";
                              e.target.style.boxShadow = "none";
                            }}
                          />

                          {item.url.trim() && detectedType === "image" && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewIdx(previewIdx === i ? null : i)
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                background:
                                  previewIdx === i
                                    ? `${accent}18`
                                    : "rgba(255,255,255,0.05)",
                                border: `1px solid ${previewIdx === i ? accent + "40" : "rgba(255,255,255,0.1)"}`,
                                color:
                                  previewIdx === i
                                    ? accent
                                    : "rgba(255,255,255,0.35)",
                              }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeMediaField(i)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: "rgba(239,68,68,0.07)",
                              border: "1px solid rgba(239,68,68,0.15)",
                              color: "#fca5a5",
                            }}
                          >
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>

                        {detectedType && (
                          <p
                            className="ml-10 font-body"
                            style={{
                              fontSize: "0.6rem",
                              color:
                                detectedType === "video"
                                  ? accent
                                  : "rgba(255,255,255,0.3)",
                            }}
                          >
                            {detectedType === "video"
                              ? "▶ Terdeteksi sebagai VIDEO"
                              : "🖼 Terdeteksi sebagai FOTO"}
                          </p>
                        )}

                        <AnimatePresence>
                          {previewIdx === i &&
                            item.url.trim() &&
                            detectedType === "image" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="ml-10 overflow-hidden rounded-xl"
                              >
                                {mediaErrors[i] ? (
                                  <div
                                    className="h-20 flex items-center justify-center rounded-xl"
                                    style={{
                                      background: "rgba(239,68,68,0.08)",
                                      border: "1px solid rgba(239,68,68,0.2)",
                                    }}
                                  >
                                    <p
                                      className="font-body text-xs"
                                      style={{ color: "#fca5a5" }}
                                    >
                                      URL tidak dapat dimuat
                                    </p>
                                  </div>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={`preview-${i}`}
                                    referrerPolicy="no-referrer"
                                    className="w-full max-h-40 object-cover rounded-xl"
                                    onError={() =>
                                      setMediaErrors((e) => ({
                                        ...e,
                                        [i]: true,
                                      }))
                                    }
                                  />
                                )}
                              </motion.div>
                            )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {validItems.length > 1 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {validItems.map((m, i) => (
                      <div
                        key={i}
                        className="rounded-lg overflow-hidden flex items-center justify-center"
                        style={{
                          width: "48px",
                          height: "48px",
                          border: `1px solid ${accent}30`,
                          background: "rgba(0,0,0,0.3)",
                          flexShrink: 0,
                        }}
                      >
                        {isVideoUrl(m.url) ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={accent}
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        ) : (
                          <img
                            src={m.url}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={() => {}}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Judul *
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="contoh: Kenangan 9 Februari"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={(e) =>
                    Object.assign(e.target.style, focusStyle(accent))
                  }
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Caption
                </label>
                <textarea
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "72px",
                    lineHeight: "1.6",
                  }}
                  placeholder="Cerita di balik kenangan ini..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  onFocus={(e) =>
                    Object.assign(e.target.style, focusStyle(accent))
                  }
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Tanggal
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="contoh: Februari 2026"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onFocus={(e) =>
                    Object.assign(e.target.style, focusStyle(accent))
                  }
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Enter atau koma untuk tambah tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={onTagKey}
                    onFocus={(e) =>
                      Object.assign(e.target.style, focusStyle(accent))
                    }
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 rounded-xl font-body text-xs shrink-0"
                    style={{
                      background: `${accent}12`,
                      border: `1px solid ${accent}30`,
                      color: accent,
                    }}
                  >
                    + Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs cursor-pointer hover:opacity-70"
                        style={{
                          background: `${accent}15`,
                          border: `1px solid ${accent}30`,
                          color: accent,
                        }}
                      >
                        {tag}
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-body text-sm"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!canSave || saving}
                  className="flex-1 py-3 rounded-xl font-body text-sm flex items-center justify-center gap-2"
                  style={{
                    background: canSave
                      ? `${accent}18`
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${canSave ? accent + "40" : "rgba(255,255,255,0.06)"}`,
                    color: canSave ? accent : "rgba(255,255,255,0.2)",
                    cursor: canSave ? "pointer" : "not-allowed",
                  }}
                >
                  {saving ? (
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
                      Menyimpan...
                    </>
                  ) : (
                    `Simpan ${validItems.length > 1 ? `(${validItems.length} media)` : "Kenangan"}`
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
