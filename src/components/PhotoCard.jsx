import { useState } from "react";
import { motion } from "framer-motion";

export default function PhotoCard({
  photo,
  index,
  accentColor = "#e8c4a0",
  onClick,
}) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group cursor-pointer"
      onClick={() => onClick(photo)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-400"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: hovered
            ? `1px solid ${accentColor}44`
            : "1px solid rgba(255,255,255,0.1)",
          boxShadow: hovered
            ? `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}22`
            : "0 4px 24px rgba(0,0,0,0.3)",
          transform: hovered
            ? "translateY(-6px) scale(1.01)"
            : "translateY(0) scale(1)",
          transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "4/3" }}
        >
          {!loaded && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          )}

          <img
            src={photo.imageUrl}
            alt={photo.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{
              transform: hovered ? "scale(1.08)" : "scale(1)",
              opacity: loaded ? 1 : 0,
              transition:
                "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
            }}
          />

          <div
            className="absolute inset-0 transition-opacity duration-400"
            style={{
              background: hovered
                ? "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)"
                : "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)",
              opacity: 1,
            }}
          />

          {photo.caption && (
            <div
              className="absolute inset-x-0 bottom-0 p-4 transition-all duration-400"
              style={{
                transform: hovered ? "translateY(0)" : "translateY(8px)",
                opacity: hovered ? 1 : 0,
              }}
            >
              <p
                className="font-body text-xs leading-relaxed"
                style={{ color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}
              >
                "{photo.caption}"
              </p>
            </div>
          )}

          <div
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: hovered ? `${accentColor}22` : "rgba(0,0,0,0.3)",
              border: `1px solid ${hovered ? accentColor + "55" : "rgba(255,255,255,0.15)"}`,
              opacity: hovered ? 1 : 0,
              transform: hovered ? "scale(1)" : "scale(0.8)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
        </div>

        <div className="p-4 pb-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className="font-display text-base leading-tight mb-1"
                style={{ color: "rgba(255,255,255,0.9)", fontWeight: 400 }}
              >
                {photo.title}
              </h3>
              <p
                className="font-body text-xs"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.05em",
                }}
              >
                {photo.date}
              </p>
            </div>
            {photo.tags && photo.tags.length > 0 && (
              <span
                className="mt-0.5 px-2 py-0.5 rounded-full font-body text-xs shrink-0"
                style={{
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}30`,
                  color: accentColor,
                  fontSize: "0.65rem",
                  letterSpacing: "0.05em",
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