import { useState } from "react";
import { motion } from "framer-motion";

export default function PhotoCard({ photo, index, accentColor = "#e8c4a0", onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const images = photo.imageUrls?.length
    ? photo.imageUrls
    : photo.imageUrl
    ? [photo.imageUrl]
    : [];

  const coverImage = images[0] || "";
  const hasMultiple = images.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer w-full"
      onClick={() => onClick(photo)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative rounded-2xl overflow-hidden w-full"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: hovered ? `1px solid ${accentColor}44` : "1px solid rgba(255,255,255,0.1)",
          boxShadow: hovered
            ? `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}18`
            : "0 4px 20px rgba(0,0,0,0.3)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* ── IMAGE ── */}
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: "75%" /* 4:3 ratio */ }}>

          {/* Skeleton */}
          {!loaded && (
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.8s infinite",
              }}
            />
          )}

          {/* Main image */}
          <img
            src={coverImage}
            alt={photo.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: loaded ? 1 : 0,
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
            }}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
              transition: "opacity 0.3s",
            }}
          />

          {/* Caption reveal on hover — desktop only (hidden on touch) */}
          {photo.caption && (
            <div
              className="absolute inset-x-0 bottom-0 p-3 hidden sm:block"
              style={{
                transform: hovered ? "translateY(0)" : "translateY(6px)",
                opacity: hovered ? 1 : 0,
                transition: "all 0.35s ease",
              }}
            >
              <p className="font-body text-xs leading-snug" style={{ color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
                "{photo.caption}"
              </p>
            </div>
          )}

          {/* Multi-photo badge */}
          {hasMultiple && (
            <div
              className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
                border: `1px solid ${accentColor}30`,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                <rect x="2" y="7" width="16" height="14" rx="2"/>
                <path d="M6 7V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
              </svg>
              <span className="font-body" style={{ fontSize: "0.6rem", color: accentColor, lineHeight: 1 }}>
                {images.length}
              </span>
            </div>
          )}

          {/* Expand icon — desktop hover */}
          <div
            className="absolute top-2 right-2 w-7 h-7 rounded-full items-center justify-center hidden sm:flex"
            style={{
              background: hovered ? `${accentColor}20` : "rgba(0,0,0,0.35)",
              border: `1px solid ${hovered ? accentColor + "50" : "rgba(255,255,255,0.12)"}`,
              opacity: hovered ? 1 : 0,
              transform: hovered ? "scale(1)" : "scale(0.85)",
              transition: "all 0.3s ease",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </div>
        </div>

        {/* ── INFO ── */}
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className="font-display leading-tight mb-0.5 truncate"
                style={{
                  fontSize: "clamp(0.9rem, 3.5vw, 1rem)",
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 400,
                }}
              >
                {photo.title}
              </h3>
              <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {photo.date}
              </p>
            </div>

            {photo.tags?.length > 0 && (
              <span
                className="shrink-0 px-2 py-0.5 rounded-full font-body"
                style={{
                  fontSize: "0.6rem",
                  background: `${accentColor}12`,
                  border: `1px solid ${accentColor}28`,
                  color: accentColor,
                  whiteSpace: "nowrap",
                }}
              >
                {photo.tags[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}