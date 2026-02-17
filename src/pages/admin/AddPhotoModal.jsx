import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../data/useStore";

export default function AddPhotoModal({ chapters, defaultChapterId, onClose }) {
  const { addPhoto } = useStore();
  const [chapterId, setChapterId] = useState(defaultChapterId || chapters[0]?.id || "");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  // Multi-image: array of url strings
  const [imageUrls, setImageUrls] = useState([""]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  const accent = chapters.find((c) => c.id === chapterId)?.accentColor || "#e8c4a0";

  // ── URL handlers ──
  const setUrl = (i, val) => {
    const arr = [...imageUrls];
    arr[i] = val;
    setImageUrls(arr);
    setImgErrors((e) => { const n = { ...e }; delete n[i]; return n; });
  };
  const addUrlField = () => setImageUrls([...imageUrls, ""]);
  const removeUrlField = (i) => {
    if (imageUrls.length === 1) { setUrl(0, ""); return; }
    const arr = imageUrls.filter((_, idx) => idx !== i);
    setImageUrls(arr);
    if (previewIdx === i) setPreviewIdx(null);
  };

  // ── Tag handlers ──
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };
  const onTagKey = (e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } };

  const validUrls = imageUrls.filter((u) => u.trim() !== "");
  const canSave = title.trim() && validUrls.length > 0 && chapterId;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setTimeout(() => {
      addPhoto(chapterId, { title, caption, imageUrls: validUrls, date, tags });
      setSuccess(true);
      setTimeout(onClose, 1200);
    }, 600);
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
          className="w-full max-w-2xl rounded-3xl overflow-hidden"
          style={{ background: "rgba(10,10,22,0.92)", backdropFilter: "blur(40px)", border: `1px solid ${accent}25`, boxShadow: "0 30px 80px rgba(0,0,0,0.7)", maxHeight: "90vh", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h2 className="font-display text-2xl" style={{ color: "rgba(255,255,255,0.9)", fontWeight: 300 }}>Tambah Foto</h2>
              <p className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Bisa masukkan lebih dari 1 link foto</p>
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
              <p className="font-display text-xl" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 300 }}>
                Foto berhasil ditambahkan!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Chapter selector */}
              <div>
                <label className="block font-body text-xs mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Chapter *</label>
                <div className="flex flex-wrap gap-2">
                  {chapters.map((ch) => (
                    <button key={ch.id} type="button" onClick={() => setChapterId(ch.id)}
                      className="px-3 py-2 rounded-xl font-body text-xs transition-all duration-200 flex items-center gap-1.5"
                      style={{
                        background: chapterId === ch.id ? `${ch.accentColor}18` : "rgba(255,255,255,0.04)",
                        border: chapterId === ch.id ? `1px solid ${ch.accentColor}45` : "1px solid rgba(255,255,255,0.08)",
                        color: chapterId === ch.id ? ch.accentColor : "rgba(255,255,255,0.4)",
                      }}>
                      {ch.emoji} {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── MULTI IMAGE URLS ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-body text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Link Foto (URL) * — bisa lebih dari 1
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
                    <div key={i} className="space-y-1.5">
                      <div className="flex gap-2 items-center">
                        {/* Index badge */}
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-body text-xs"
                          style={{ background: `${accent}12`, border: `1px solid ${accent}25`, color: accent }}>
                          {i + 1}
                        </div>
                        <input style={inputStyle} type="url" placeholder={`https://images.unsplash.com/photo-...?w=800`}
                          value={url} onChange={(e) => setUrl(i, e.target.value)}
                          onFocus={(e) => { e.target.style.borderColor = `${accent}55`; e.target.style.boxShadow = `0 0 0 3px ${accent}10`; }}
                          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
                        {/* Preview toggle */}
                        {url.trim() && (
                          <button type="button" onClick={() => setPreviewIdx(previewIdx === i ? null : i)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                            style={{ background: previewIdx === i ? `${accent}18` : "rgba(255,255,255,0.05)", border: `1px solid ${previewIdx === i ? accent + "40" : "rgba(255,255,255,0.1)"}`, color: previewIdx === i ? accent : "rgba(255,255,255,0.35)" }}
                            title="Preview">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        )}
                        {/* Remove */}
                        <button type="button" onClick={() => removeUrlField(i)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#fca5a5" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>

                      {/* Inline preview */}
                      <AnimatePresence>
                        {previewIdx === i && url.trim() && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="ml-9 overflow-hidden rounded-xl">
                            {imgErrors[i] ? (
                              <div className="h-20 flex items-center justify-center rounded-xl"
                                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                <p className="font-body text-xs" style={{ color: "#fca5a5" }}>URL tidak valid</p>
                              </div>
                            ) : (
                              <img src={url} alt={`preview-${i}`} className="w-full max-h-40 object-cover rounded-xl"
                                onError={() => setImgErrors((e) => ({ ...e, [i]: true }))} />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Thumbnails strip of all valid urls */}
                {validUrls.length > 1 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {validUrls.map((u, i) => (
                      <div key={i} className="rounded-lg overflow-hidden" style={{ width: "48px", height: "48px", border: `1px solid ${accent}30` }}>
                        <img src={u} alt={`thumb-${i}`} className="w-full h-full object-cover" onError={() => {}} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block font-body text-xs mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Judul *</label>
                <input style={inputStyle} type="text" placeholder="contoh: Graduation Day" value={title} onChange={(e) => setTitle(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = `${accent}55`; e.target.style.boxShadow = `0 0 0 3px ${accent}10`; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
              </div>

              {/* Caption */}
              <div>
                <label className="block font-body text-xs mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Caption</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "72px", lineHeight: "1.6" }}
                  placeholder="Cerita singkat di balik foto ini..." value={caption} onChange={(e) => setCaption(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = `${accent}55`; e.target.style.boxShadow = `0 0 0 3px ${accent}10`; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
              </div>

              {/* Date */}
              <div>
                <label className="block font-body text-xs mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Tanggal</label>
                <input style={inputStyle} type="text" placeholder="contoh: Juni 2022" value={date} onChange={(e) => setDate(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = `${accent}55`; e.target.style.boxShadow = `0 0 0 3px ${accent}10`; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-body text-xs mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Tags (Enter atau koma)</label>
                <div className="flex gap-2">
                  <input style={inputStyle} type="text" placeholder="contoh: nature, friends..." value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)} onKeyDown={onTagKey}
                    onFocus={(e) => { e.target.style.borderColor = `${accent}55`; e.target.style.boxShadow = `0 0 0 3px ${accent}10`; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
                  <button type="button" onClick={addTag} className="px-4 py-2 rounded-xl font-body text-xs shrink-0"
                    style={{ background: `${accent}12`, border: `1px solid ${accent}30`, color: accent }}>+ Add</button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <span key={tag} onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
                        {tag}
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-body text-sm"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>
                  Batal
                </button>
                <button type="submit" disabled={!canSave || saving}
                  className="flex-1 py-3 rounded-xl font-body text-sm transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: !canSave ? "rgba(232,196,160,0.04)" : `${accent}18`,
                    border: `1px solid ${!canSave ? "rgba(232,196,160,0.1)" : accent + "40"}`,
                    color: !canSave ? "rgba(232,196,160,0.25)" : accent,
                    cursor: !canSave ? "not-allowed" : "pointer",
                  }}>
                  {saving ? (
                    <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Menyimpan...</>
                  ) : `Simpan ${validUrls.length > 1 ? `(${validUrls.length} foto)` : "Foto"}`}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}