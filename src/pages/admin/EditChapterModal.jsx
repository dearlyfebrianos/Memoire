import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../data/useStore";

const PRESET_EMOJIS = [
  "🎓",
  "📚",
  "✈️",
  "🎵",
  "🏖️",
  "🌿",
  "🎭",
  "🏔️",
  "🎨",
  "💫",
  "🌸",
  "🔥",
  "⚡",
  "🌙",
  "🎬",
  "🏡",
  "🎮",
  "🌊",
];
const PRESET_COLORS = [
  { name: "Purple", value: "#c084fc" },
  { name: "Sky", value: "#38bdf8" },
  { name: "Orange", value: "#fb923c" },
  { name: "Gold", value: "#e8c4a0" },
  { name: "Pink", value: "#f472b6" },
  { name: "Green", value: "#4ade80" },
  { name: "Red", value: "#f87171" },
  { name: "Teal", value: "#2dd4bf" },
];

export default function EditChapterModal({ chapter, onClose }) {
  const { updateChapter } = useStore();
  const [form, setForm] = useState({
    label: chapter?.label || "",
    slug: chapter?.slug || "",
    years: chapter?.years || "",
    description: chapter?.description || "",
    emoji: chapter?.emoji || "📸",
    accentColor: chapter?.accentColor || "#e8c4a0",
    customColor: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCustomEmoji, setShowCustomEmoji] = useState(
    !PRESET_EMOJIS.includes(chapter?.emoji),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label) return;
    setSaving(true);
    try {
      await updateChapter(chapter.id, {
        label: form.label,
        slug: form.slug,
        years: form.years,
        description: form.description,
        emoji: form.emoji,
        accentColor: form.customColor || form.accentColor,
      });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setSaving(false);
      alert("Gagal mengupdate chapter: " + err.message);
    }
  };

  const accent = form.customColor || form.accentColor;

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
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
          style={{
            background: "rgba(10,10,22,0.92)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: `1px solid ${accent}25`,
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h2
                className="font-display text-2xl"
                style={{ color: "rgba(255,255,255,0.9)", fontWeight: 300 }}
              >
                Edit Chapter
              </h2>
              <p
                className="font-body text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Ubah informasi chapter ini
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
                Chapter berhasil diupdate!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Preview card */}
              <div
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: `${accent}08`,
                  border: `1px solid ${accent}20`,
                }}
              >
                <div className="text-3xl">{form.emoji || "📸"}</div>
                <div>
                  <div
                    className="font-display text-lg"
                    style={{ color: accent, fontWeight: 400 }}
                  >
                    {form.label || "Nama Chapter"}
                  </div>
                  <div
                    className="font-body text-xs"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {form.years || "Tahun"}
                  </div>
                </div>
              </div>

              {/* Nama */}
              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Nama Chapter *
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="contoh: Kuliah, Liburan, Keluarga..."
                  value={form.label}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, label: e.target.value }))
                  }
                  onFocus={(e) => {
                    e.target.style.borderColor = `${accent}55`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Slug (URL)
                </label>
                <input
                  style={{ ...inputStyle, color: "rgba(255,255,255,0.5)" }}
                  type="text"
                  placeholder="slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  onFocus={(e) => {
                    e.target.style.borderColor = `${accent}55`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                />
              </div>

              {/* Tahun */}
              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Periode Tahun
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="contoh: 2018 – 2022"
                  value={form.years}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, years: e.target.value }))
                  }
                  onFocus={(e) => {
                    e.target.style.borderColor = `${accent}55`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Deskripsi
                </label>
                <textarea
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "72px",
                    lineHeight: "1.6",
                  }}
                  placeholder="Ceritakan tentang chapter ini..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  onFocus={(e) => {
                    e.target.style.borderColor = `${accent}55`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                />
              </div>

              {/* Emoji */}
              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Emoji
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, emoji: em }));
                        setShowCustomEmoji(false);
                      }}
                      className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:border-white/20"
                      style={{
                        background: form.emoji === em ? `${accent}18` : "",
                        borderColor: form.emoji === em ? `${accent}40` : "",
                      }}
                    >
                      {em}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCustomEmoji(true)}
                    className="w-10 h-10 rounded-xl text-[10px] uppercase font-bold flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:border-white/20 text-white/40"
                    style={{
                      background: showCustomEmoji ? `${accent}18` : "",
                      borderColor: showCustomEmoji ? `${accent}40` : "",
                      color: showCustomEmoji ? accent : "",
                    }}
                  >
                    Other
                  </button>
                </div>

                <AnimatePresence>
                  {showCustomEmoji && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        style={inputStyle}
                        type="text"
                        placeholder="Klik & Masukkan emoji dari keyboard Anda..."
                        maxLength="2"
                        value={
                          PRESET_EMOJIS.includes(form.emoji) ? "" : form.emoji
                        }
                        onChange={(e) =>
                          setForm((f) => ({ ...f, emoji: e.target.value }))
                        }
                        onFocus={(e) => {
                          e.target.style.borderColor = `${accent}55`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accent color */}
              <div>
                <label
                  className="block font-body text-xs mb-2 uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Warna Aksen
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          accentColor: c.value,
                          customColor: "",
                        }))
                      }
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      style={{
                        background: c.value,
                        border:
                          form.accentColor === c.value && !form.customColor
                            ? `2px solid white`
                            : `2px solid transparent`,
                        boxShadow:
                          form.accentColor === c.value
                            ? `0 0 12px ${c.value}60`
                            : "none",
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.customColor || form.accentColor}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customColor: e.target.value }))
                    }
                    className="w-10 h-10 rounded-xl cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "2px",
                    }}
                  />
                  <span
                    className="font-body text-xs"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Atau pilih warna custom
                  </span>
                </div>
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
                  disabled={!form.label || saving}
                  className="flex-1 py-3 rounded-xl font-body text-sm transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: !form.label
                      ? "rgba(232,196,160,0.04)"
                      : `${accent}18`,
                    border: `1px solid ${!form.label ? "rgba(232,196,160,0.1)" : `${accent}40`}`,
                    color: !form.label ? "rgba(232,196,160,0.25)" : accent,
                    cursor: !form.label ? "not-allowed" : "pointer",
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
                    "Simpan Perubahan"
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
