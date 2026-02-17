import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../data/useStore";
import { useAuth, logout } from "../../data/auth";
import { normalizeMediaItems, isVideoUrl } from "../../data/githubSync";
import AddPhotoModal from "./AddPhotoModal";
import AddChapterModal from "./AddChapterModal";
import EditPhotoModal from "./EditPhotoModal";
import PublishButton from "./PublishButton";
import GitHubSettings from "./GithubSettings";

const ACCENT = "#e8c4a0";

function getCover(photo) {
  const items = normalizeMediaItems(photo);
  return items[0] || null;
}

function GlassCard({ children, className = "", style = {} }) {
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

function StatCard({ label, value, accent }) {
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

function HiddenToggle({ isHidden, onToggle }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-200"
      style={{
        background: isHidden ? "rgba(239,68,68,0.1)" : "rgba(74,222,128,0.1)",
        border: `1px solid ${isHidden ? "rgba(239,68,68,0.3)" : "rgba(74,222,128,0.3)"}`,
      }}
      title={isHidden ? "Klik untuk Publik" : "Klik untuk Hide"}
    >
      <div
        className="relative w-8 h-4 rounded-full transition-all duration-300"
        style={{
          background: isHidden ? "rgba(239,68,68,0.4)" : "rgba(74,222,128,0.4)",
        }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300"
          style={{
            left: isHidden ? "2px" : "17px",
            background: isHidden ? "#fca5a5" : "#4ade80",
          }}
        />
      </div>
      <span
        className="font-body text-xs font-medium"
        style={{ color: isHidden ? "#fca5a5" : "#4ade80", minWidth: "40px" }}
      >
        {isHidden ? "Hidden" : "Publik"}
      </span>
    </button>
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
    <div
      className="group relative rounded-xl overflow-hidden"
      style={{ width: "100%", paddingBottom: "75%", position: "relative" }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        {isVideo ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `${accentColor || ACCENT}10` }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={accentColor || ACCENT}
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        ) : cover && !error ? (
          <img
            src={cover.url}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setError(true)}
            style={{ display: "block" }}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-1"
            style={{
              background: `${accentColor || ACCENT}10`,
              border: `1px dashed ${accentColor || ACCENT}25`,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accentColor || ACCENT}
              strokeWidth="1.5"
              style={{ opacity: 0.4 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {photo.hidden && canHide && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(2px)",
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fca5a5"
                strokeWidth="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
              </svg>
              <span
                className="font-body"
                style={{ fontSize: "0.55rem", color: "#fca5a5" }}
              >
                Hidden
              </span>
            </div>
          </div>
        )}

        {hasMultiple && (
          <div
            className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
          >
            <span style={{ fontSize: "0.55rem", color: accentColor || ACCENT }}>
              {mediaItems.length}
            </span>
          </div>
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 p-2"
          style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
          }}
        >
          <p className="font-body text-xs text-white text-center leading-tight mb-1 line-clamp-2">
            {photo.title}
          </p>
          <div className="flex gap-1 flex-wrap justify-center">
            {canHide && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHidden();
                }}
                className="px-2 py-1 rounded-lg font-body text-xs"
                style={{
                  background: photo.hidden
                    ? "rgba(74,222,128,0.2)"
                    : "rgba(239,68,68,0.15)",
                  border: `1px solid ${photo.hidden ? "rgba(74,222,128,0.4)" : "rgba(239,68,68,0.3)"}`,
                  color: photo.hidden ? "#4ade80" : "#fca5a5",
                }}
              >
                {photo.hidden ? "Publik" : "Hide"}
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="px-2 py-1 rounded-lg font-body text-xs"
                style={{
                  background: `${accentColor || ACCENT}22`,
                  border: `1px solid ${accentColor || ACCENT}44`,
                  color: accentColor || ACCENT,
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="px-2 py-1 rounded-lg font-body text-xs"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                }}
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoCard({
  photo,
  chapter,
  onEdit,
  onDelete,
  onToggleHidden,
  canHide,
}) {
  const [imgErr, setImgErr] = useState(false);
  const cover = getCover(photo);
  const isVideo = cover?.type === "video";
  const mediaItems = normalizeMediaItems(photo);
  const multiCount = mediaItems.length;
  const videoCount = mediaItems.filter((m) => m.type === "video").length;

  return (
    <GlassCard
      className="overflow-hidden"
      style={{ opacity: photo.hidden ? 0.65 : 1 }}
    >
      <div
        className="relative"
        style={{ aspectRatio: "16/9", background: "rgba(0,0,0,0.3)" }}
      >
        {isVideo ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `${chapter?.accentColor || ACCENT}08` }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill={chapter?.accentColor || ACCENT}
              style={{ opacity: 0.7 }}
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        ) : cover && !imgErr ? (
          <img
            src={cover.url}
            alt={photo.title}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: `${chapter?.accentColor || ACCENT}08` }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={chapter?.accentColor || ACCENT}
              strokeWidth="1.5"
              style={{ opacity: 0.35 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {photo.hidden && canHide && (
          <div
            className="absolute inset-x-0 top-0 px-3 py-1.5 flex items-center gap-2"
            style={{
              background: "rgba(239,68,68,0.85)",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
            </svg>
            <span className="font-body text-xs text-white">
              Hidden dari publik
            </span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <div
            className="px-2 py-1 rounded-lg font-body text-xs"
            style={{
              background: `${chapter?.accentColor || ACCENT}22`,
              border: `1px solid ${chapter?.accentColor || ACCENT}44`,
              color: chapter?.accentColor || ACCENT,
            }}
          >
            {chapter?.emoji} {chapter?.label}
          </div>
          {videoCount > 0 && (
            <div
              className="px-2 py-1 rounded-lg font-body flex items-center gap-1"
              style={{
                fontSize: "0.6rem",
                background: "rgba(0,0,0,0.6)",
                color: chapter?.accentColor || ACCENT,
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {videoCount > 1 ? videoCount : ""}
            </div>
          )}
          {multiCount > 1 && (
            <div
              className="px-2 py-1 rounded-lg font-body text-xs"
              style={{
                background: "rgba(0,0,0,0.6)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {multiCount}
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <h4
          className="font-display text-base mb-0.5"
          style={{ color: "rgba(255,255,255,0.88)" }}
        >
          {photo.title}
        </h4>
        <p
          className="font-body text-xs mb-2"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {photo.date}
        </p>
        {photo.caption && (
          <p
            className="font-body text-xs mb-3 italic"
            style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.6" }}
          >
            "{photo.caption}"
          </p>
        )}
        {photo.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {photo.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full font-body"
                style={{
                  fontSize: "0.6rem",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          {canHide && (
            <button
              onClick={onToggleHidden}
              className="flex-1 py-2 rounded-xl font-body text-xs transition-all"
              style={{
                background: photo.hidden
                  ? "rgba(74,222,128,0.08)"
                  : "rgba(239,68,68,0.07)",
                border: `1px solid ${photo.hidden ? "rgba(74,222,128,0.25)" : "rgba(239,68,68,0.2)"}`,
                color: photo.hidden ? "#4ade80" : "#fca5a5",
              }}
            >
              {photo.hidden ? "Publik" : "Hide"}
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex-1 py-2 rounded-xl font-body text-xs transition-all"
            style={{
              background: "rgba(232,196,160,0.08)",
              border: "1px solid rgba(232,196,160,0.2)",
              color: ACCENT,
            }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-2 rounded-xl font-body text-xs transition-all"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.18)",
              color: "#fca5a5",
            }}
          >
            Hapus
          </button>
        </div>
      </div>
    </GlassCard>
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

  // Owner sees ALL (including hidden). Admin sees only public (non-hidden).
  const chapters = isOwnerRole ? allChapters : publicChapters;
  const allPhotos = isOwnerRole ? allPhotosRaw : publicPhotos;

  const [activeTab, setActiveTab] = useState("overview");
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [editPhoto, setEditPhoto] = useState(null);
  const [addPhotoToChapter, setAddPhotoToChapter] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "chapter") deleteChapter(deleteConfirm.id);
    if (deleteConfirm.type === "photo")
      deletePhoto(deleteConfirm.chapterId, deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "chapters", label: "Chapters", icon: "◉" },
    { id: "photos", label: "All Photos", icon: "◎" },
  ];

  const hiddenChaptersCount = allChapters.filter((c) => c.hidden).length;
  const hiddenPhotosCount = allPhotosRaw.filter((p) => p.hidden).length;

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #080810 0%, #0f0e1f 50%, #0d1220 100%)",
      }}
    >
      <div
        className="fixed w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #3d2b6e, transparent)",
          filter: "blur(90px)",
          opacity: 0.15,
          top: "-100px",
          left: "-100px",
        }}
      />
      <div
        className="fixed w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #1a3a5c, transparent)",
          filter: "blur(90px)",
          opacity: 0.15,
          bottom: "5%",
          right: "-80px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-3"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-display"
              style={{
                background: "rgba(232,196,160,0.1)",
                border: "1px solid rgba(232,196,160,0.3)",
                color: ACCENT,
              }}
            >
              ✦
            </div>
            <div>
              <h1
                className="font-display text-xl"
                style={{ color: "rgba(255,255,255,0.9)", fontWeight: 400 }}
              >
                Memoire Admin
              </h1>
              <div className="flex items-center gap-2">
                <p
                  className="font-body text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Dashboard · {auth.username}
                </p>
                <span
                  className="px-2 py-0.5 rounded-full font-body"
                  style={{
                    fontSize: "0.6rem",
                    background: isOwnerRole
                      ? "rgba(232,196,160,0.12)"
                      : "rgba(192,132,252,0.12)",
                    border: `1px solid ${isOwnerRole ? "rgba(232,196,160,0.3)" : "rgba(192,132,252,0.3)"}`,
                    color: isOwnerRole ? ACCENT : "#c084fc",
                  }}
                >
                  {isOwnerRole ? "OWNER" : "ADMIN"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowGitHubSettings(true)}
              className="px-3 py-2 rounded-xl font-body text-xs flex items-center gap-1.5"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
            <PublishButton onOpenSettings={() => setShowGitHubSettings(true)} />
            <a
              href="/"
              target="_blank"
              className="px-3 py-2 rounded-xl font-body text-xs flex items-center gap-1.5"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.45)",
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
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Lihat Site
            </a>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl font-body text-xs"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5",
              }}
            >
              Logout
            </button>
          </div>
        </motion.div>

        {!localStorage.getItem("memoire_github_token") && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-5 py-3.5 rounded-xl flex items-center justify-between gap-4"
            style={{
              background: "rgba(232,196,160,0.06)",
              border: "1px solid rgba(232,196,160,0.18)",
            }}
          >
            <p
              className="font-body text-xs"
              style={{ color: "rgba(232,196,160,0.8)" }}
            >
              <strong>GitHub belum disetup.</strong> Setup untuk publish ke
              semua orang secara otomatis.
            </p>
            <button
              onClick={() => setShowGitHubSettings(true)}
              className="shrink-0 px-4 py-2 rounded-xl font-body text-xs"
              style={{
                background: "rgba(232,196,160,0.12)",
                border: "1px solid rgba(232,196,160,0.3)",
                color: ACCENT,
              }}
            >
              Setup →
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 flex-wrap"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-xl font-body text-sm flex items-center gap-2 transition-all duration-300"
              style={{
                background:
                  activeTab === tab.id
                    ? "rgba(232,196,160,0.12)"
                    : "rgba(255,255,255,0.04)",
                border:
                  activeTab === tab.id
                    ? "1px solid rgba(232,196,160,0.35)"
                    : "1px solid rgba(255,255,255,0.08)",
                color: activeTab === tab.id ? ACCENT : "rgba(255,255,255,0.45)",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className={`grid gap-4 mb-8 ${isOwnerRole ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-2"}`}
            >
              <StatCard label="Total Chapter" value={chapters.length} />
              <StatCard
                label="Total Kenangan"
                value={allPhotos.length}
                accent="#c084fc"
              />
              {isOwnerRole && (
                <StatCard
                  label="Chapter Hidden"
                  value={hiddenChaptersCount}
                  accent="#f87171"
                />
              )}
              {isOwnerRole && (
                <StatCard
                  label="Foto Hidden"
                  value={hiddenPhotosCount}
                  accent="#fb923c"
                />
              )}
            </div>

            <GlassCard className="p-6 mb-6">
              <h3
                className="font-display text-lg mb-5"
                style={{ color: "rgba(255,255,255,0.85)", fontWeight: 400 }}
              >
                Alur Publish
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    step: "1",
                    label: "Tambah",
                    desc: "Isi form dengan link foto / video",
                    color: "#e8c4a0",
                  },
                  {
                    step: "2",
                    label: "Preview",
                    desc: "Langsung muncul di website (local)",
                    color: "#c084fc",
                  },
                  {
                    step: "3",
                    label: "Publish",
                    desc: "Klik Publish → push ke GitHub",
                    color: "#38bdf8",
                  },
                  {
                    step: "4",
                    label: "Live!",
                    desc: "Vercel rebuild ~30 detik",
                    color: "#4ade80",
                  },
                ].map((s) => (
                  <div
                    key={s.step}
                    className="flex flex-col items-center text-center gap-2"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm"
                      style={{
                        background: `${s.color}15`,
                        border: `1px solid ${s.color}35`,
                        color: s.color,
                      }}
                    >
                      {s.step}
                    </div>
                    <p
                      className="font-body text-xs font-medium"
                      style={{ color: s.color }}
                    >
                      {s.label}
                    </p>
                    <p
                      className="font-body leading-relaxed"
                      style={{
                        color: "rgba(255,255,255,0.35)",
                        fontSize: "0.68rem",
                      }}
                    >
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <GlassCard className="p-6">
                <h3
                  className="font-display text-lg mb-2"
                  style={{ color: "rgba(255,255,255,0.85)", fontWeight: 400 }}
                >
                  Tambah Kenangan
                </h3>
                <p
                  className="font-body text-xs mb-4"
                  style={{ color: "rgba(255,255,255,0.4)", lineHeight: "1.7" }}
                >
                  Upload foto atau video via link URL.
                </p>
                <button
                  onClick={() => setShowAddPhoto(true)}
                  className="w-full py-3 rounded-xl font-body text-sm"
                  style={{
                    background: "rgba(232,196,160,0.1)",
                    border: "1px solid rgba(232,196,160,0.3)",
                    color: ACCENT,
                  }}
                >
                  + Tambah Kenangan
                </button>
              </GlassCard>
              <GlassCard className="p-6">
                <h3
                  className="font-display text-lg mb-2"
                  style={{ color: "rgba(255,255,255,0.85)", fontWeight: 400 }}
                >
                  Buat Chapter Baru
                </h3>
                <p
                  className="font-body text-xs mb-4"
                  style={{ color: "rgba(255,255,255,0.4)", lineHeight: "1.7" }}
                >
                  Buat kategori baru untuk koleksi kenangan.
                </p>
                <button
                  onClick={() => setShowAddChapter(true)}
                  className="w-full py-3 rounded-xl font-body text-sm"
                  style={{
                    background: "rgba(192,132,252,0.1)",
                    border: "1px solid rgba(192,132,252,0.3)",
                    color: "#c084fc",
                  }}
                >
                  + Buat Chapter
                </button>
              </GlassCard>
            </div>

            <GlassCard className="p-6">
              <h3
                className="font-display text-lg mb-4"
                style={{ color: "rgba(255,255,255,0.85)", fontWeight: 400 }}
              >
                Kenangan Terbaru{" "}
                <span
                  className="font-body text-xs ml-2"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  ({Math.min(allPhotos.length, 8)})
                </span>
              </h3>
              {allPhotos.length === 0 ? (
                <div
                  className="text-center py-12"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="mx-auto mb-3"
                    style={{ opacity: 0.3 }}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="font-body text-sm">Belum ada kenangan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {allPhotos
                    .slice(-8)
                    .reverse()
                    .map((photo) => {
                      const chapter = chapters.find(
                        (c) => c.id === photo.chapter,
                      );
                      return (
                        <PhotoThumb
                          key={photo.id}
                          photo={photo}
                          accentColor={chapter?.accentColor}
                          canHide={isOwnerRole}
                          onEdit={() =>
                            setEditPhoto({ photo, chapterId: photo.chapter })
                          }
                          onDelete={() =>
                            setDeleteConfirm({
                              type: "photo",
                              id: photo.id,
                              chapterId: photo.chapter,
                              label: photo.title,
                            })
                          }
                          onToggleHidden={() =>
                            togglePhotoHidden(photo.chapter, photo.id)
                          }
                        />
                      );
                    })}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {activeTab === "chapters" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="font-display text-2xl"
                style={{ color: "rgba(255,255,255,0.88)", fontWeight: 300 }}
              >
                Semua Chapter
              </h2>
              <button
                onClick={() => setShowAddChapter(true)}
                className="px-4 py-2.5 rounded-xl font-body text-sm"
                style={{
                  background: "rgba(192,132,252,0.1)",
                  border: "1px solid rgba(192,132,252,0.3)",
                  color: "#c084fc",
                }}
              >
                + Chapter Baru
              </button>
            </div>

            <div className="space-y-4">
              {chapters.map((chapter) => (
                <GlassCard
                  key={chapter.id}
                  style={{ opacity: chapter.hidden ? 0.7 : 1 }}
                >
                  <div
                    className="flex items-center justify-between p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedChapter(
                        expandedChapter === chapter.id ? null : chapter.id,
                      )
                    }
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                        style={{
                          background: `${chapter.accentColor}15`,
                          border: `1px solid ${chapter.accentColor}30`,
                        }}
                      >
                        {chapter.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className="font-display text-lg"
                            style={{
                              color: chapter.accentColor,
                              fontWeight: 400,
                            }}
                          >
                            {chapter.label}
                          </h3>
                          {chapter.hidden && isOwnerRole && (
                            <span
                              className="px-2 py-0.5 rounded-full font-body flex items-center gap-1"
                              style={{
                                fontSize: "0.6rem",
                                background: "rgba(239,68,68,0.12)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                color: "#fca5a5",
                              }}
                            >
                              Hidden
                            </span>
                          )}
                        </div>
                        <p
                          className="font-body text-xs"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {chapter.years} ·{" "}
                          {
                            chapter.photos.filter(
                              (p) => isOwnerRole || !p.hidden,
                            ).length
                          }{" "}
                          kenangan
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      {isOwnerRole && (
                        <HiddenToggle
                          isHidden={chapter.hidden}
                          onToggle={() => toggleChapterHidden(chapter.id)}
                        />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddPhotoToChapter(chapter.id);
                          setShowAddPhoto(true);
                        }}
                        className="px-3 py-1.5 rounded-lg font-body text-xs"
                        style={{
                          background: `${chapter.accentColor}12`,
                          border: `1px solid ${chapter.accentColor}30`,
                          color: chapter.accentColor,
                        }}
                      >
                        + Kenangan
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({
                            type: "chapter",
                            id: chapter.id,
                            label: chapter.label,
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg font-body text-xs"
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          color: "#fca5a5",
                        }}
                      >
                        Hapus
                      </button>
                      <motion.span
                        style={{ color: "rgba(255,255,255,0.3)" }}
                        animate={{
                          rotate: expandedChapter === chapter.id ? 180 : 0,
                        }}
                        transition={{ duration: 0.25 }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </motion.span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedChapter === chapter.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          overflow: "hidden",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="p-5">
                          {isOwnerRole && chapter.hidden && (
                            <div
                              className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
                              style={{
                                background: "rgba(239,68,68,0.07)",
                                border: "1px solid rgba(239,68,68,0.2)",
                              }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fca5a5"
                                strokeWidth="2"
                              >
                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
                              </svg>
                              <p
                                className="font-body text-xs"
                                style={{ color: "#fca5a5" }}
                              >
                                Chapter ini hidden — tidak muncul di navbar,
                                gallery, dan home publik.
                              </p>
                            </div>
                          )}

                          {(() => {
                            const visiblePhotos = isOwnerRole
                              ? chapter.photos
                              : chapter.photos.filter((p) => !p.hidden);
                            return visiblePhotos.length === 0 ? (
                              <div
                                className="text-center py-8"
                                style={{ color: "rgba(255,255,255,0.25)" }}
                              >
                                <p className="font-body text-sm">
                                  Belum ada kenangan.
                                </p>
                                <button
                                  onClick={() => {
                                    setAddPhotoToChapter(chapter.id);
                                    setShowAddPhoto(true);
                                  }}
                                  className="mt-3 px-4 py-2 rounded-xl font-body text-xs"
                                  style={{
                                    background: `${chapter.accentColor}12`,
                                    border: `1px solid ${chapter.accentColor}28`,
                                    color: chapter.accentColor,
                                  }}
                                >
                                  + Tambah Kenangan Pertama
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {visiblePhotos.map((photo) => (
                                  <PhotoThumb
                                    key={photo.id}
                                    photo={photo}
                                    accentColor={chapter.accentColor}
                                    canHide={isOwnerRole}
                                    onEdit={() =>
                                      setEditPhoto({
                                        photo,
                                        chapterId: chapter.id,
                                      })
                                    }
                                    onDelete={() =>
                                      setDeleteConfirm({
                                        type: "photo",
                                        id: photo.id,
                                        chapterId: chapter.id,
                                        label: photo.title,
                                      })
                                    }
                                    onToggleHidden={() =>
                                      togglePhotoHidden(chapter.id, photo.id)
                                    }
                                  />
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              ))}

              {chapters.length === 0 && (
                <div
                  className="text-center py-16"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  <p className="font-body text-sm mb-4">Belum ada chapter.</p>
                  <button
                    onClick={() => setShowAddChapter(true)}
                    className="px-6 py-3 rounded-xl font-body text-sm"
                    style={{
                      background: "rgba(192,132,252,0.1)",
                      border: "1px solid rgba(192,132,252,0.3)",
                      color: "#c084fc",
                    }}
                  >
                    + Buat Chapter Pertama
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "photos" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="font-display text-2xl"
                style={{ color: "rgba(255,255,255,0.88)", fontWeight: 300 }}
              >
                Semua Kenangan{" "}
                <span
                  className="font-body text-lg"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  ({allPhotos.length})
                </span>
              </h2>
              <button
                onClick={() => setShowAddPhoto(true)}
                className="px-4 py-2.5 rounded-xl font-body text-sm"
                style={{
                  background: "rgba(232,196,160,0.1)",
                  border: "1px solid rgba(232,196,160,0.3)",
                  color: ACCENT,
                }}
              >
                + Tambah
              </button>
            </div>

            {allPhotos.length === 0 ? (
              <div
                className="text-center py-20"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                <p className="font-body text-sm">Belum ada kenangan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPhotos.map((photo) => {
                  const chapter = chapters.find((c) => c.id === photo.chapter);
                  return (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      chapter={chapter}
                      canHide={isOwnerRole}
                      onEdit={() =>
                        setEditPhoto({ photo, chapterId: photo.chapter })
                      }
                      onDelete={() =>
                        setDeleteConfirm({
                          type: "photo",
                          id: photo.id,
                          chapterId: photo.chapter,
                          label: photo.title,
                        })
                      }
                      onToggleHidden={() =>
                        togglePhotoHidden(photo.chapter, photo.id)
                      }
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

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

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-7 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(15,14,31,0.97)",
                border: "1px solid rgba(239,68,68,0.2)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fca5a5"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </div>
              <h3
                className="font-display text-xl text-center mb-2"
                style={{ color: "rgba(255,255,255,0.9)", fontWeight: 300 }}
              >
                Hapus{" "}
                {deleteConfirm.type === "chapter" ? "Chapter" : "Kenangan"}?
              </h3>
              <p
                className="font-body text-sm text-center mb-6"
                style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.7" }}
              >
                <span style={{ color: "#fca5a5" }}>
                  "{deleteConfirm.label}"
                </span>{" "}
                akan dihapus permanen.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl font-body text-sm"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 rounded-xl font-body text-sm"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#fca5a5",
                  }}
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
