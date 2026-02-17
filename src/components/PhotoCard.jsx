import { useState } from "react";
import { motion } from "framer-motion";
import { normalizeMediaItems } from "../data/githubSync";
import { MediaTypeBadge } from "./MediaViewer";

export default function PhotoCard({
  photo,
  index,
  accentColor = "#e8c4a0",
  onClick,
}) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const mediaItems = normalizeMediaItems(photo);
  const cover = mediaItems[0];
  const isVideoCover = cover?.type === "video";
  const hasMultiple = mediaItems.length > 1;
  const videoCount = mediaItems.filter((m) => m.type === "video").length;
  const imageCount = mediaItems.filter((m) => m.type === "image").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group cursor-pointer w-full"
      onClick={() => onClick(photo)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative rounded-2xl overflow-hidden w-full"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: hovered
            ? `1px solid ${accentColor}44`
            : "1px solid rgba(255,255,255,0.1)",
          boxShadow: hovered
            ? `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}18`
            : "0 4px 20px rgba(0,0,0,0.3)",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: "75%" }}
        >
          {!loaded && !isVideoCover && !imgErr && (
            <div
              className="absolute inset-0"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          )}

          {isVideoCover ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{ background: `${accentColor}08` }}
              />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: `${accentColor}20`,
                    border: `2px solid ${accentColor}50`,
                    transform: hovered ? "scale(1.12)" : "scale(1)",
                    transition: "transform 0.35s ease",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={accentColor}
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <span
                  className="font-body text-xs"
                  style={{
                    color: accentColor,
                    letterSpacing: "0.1em",
                    opacity: 0.8,
                  }}
                >
                  VIDEO
                </span>
              </div>
            </div>
          ) : (
            <>
              {!imgErr && (
                <img
                  src={cover?.url}
                  alt={photo.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onLoad={() => setLoaded(true)}
                  onError={() => setImgErr(true)}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: loaded ? 1 : 0,
                    transform: hovered ? "scale(1.06)" : "scale(1)",
                    transition:
                      "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
                  }}
                />
              )}
              {imgErr && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: `${accentColor}08` }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="1.5"
                    style={{ opacity: 0.3 }}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </>
          )}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)",
            }}
          />

          {photo.caption && (
            <div
              className="absolute inset-x-0 bottom-0 p-3 hidden sm:block"
              style={{
                transform: hovered ? "translateY(0)" : "translateY(6px)",
                opacity: hovered ? 1 : 0,
                transition: "all 0.35s ease",
              }}
            >
              <p
                className="font-body text-xs leading-snug"
                style={{ color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}
              >
                "{photo.caption}"
              </p>
            </div>
          )}

          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            {isVideoCover && (
              <MediaTypeBadge type="video" accentColor={accentColor} />
            )}
            {hasMultiple && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(4px)",
                  border: `1px solid ${accentColor}30`,
                }}
              >
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="2"
                >
                  <rect x="2" y="7" width="16" height="14" rx="2" />
                  <path d="M6 7V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
                <span style={{ fontSize: "0.6rem", color: accentColor }}>
                  {imageCount > 0 && videoCount > 0
                    ? `${imageCount}🖼 ${videoCount}▶`
                    : mediaItems.length}
                </span>
              </div>
            )}
          </div>

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
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
        </div>

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
              <p
                className="font-body text-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
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
