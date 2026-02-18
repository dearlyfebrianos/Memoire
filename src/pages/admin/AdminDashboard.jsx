import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../data/useStore";
import { CREDENTIALS } from "../../data/authData";
import { useAuth, logout } from "../../data/auth";
import { normalizeMediaItems } from "../../data/githubSync";
import AddPhotoModal from "./AddPhotoModal";
import AddChapterModal from "./AddChapterModal";
import EditPhotoModal from "./EditPhotoModal";
import PublishButton from "./PublishButton";
import GitHubSettings from "./GithubSettings";
import LinkGenerator from "./LinkGenerator";
import AdminSidebar from "./AdminSidebar";
import UserManagement from "./UserManagement";

const ACCENT = "#e8c4a0";

function getCover(photo) {
  const items = normalizeMediaItems(photo);
  return items[0] || null;
}

export function GlassCard({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, accent }) {
  return (
    <GlassCard className="p-5 text-center">
      <div
        className="font-display text-3xl mb-1"
        style={{ color: accent || ACCENT, fontWeight: 300 }}
      >
        {value}
      </div>
      <div
        className="font-body text-xs uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
      </div>
    </GlassCard>
  );
}

function PhotoThumb({
  photo,
  accentColor,
  onEdit,
  onDelete,
  onToggleHidden,
  canHide,
}) {
  const [error, setError] = useState(false);
  const cover = getCover(photo);
  const isVideo = cover?.type === "video";
  const mediaItems = normalizeMediaItems(photo);
  const hasMultiple = mediaItems.length > 1;

  return (
    <div className="group relative rounded-xl overflow-hidden aspect-square bg-white/5 border border-white/10">
      <div className="absolute inset-0">
        {isVideo ? (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <span className="text-2xl opacity-40">🎬</span>
          </div>
        ) : cover && !error ? (
          <img
            src={cover.url}
            alt={photo.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center italic text-white/10 text-[10px]">
            No Preview
          </div>
        )}

        {photo.hidden && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="font-display text-[9px] tracking-widest text-[#fca5a5] uppercase px-2 py-0.5 rounded-full border border-[#fca5a5]/30">
              Hidden
            </span>
          </div>
        )}

        {hasMultiple && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[8px] text-white/60 font-body">
            {mediaItems.length}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
          <h4 className="font-display text-[10px] text-white/90 truncate mb-2">
            {photo.title}
          </h4>
          <div className="flex gap-1.5 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleHidden();
              }}
              className="flex-1 py-1 rounded-lg bg-black/40 border border-white/10 text-white/50 text-[9px] uppercase font-bold hover:bg-white/10 transition-all"
              title={photo.hidden ? "Show to Public" : "Hide from Public"}
            >
              {photo.hidden ? "Show" : "Hide"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 py-1 rounded-lg bg-white/10 border border-white/10 text-white/70 text-[9px] uppercase font-bold hover:bg-[#e8c4a0] hover:text-black transition-all"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase font-bold hover:bg-red-500 hover:text-white transition-all"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChapterRow({
  chapter,
  photos,
  onAddPhoto,
  onEditPhoto,
  onDeletePhoto,
  onTogglePhotoHidden,
  onDelete,
  onToggleHidden,
  isExpanded,
  onToggleExpand,
}) {
  return (
    <div className="group">
      <div
        onClick={onToggleExpand}
        className="w-full p-5 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/6 transition-all"
        style={{ borderLeft: `3px solid ${chapter.accentColor}44` }}
      >
        <div className="flex items-center gap-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: `${chapter.accentColor}10`,
              border: `1px solid ${chapter.accentColor}20`,
            }}
          >
            {chapter.emoji}
          </div>
          <div className="text-left">
            <h4 className="font-display text-sm text-white/90 uppercase tracking-[0.2em] mb-0.5">
              {chapter.label}
            </h4>
            <div className="flex items-center gap-2">
              <p className="font-body text-[10px] text-white/30 uppercase tracking-widest">
                {photos.length} Memories
              </p>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <p className="font-body text-[10px] text-white/30 tracking-widest uppercase">
                {chapter.years}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddPhoto();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-[#e8c4a0] hover:border-[#e8c4a0]/30 transition-all"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <div
            className={`transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              opacity="0.2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-3 mt-1 space-y-4 border-x border-b border-white/5 rounded-b-3xl mx-3 bg-white/[0.01]">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <p className="font-body text-[10px] text-white/20 italic max-w-sm">
                  "{chapter.description}"
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleHidden();
                    }}
                    className="px-4 py-2 rounded-xl border border-white/5 text-[10px] text-white/40 uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    {chapter.hidden ? "Set Public" : "Hide Chapter"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="px-4 py-2 rounded-xl border border-red-500/10 text-[10px] text-red-500/50 uppercase tracking-widest hover:bg-red-500/10 transition-all"
                  >
                    Delete Chapter
                  </button>
                </div>
              </div>

              {/* Render actual photos in the chapter */}
              {photos.length === 0 ? (
                <p className="text-center py-8 font-body text-[10px] text-white/10 uppercase tracking-widest">
                  No memories in this chapter yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {photos.map((p) => (
                    <PhotoThumb
                      key={p.id}
                      photo={p}
                      onEdit={() => onEditPhoto(p)}
                      onDelete={() => onDeletePhoto(p)}
                      onToggleHidden={() => onTogglePhotoHidden(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const auth = useAuth();
  const isOwnerRole = auth.isOwner;

  const {
    chapters: allChapters,
    allPhotos: allPhotosRaw,
    publicChapters,
    publicPhotos,
    deleteChapter,
    deletePhoto,
    toggleChapterHidden,
    togglePhotoHidden,
  } = useStore();

  const chapters = isOwnerRole ? allChapters : publicChapters;
  const allPhotos = isOwnerRole ? allPhotosRaw : publicPhotos;

  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem("memoire_admin_tab") || "overview",
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem("memoire_sidebar_collapsed") === "true",
  );

  useEffect(() => {
    localStorage.setItem("memoire_sidebar_collapsed", isSidebarCollapsed);
  }, [isSidebarCollapsed]);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [editPhoto, setEditPhoto] = useState(null);
  const [addPhotoToChapter, setAddPhotoToChapter] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("memoire_admin_tab", activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  // Keyboard Shortcuts: Ctrl + / to toggle sidebar
  // Also restored: Alt+L for logout, Alt+S for Site, Alt+G for GitHub Settings
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Toggle Sidebar
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }

      // Admin Shortcuts
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case "l":
            e.preventDefault();
            handleLogout();
            break;
          case "s":
            e.preventDefault();
            window.open("/", "_blank");
            break;
          case "g":
            e.preventDefault();
            setShowGitHubSettings(true);
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleLogout]);

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "chapter") deleteChapter(deleteConfirm.id);
    if (deleteConfirm.type === "photo")
      deletePhoto(deleteConfirm.chapterId, deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const hiddenChaptersCount = allChapters.filter((c) => c.hidden).length;
  const hiddenChapterIds = new Set(
    allChapters.filter((c) => c.hidden).map((c) => c.id),
  );
  const hiddenPhotosCount = allPhotosRaw.filter(
    (p) => p.hidden && !hiddenChapterIds.has(p.chapter),
  ).length;

  return (
    <div className="min-h-screen flex bg-[#080810] selection:bg-[#e8c4a0]/30">
      {/* Sidebar - Desktop */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "w-20" : "w-64"}`}
      >
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={auth.role}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSidebar(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <AdminSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setShowMobileSidebar(false);
                }}
                userRole={auth.role}
                isCollapsed={false}
                onToggleCollapse={() => setShowMobileSidebar(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-y-auto h-screen custom-scrollbar p-6 sm:p-10 lg:p-14">
        {/* Cinematic Blobs */}
        <div className="fixed w-[600px] h-[600px] rounded-full pointer-events-none bg-sky-500/5 blur-[160px] -top-80 -left-60" />
        <div className="fixed w-[500px] h-[500px] rounded-full pointer-events-none bg-purple-500/5 blur-[140px] bottom-0 right-0" />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Top Bar Navigation (Simplified) */}
          <div className="flex items-center justify-between mb-16 flex-wrap gap-8">
            <div className="flex items-center gap-5 lg:hidden">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="flex items-center gap-5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-display text-2xl text-[#e8c4a0] group-hover:bg-white/10 transition-colors">
                  M
                </div>
                <div className="text-left">
                  <h1 className="font-display text-xl tracking-[0.2em] text-white/90">
                    MEMOIRE
                  </h1>
                  <p className="font-body text-[10px] text-white/20 uppercase tracking-widest">
                    Tap to Open Menu
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-2xl bg-white/3 border border-white/5 flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${isOwnerRole ? "bg-[#e8c4a0] shadow-[0_0_10px_#e8c4a0]" : "bg-purple-400 shadow-[0_0_10px_#c084f]"}`}
                />
                <span className="font-body text-[11px] text-white/70 tracking-widest uppercase font-medium">
                  {auth.username}
                </span>
                <span className="w-[1px] h-3 bg-white/10" />
                <span className="font-body text-[9px] text-white/30 uppercase tracking-widest">
                  {auth.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* GitHub Settings Button */}
              <button
                onClick={() => setShowGitHubSettings(true)}
                title="GitHub Settings (Alt + G)"
                className="w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 flex items-center justify-center gap-2 rounded-2xl bg-[#24292e] border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all active:scale-95"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="hidden md:inline font-body text-xs">
                  GitHub
                </span>
              </button>

              <PublishButton
                onOpenSettings={() => setShowGitHubSettings(true)}
              />

              <button
                onClick={() => setShowLinkGenerator(true)}
                title="Link Generator"
                className="w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-[#e8c4a0] hover:border-[#e8c4a0]/20 transition-all active:scale-95"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="hidden md:inline font-body text-xs">
                  Generator
                </span>
              </button>

              <a
                href="/"
                target="_blank"
                title="View Site (Alt + S)"
                className="w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-sky-400 hover:border-sky-400/20 transition-all active:scale-95"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span className="hidden md:inline font-body text-xs">Site</span>
              </a>

              <button
                onClick={handleLogout}
                title="Logout (Alt + L)"
                className="w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2.5 flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden md:inline font-body text-xs">
                  Logout
                </span>
              </button>
            </div>
          </div>

          {/* Dynamic Content Switching */}
          <AnimatePresence mode="wait">
            {activeTab === "user" ? (
              <motion.div
                key="user"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <UserManagement
                  currentUser={auth.username}
                  isOwner={isOwnerRole}
                  initialCredentials={CREDENTIALS}
                  authGenerator={null} // Deprecated, removed internal usage
                />
              </motion.div>
            ) : activeTab === "overview" ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    label="Live Chapters"
                    value={
                      isOwnerRole ? allChapters.length : publicChapters.length
                    }
                  />
                  <StatCard label="Total Memories" value={allPhotos.length} />
                  {isOwnerRole && (
                    <StatCard
                      label="Hidden Items"
                      value={hiddenChaptersCount + hiddenPhotosCount}
                      accent="#fca5a5"
                    />
                  )}
                  <StatCard
                    label="System Role"
                    value={auth.role.toUpperCase()}
                    accent="#c084fc"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <GlassCard className="md:col-span-2 p-10 flex flex-col justify-center">
                    <h2 className="font-display text-4xl mb-6 font-light text-white/90 tracking-tight leading-tight">
                      Welcome back,{" "}
                      <span className="text-[#e8c4a0]">{auth.username}</span>.
                    </h2>
                    <p className="font-body text-base text-white/30 leading-relaxed max-w-xl italic mb-8">
                      "Memory is a way of holding on to the things you love, the
                      things you are, the things you never want to lose."
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setActiveTab("chapters")}
                        className="px-6 py-3 rounded-2xl bg-[#e8c4a0] text-black font-display text-[10px] uppercase tracking-[0.2em] font-bold hover:shadow-[0_0_20px_rgba(232,196,160,0.2)] transition-all"
                      >
                        Go to Chapters
                      </button>
                      <button
                        onClick={() => setShowAddPhoto(true)}
                        className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-display text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all"
                      >
                        Quick Upload
                      </button>
                    </div>
                  </GlassCard>

                  <div className="space-y-6">
                    <GlassCard
                      className="p-8 group cursor-pointer"
                      onClick={() => setShowAddChapter(true)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4 border border-sky-400/20 group-hover:scale-110 transition-transform">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </div>
                      <h4 className="font-display text-sm text-white/80 uppercase tracking-widest mb-1">
                        New Chapter
                      </h4>
                      <p className="font-body text-[11px] text-white/20">
                        Add a collection for new memories.
                      </p>
                    </GlassCard>
                    <GlassCard
                      className="p-8 group cursor-pointer"
                      onClick={() => setShowLinkGenerator(true)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 border border-purple-400/20 group-hover:scale-110 transition-transform">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                        </svg>
                      </div>
                      <h4 className="font-display text-sm text-white/80 uppercase tracking-widest mb-1">
                        Link Hub
                      </h4>
                      <p className="font-body text-[11px] text-white/20">
                        Generate Cloudinary links easily.
                      </p>
                    </GlassCard>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xs tracking-[0.3em] text-white/20 uppercase">
                      Latest Memories
                    </h3>
                    <button
                      onClick={() => setActiveTab("photos")}
                      className="font-body text-[10px] text-[#e8c4a0] uppercase tracking-widest hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {allPhotos
                      .slice(-6)
                      .reverse()
                      .map((p) => (
                        <PhotoThumb
                          key={p.id}
                          photo={p}
                          onEdit={() =>
                            setEditPhoto({ photo: p, chapterId: p.chapter })
                          }
                          onDelete={() =>
                            setDeleteConfirm({
                              type: "photo",
                              id: p.id,
                              chapterId: p.chapter,
                              label: p.title,
                            })
                          }
                          onToggleHidden={() =>
                            togglePhotoHidden(p.chapter, p.id)
                          }
                        />
                      ))}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === "chapters" ? (
              <motion.div
                key="chapters"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <h3 className="font-display text-2xl tracking-[0.1em] text-white/90 uppercase font-light">
                      Chapters
                    </h3>
                    <p className="font-body text-[11px] text-white/20 uppercase tracking-[0.3em]">
                      Manage your curated collections
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddChapter(true)}
                    className="px-6 py-3 rounded-2xl bg-[#e8c4a0] text-black font-display text-[10px] uppercase tracking-[0.2em] font-bold hover:shadow-[0_0_20px_rgba(232,196,160,0.1)] transition-all"
                  >
                    + New Chapter
                  </button>
                </div>
                <div className="space-y-4">
                  {chapters.map((c) => (
                    <ChapterRow
                      key={c.id}
                      chapter={c}
                      photos={allPhotos.filter((p) => p.chapter === c.id)}
                      onAddPhoto={() => {
                        setAddPhotoToChapter(c.id);
                        setShowAddPhoto(true);
                      }}
                      onEditPhoto={(p) =>
                        setEditPhoto({ photo: p, chapterId: c.id })
                      }
                      onDeletePhoto={(p) =>
                        setDeleteConfirm({
                          type: "photo",
                          id: p.id,
                          chapterId: c.id,
                          label: p.title,
                        })
                      }
                      onTogglePhotoHidden={(p) => togglePhotoHidden(c.id, p.id)}
                      onDelete={() =>
                        setDeleteConfirm({
                          type: "chapter",
                          id: c.id,
                          label: c.label,
                        })
                      }
                      onToggleHidden={() => toggleChapterHidden(c.id)}
                      isExpanded={expandedChapter === c.id}
                      onToggleExpand={() =>
                        setExpandedChapter(
                          expandedChapter === c.id ? null : c.id,
                        )
                      }
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="photos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <h3 className="font-display text-2xl tracking-[0.1em] text-white/90 uppercase font-light">
                      All Memories
                    </h3>
                    <p className="font-body text-[11px] text-white/20 uppercase tracking-[0.3em]">
                      {allPhotos.length} Items Captured
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddPhoto(true)}
                    className="px-6 py-3 rounded-2xl bg-[#e8c4a0] text-black font-display text-[10px] uppercase tracking-[0.2em] font-bold"
                  >
                    + Quick Upload
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {allPhotos.map((p) => (
                    <PhotoThumb
                      key={p.id}
                      photo={p}
                      onEdit={() =>
                        setEditPhoto({ photo: p, chapterId: p.chapter })
                      }
                      onDelete={() =>
                        setDeleteConfirm({
                          type: "photo",
                          id: p.id,
                          chapterId: p.chapter,
                          label: p.title,
                        })
                      }
                      onToggleHidden={() => togglePhotoHidden(p.chapter, p.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals & Popups */}
      {showAddPhoto && (
        <AddPhotoModal
          chapters={chapters}
          defaultChapterId={addPhotoToChapter}
          onClose={() => {
            setShowAddPhoto(false);
            setAddPhotoToChapter(null);
          }}
        />
      )}
      {showAddChapter && (
        <AddChapterModal onClose={() => setShowAddChapter(false)} />
      )}
      {editPhoto && (
        <EditPhotoModal
          photo={editPhoto.photo}
          chapterId={editPhoto.chapterId}
          chapters={chapters}
          onClose={() => setEditPhoto(null)}
        />
      )}
      {showGitHubSettings && (
        <GitHubSettings onClose={() => setShowGitHubSettings(false)} />
      )}
      {showLinkGenerator && (
        <LinkGenerator onClose={() => setShowLinkGenerator(false)} />
      )}

      {/* Modern Deletion Confirmation Overlay */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a0a16]/90 backdrop-blur-xl"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm p-10 rounded-[40px] bg-white/[0.03] border border-red-500/10 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-500">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </div>
              <h3 className="font-display text-2xl text-white/90 mb-2 font-light tracking-tight">
                Hapus{" "}
                {deleteConfirm.type === "chapter" ? "Chapter" : "Kenangan"}?
              </h3>
              <p className="font-body text-xs text-white/30 mb-10 leading-relaxed px-4 italic">
                "{deleteConfirm.label}" akan dihapus dari album selamanya.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white font-display text-[10px] uppercase tracking-widest font-bold shadow-[0_10px_20px_rgba(239,68,68,0.3)]"
                >
                  Iya, Hapus Selamanya
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-display text-[10px] uppercase tracking-widest font-bold"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
