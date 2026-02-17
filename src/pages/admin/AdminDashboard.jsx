import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../data/useStore";
import AddPhotoModal from "./AddPhotoModal";
import AddChapterModal from "./AddChapterModal";
import EditPhotoModal from "./EditPhotoModal";
import PublishButton from "./PublishButton";
import GitHubSettings from "./GithubSettings";

const ACCENT = "#e8c4a0";

function GlassCard({ children, className = "", style = {} }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", ...style }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <GlassCard className="p-5 text-center">
      <div className="font-display text-3xl mb-1" style={{ color: accent || ACCENT, fontWeight: 300 }}>{value}</div>
      <div className="font-body text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
    </GlassCard>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { chapters, allPhotos, deleteChapter, deletePhoto } = useStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [editPhoto, setEditPhoto] = useState(null);
  const [addPhotoToChapter, setAddPhotoToChapter] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);

  const handleLogout = () => { sessionStorage.removeItem("memoire_admin"); navigate("/admin"); };
  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "chapter") deleteChapter(deleteConfirm.id);
    if (deleteConfirm.type === "photo") deletePhoto(deleteConfirm.chapterId, deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "chapters", label: "Chapters", icon: "◉" },
    { id: "photos", label: "All Photos", icon: "◎" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #080810 0%, #0f0e1f 50%, #0d1220 100%)" }}>
      <div className="fixed w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, #3d2b6e, transparent)", filter: "blur(90px)", opacity: 0.15, top: "-100px", left: "-100px" }} />
      <div className="fixed w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, #1a3a5c, transparent)", filter: "blur(90px)", opacity: 0.15, bottom: "5%", right: "-80px" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-display"
              style={{ background: "rgba(232,196,160,0.1)", border: "1px solid rgba(232,196,160,0.3)", color: ACCENT }}>✦</div>
            <div>
              <h1 className="font-display text-xl" style={{ color: "rgba(255,255,255,0.9)", fontWeight: 400 }}>Memoire Admin</h1>
              <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>Dashboard Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowGitHubSettings(true)}
              className="px-3 py-2 rounded-xl font-body text-xs transition-all duration-200 flex items-center gap-2"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </button>

            <PublishButton onOpenSettings={() => setShowGitHubSettings(true)} />

            <a href="/" target="_blank"
              className="px-3 py-2 rounded-xl font-body text-xs transition-all duration-200 flex items-center gap-2"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Lihat Site
            </a>
            <button onClick={handleLogout} className="px-3 py-2 rounded-xl font-body text-xs transition-all duration-200"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
              Logout
            </button>
          </div>
        </motion.div>

        {!localStorage.getItem("memoire_github_token") && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-5 py-3.5 rounded-xl flex items-center justify-between gap-4"
            style={{ background: "rgba(232,196,160,0.06)", border: "1px solid rgba(232,196,160,0.18)" }}>
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8c4a0" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="font-body text-xs" style={{ color: "rgba(232,196,160,0.8)" }}>
                <strong>GitHub belum disetup.</strong> Setup sekali untuk bisa publish foto ke semua orang secara otomatis.
              </p>
            </div>
            <button onClick={() => setShowGitHubSettings(true)}
              className="shrink-0 px-4 py-2 rounded-xl font-body text-xs transition-all"
              style={{ background: "rgba(232,196,160,0.12)", border: "1px solid rgba(232,196,160,0.3)", color: "#e8c4a0" }}>
              Setup Sekarang →
            </button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-xl font-body text-sm transition-all duration-300 flex items-center gap-2"
              style={{
                background: activeTab === tab.id ? "rgba(232,196,160,0.12)" : "rgba(255,255,255,0.04)",
                border: activeTab === tab.id ? "1px solid rgba(232,196,160,0.35)" : "1px solid rgba(255,255,255,0.08)",
                color: activeTab === tab.id ? ACCENT : "rgba(255,255,255,0.45)",
              }}>
              <span>{tab.icon}</span><span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Chapter" value={chapters.length} />
              <StatCard label="Total Foto" value={allPhotos.length} accent="#c084fc" />
              <StatCard label="Tags Unik" value={[...new Set(allPhotos.flatMap((p) => p.tags || []))].length} accent="#38bdf8" />
              <StatCard label="Foto Terbaru" value={allPhotos.slice(-1)[0]?.date || "—"} accent="#fb923c" />
            </div>

            <GlassCard className="p-6 mb-6">
              <h3 className="font-display text-lg mb-4" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>Alur Publish Foto</h3>
              <div className="flex items-start gap-0 flex-wrap sm:flex-nowrap">
                {[
                  { step: "1", label: "Tambah Foto", desc: "Isi form dengan link foto, judul, caption, tags", color: "#e8c4a0" },
                  { step: "2", label: "Preview", desc: "Foto langsung muncul di website kamu (local)", color: "#c084fc" },
                  { step: "3", label: "Publish", desc: "Klik tombol Publish → otomatis push ke GitHub", color: "#38bdf8" },
                  { step: "4", label: "Live!", desc: "Vercel rebuild ~30 detik → semua orang lihat", color: "#4ade80" },
                ].map((s, i) => (
                  <div key={s.step} className="flex items-start gap-0 flex-1">
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm shrink-0"
                        style={{ background: `${s.color}15`, border: `1px solid ${s.color}35`, color: s.color }}>
                        {s.step}
                      </div>
                      <div className="text-center px-2">
                        <p className="font-body text-xs font-medium mb-1" style={{ color: s.color }}>{s.label}</p>
                        <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem" }}>{s.desc}</p>
                      </div>
                    </div>
                    {i < 3 && <div className="w-6 h-px mt-4 shrink-0" style={{ background: "rgba(255,255,255,0.1)" }} />}
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <GlassCard className="p-6">
                <h3 className="font-display text-lg mb-2" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>Tambah Foto Baru</h3>
                <p className="font-body text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)", lineHeight: "1.7" }}>Upload foto ke chapter yang sudah ada dengan link URL.</p>
                <button onClick={() => setShowAddPhoto(true)} className="w-full py-3 rounded-xl font-body text-sm transition-all duration-300"
                  style={{ background: "rgba(232,196,160,0.1)", border: "1px solid rgba(232,196,160,0.3)", color: ACCENT }}>
                  + Tambah Foto
                </button>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="font-display text-lg mb-2" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>Buat Chapter Baru</h3>
                <p className="font-body text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)", lineHeight: "1.7" }}>Buat kategori/chapter baru untuk koleksi foto.</p>
                <button onClick={() => setShowAddChapter(true)} className="w-full py-3 rounded-xl font-body text-sm transition-all duration-300"
                  style={{ background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.3)", color: "#c084fc" }}>
                  + Buat Chapter
                </button>
              </GlassCard>
            </div>

            <GlassCard className="p-6">
              <h3 className="font-display text-lg mb-4" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>Foto Terbaru</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allPhotos.slice(-8).reverse().map((photo) => {
                  const chapter = chapters.find((c) => c.id === photo.chapter);
                  return (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/400x300/1a1a2e/ffffff?text=?"; }} />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
                        <p className="font-body text-xs text-white truncate">{photo.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {allPhotos.length === 0 && (
                <p className="text-center font-body text-sm py-8" style={{ color: "rgba(255,255,255,0.25)" }}>Belum ada foto. Tambahkan foto pertama!</p>
              )}
            </GlassCard>
          </motion.div>
        )}

        {activeTab === "chapters" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl" style={{ color: "rgba(255,255,255,0.88)", fontWeight: 300 }}>Semua Chapter</h2>
              <button onClick={() => setShowAddChapter(true)} className="px-4 py-2.5 rounded-xl font-body text-sm transition-all duration-300 flex items-center gap-2"
                style={{ background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.3)", color: "#c084fc" }}>
                + Chapter Baru
              </button>
            </div>
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <GlassCard key={chapter.id}>
                  <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ background: `${chapter.accentColor}15`, border: `1px solid ${chapter.accentColor}30` }}>
                        {chapter.emoji}
                      </div>
                      <div>
                        <h3 className="font-display text-lg" style={{ color: chapter.accentColor, fontWeight: 400 }}>{chapter.label}</h3>
                        <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{chapter.years} · {chapter.photos.length} foto</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setAddPhotoToChapter(chapter.id); setShowAddPhoto(true); }}
                        className="px-3 py-1.5 rounded-lg font-body text-xs transition-all duration-200"
                        style={{ background: `${chapter.accentColor}12`, border: `1px solid ${chapter.accentColor}30`, color: chapter.accentColor }}>
                        + Foto
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: "chapter", id: chapter.id, label: chapter.label }); }}
                        className="px-3 py-1.5 rounded-lg font-body text-xs"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                        Hapus
                      </button>
                      <span style={{ color: "rgba(255,255,255,0.3)", display: "block", transform: expandedChapter === chapter.id ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                      </span>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedChapter === chapter.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="p-5">
                          {chapter.photos.length === 0 ? (
                            <p className="text-center py-6 font-body text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>Belum ada foto.</p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {chapter.photos.map((photo) => (
                                <div key={photo.id} className="group relative rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                                  <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x300/1a1a2e/ffffff?text=Error"; }} />
                                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                                      <p className="font-body text-xs text-white text-center leading-tight">{photo.title}</p>
                                      <div className="flex gap-1.5">
                                        <button onClick={() => setEditPhoto({ photo, chapterId: chapter.id })}
                                          className="px-2.5 py-1 rounded-lg font-body text-xs" style={{ background: `${chapter.accentColor}22`, border: `1px solid ${chapter.accentColor}44`, color: chapter.accentColor }}>
                                          Edit
                                        </button>
                                        <button onClick={() => setDeleteConfirm({ type: "photo", id: photo.id, chapterId: chapter.id, label: photo.title })}
                                          className="px-2.5 py-1 rounded-lg font-body text-xs" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                                          Hapus
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "photos" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl" style={{ color: "rgba(255,255,255,0.88)", fontWeight: 300 }}>Semua Foto ({allPhotos.length})</h2>
              <button onClick={() => setShowAddPhoto(true)} className="px-4 py-2.5 rounded-xl font-body text-sm transition-all duration-300 flex items-center gap-2"
                style={{ background: "rgba(232,196,160,0.1)", border: "1px solid rgba(232,196,160,0.3)", color: ACCENT }}>
                + Tambah Foto
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPhotos.map((photo) => {
                const chapter = chapters.find((c) => c.id === photo.chapter);
                return (
                  <GlassCard key={photo.id} className="overflow-hidden">
                    <div className="relative" style={{ aspectRatio: "16/9" }}>
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/800x450/1a1a2e/ffffff?text=Image+Error"; }} />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg font-body text-xs"
                        style={{ background: `${chapter?.accentColor || ACCENT}22`, border: `1px solid ${chapter?.accentColor || ACCENT}44`, color: chapter?.accentColor || ACCENT }}>
                        {chapter?.emoji} {chapter?.label}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-display text-base mb-1" style={{ color: "rgba(255,255,255,0.88)" }}>{photo.title}</h4>
                      <p className="font-body text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>{photo.date}</p>
                      {photo.caption && <p className="font-body text-xs mb-3 italic" style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.6" }}>"{photo.caption}"</p>}
                      {photo.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {photo.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full font-body" style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => setEditPhoto({ photo, chapterId: photo.chapter })} className="flex-1 py-2 rounded-xl font-body text-xs transition-all"
                          style={{ background: "rgba(232,196,160,0.08)", border: "1px solid rgba(232,196,160,0.2)", color: ACCENT }}>Edit</button>
                        <button onClick={() => setDeleteConfirm({ type: "photo", id: photo.id, chapterId: photo.chapter, label: photo.title })} className="flex-1 py-2 rounded-xl font-body text-xs transition-all"
                          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", color: "#fca5a5" }}>Hapus</button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {showAddPhoto && <AddPhotoModal chapters={chapters} defaultChapterId={addPhotoToChapter} onClose={() => { setShowAddPhoto(false); setAddPhotoToChapter(null); }} />}
      {showAddChapter && <AddChapterModal onClose={() => setShowAddChapter(false)} />}
      {editPhoto && <EditPhotoModal photo={editPhoto.photo} chapterId={editPhoto.chapterId} chapters={chapters} onClose={() => setEditPhoto(null)} />}
      {showGitHubSettings && <GitHubSettings onClose={() => setShowGitHubSettings(false)} />}

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-7 rounded-2xl" onClick={(e) => e.stopPropagation()}
              style={{ background: "rgba(15,14,31,0.95)", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </div>
              <h3 className="font-display text-xl text-center mb-2" style={{ color: "rgba(255,255,255,0.9)", fontWeight: 300 }}>
                Hapus {deleteConfirm.type === "chapter" ? "Chapter" : "Foto"}?
              </h3>
              <p className="font-body text-sm text-center mb-6" style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.7" }}>
                <span style={{ color: "#fca5a5" }}>"{deleteConfirm.label}"</span> akan dihapus permanen.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl font-body text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>Batal</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-3 rounded-xl font-body text-sm"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}