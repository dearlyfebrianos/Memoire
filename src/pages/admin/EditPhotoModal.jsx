import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../data/useStore";

export default function EditPhotoModal({ photo, chapterId, chapters, onClose }) {
  const { updatePhoto } = useStore();
  const chapter = chapters.find((c) => c.id === chapterId);
  const accent = chapter?.accentColor || "#e8c4a0";

  // Normalize: support old imageUrl or new imageUrls
  const initUrls = photo.imageUrls?.length
    ? [...photo.imageUrls]
    : photo.imageUrl
    ? [photo.imageUrl]
    : [""];

  const [title, setTitle] = useState(photo.title || "");
  const [caption, setCaption] = useState(photo.caption || "");
  const [date, setDate] = useState(photo.date || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(photo.tags || []);
  const [imageUrls, setImageUrls] = useState(initUrls);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [imgErrors, setImgErrors] = useState({});

  const setUrl = (i, val) => {
    const arr = [...imageUrls];
    arr[i] = val;
    setImageUrls(arr);
    setImgErrors((e) => { const n = { ...e }; delete n[i]; return n; });
  };
  const addUrlField = () => setImageUrls([...imageUrls, ""]);
  const removeUrlField = (i) => {
    if (imageUrls.length === 1) { setUrl(0, ""); return; }
    setImageUrls(imageUrls.filter((_, idx) => idx !== i));
    if (previewIdx >= imageUrls.length - 1) setPreviewIdx(Math.max(0, previewIdx - 1));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };
  const onTagKey = (e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } };

  const validUrls = imageUrls.filter((u) => u.trim() !== "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !validUrls.length) return;
    setSaving(true);
    setTimeout(() => {
      updatePhoto(chapterId, photo.id, { title, caption, imageUrls: validUrls, date, tags });
      setSuccess(true);
      setTimeout(onClose, 1000);
    }, 500);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "12px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.9)", fontFamily: "DM Sans, sans-serif",
    fontSize: "14px", outline: "none", cursor: "text",
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
        onClick={onClose}>
        <motion.div initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl rounded-3xl"
          style={{ background: "rgba(10,10,22,0.92)", backdropFilter: "blur(40px)", border: `1px solid ${accent}25`, boxShadow: "0 30px 80px rgba(0,0,0,0.7)", maxHeight: "90vh", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}>

          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h2 className="font-display text-2xl" style={{ color: "rgba(255,255,255,0.9)", fontWeight: 300 }}>Edit Foto</h2>
              <p className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{chapter?.emoji} {chapter?.label}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="font-display text-xl" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 300 }}>Tersimpan!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Preview carousel mini */}
              {validUrls.length > 0 && (
                <div>
                  <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: "16/9" }}>
                    <img src={validUrls[previewIdx] || validUrls[0]} alt="preview" className="w-full h-full object-cover"
                      onError={() => setImgErrors((e) => ({ ...e, [previewIdx]: true }))} />
                    {validUrls.length > 1 && (
                      <>
                        <button type="button" onClick={() => setPreviewIdx((previewIdx - 1 + validUrls.length) % validUrls.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${accent}30`, color: accent }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <button type="button" onClick={() => setPreviewIdx((previewIdx + 1) % validUrls.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${accent}30`, color: accent }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {validUrls.map((_, i) => (
                            <button key={i} type="button" onClick={() => setPreviewIdx(i)}
                              className="rounded-full transition-all"
                              style={{ width: i === previewIdx ? "16px" : "6px", height: "6px", background: i === previewIdx ? accent : "rgba(255,255,255,0.4)" }} />
                          ))}
                        </div>
                      </>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg font-body text-xs"
                      style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.7)" }}>
                      {previewIdx + 1} / {validUrls.length}
                    </div>
                  </div>
                </div>
              )}

              {/* ── MULTI IMAGE URLS ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-body text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Link Foto — bisa lebih dari 1
                  </label>
                  <button type="button" onClick={addUrlField}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg font-body text-xs transition-all"
                    style={{ background: `${accent}10`, border: `1px solid ${accent}25`, color: accent }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Link
                  </button>
                </div>
                <div className="space-y-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-body text-xs"
                        style={{ background: `${accent}12`, border: `1px solid ${accent}25`, color: accent }}>{i + 1}</div>
                      <input style={inputStyle} type="url" placeholder={`URL foto ${i + 1}`} value={url}
                        onChange={(e) => setUrl(i, e.target.value)}
                        onFocus={(e) => { e.target.style.borderColor = `${accent}55`; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
                      <button type="button" onClick={() => removeUrlField(i)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#fca5a5" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-body text-xs mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Judul *</label>
                <input style={inputStyle} type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = `${accent}55`; }} onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
              </div>

              {/* Caption */}
              <div>
                <label className="block font-body text-xs mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Caption</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "64px", lineHeight: "1.6" }}
                  value={caption} onChange={(e) => setCaption(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = `${accent}55`; }} onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
              </div>

              {/* Date */}
              <div>
                <label className="block font-body text-xs mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Tanggal</label>
                <input style={inputStyle} type="text" value={date} onChange={(e) => setDate(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = `${accent}55`; }} onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-body text-xs mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Tags</label>
                <div className="flex gap-2">
                  <input style={inputStyle} type="text" placeholder="Tag baru..." value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)} onKeyDown={onTagKey}
                    onFocus={(e) => { e.target.style.borderColor = `${accent}55`; }} onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }} />
                  <button type="button" onClick={addTag} className="px-3 py-2 rounded-xl font-body text-xs shrink-0"
                    style={{ background: `${accent}12`, border: `1px solid ${accent}30`, color: accent }}>+ Add</button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span key={tag} onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="flex items-center gap-1 px-3 py-1 rounded-full font-body text-xs cursor-pointer"
                        style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent, fontSize: "0.7rem" }}>
                        {tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-body text-sm"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-body text-sm transition-all flex items-center justify-center gap-2"
                  style={{ background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}>
                  {saving ? <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Menyimpan...</> : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}