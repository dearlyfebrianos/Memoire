import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { normalizeMediaItems } from "../data/githubSync";
import { MediaItem, MediaTypeBadge } from "./MediaViewer";

export default function PhotoModal({
  photo,
  accentColor = "#e8c4a0",
  onClose,
}) {
  const mediaItems = normalizeMediaItems(photo || {});
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const total = mediaItems.length;

  const goTo = useCallback((idx, dir) => {
    setDirection(dir);
    setImgLoaded(false);
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => {
    if (total <= 1) return;
    goTo((current - 1 + total) % total, -1);
  }, [current, total, goTo]);

  const next = useCallback(() => {
    if (total <= 1) return;
    goTo((current + 1) % total, 1);
  }, [current, total, goTo]);

  useEffect(() => {
    setCurrent(0);
    setImgLoaded(false);
  }, [photo]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, next, prev]);

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    setTouchStart(null);
  };

  if (!photo) return null;

  const currentItem = mediaItems[current];
  const isVideo = currentItem?.type === "video";

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
  };

  const videoCount = mediaItems.filter((m) => m.type === "video").length;
  const imageCount = mediaItems.filter((m) => m.type === "image").length;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(14px)" }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full overflow-hidden"
          style={{
            maxWidth: "960px",
            maxHeight: "95vh",
            borderRadius: window.innerWidth < 640 ? "24px 24px 0 0" : "28px",
            margin: window.innerWidth < 640 ? "0" : "16px",
            background: "rgba(8,8,18,0.97)",
            border: `1px solid ${accentColor}20`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div
            className="flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden"
            style={{ maxHeight: "95vh" }}
          >
            <div
              className="relative flex-shrink-0 bg-black overflow-hidden"
              style={{ width: "100%", aspectRatio: "4/3" }}
              ref={(el) => {
                if (el && window.innerWidth >= 640) {
                  el.style.width = "60%";
                  el.style.aspectRatio = "unset";
                  el.style.minHeight = "400px";
                }
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence custom={direction} mode="wait">
                {isVideo ? (
                  <motion.div
                    key={`video-${current}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <MediaItem
                      url={currentItem?.url}
                      type="video"
                      className="w-full h-full"
                      style={{ width: "100%", height: "100%" }}
                      onLoad={() => setImgLoaded(true)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`img-${current}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={currentItem?.url}
                      alt={`${photo.title} ${current + 1}`}
                      onLoad={() => setImgLoaded(true)}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        opacity: imgLoaded ? 1 : 0,
                        transition: "opacity 0.25s",
                      }}
                    />
                    {!imgLoaded && (
                      <div
                        className="absolute inset-0"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isVideo && (
                <div
                  className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(8,8,18,0.85), transparent)",
                  }}
                />
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                {total > 1 && (
                  <div
                    className="px-2.5 py-1 rounded-full font-body text-xs"
                    style={{
                      background: "rgba(0,0,0,0.65)",
                      backdropFilter: "blur(6px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {current + 1} / {total}
                  </div>
                )}
                <MediaTypeBadge
                  type={currentItem?.type}
                  accentColor={accentColor}
                />
              </div>

              {total > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      border: `1px solid ${accentColor}35`,
                      color: accentColor,
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      border: `1px solid ${accentColor}35`,
                      color: accentColor,
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}

              {total > 1 && !isVideo && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {mediaItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i, i > current ? 1 : -1)}
                      className="rounded-full transition-all duration-300 flex items-center justify-center"
                      style={{
                        width: i === current ? "18px" : "6px",
                        height: "6px",
                        background:
                          item.type === "video"
                            ? i === current
                              ? accentColor
                              : `${accentColor}60`
                            : i === current
                              ? accentColor
                              : "rgba(255,255,255,0.4)",
                        boxShadow:
                          i === current ? `0 0 8px ${accentColor}90` : "none",
                      }}
                    >
                      {item.type === "video" && i !== current && (
                        <svg
                          width="4"
                          height="4"
                          viewBox="0 0 24 24"
                          fill={accentColor}
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className="flex flex-col p-5 sm:p-7 gap-4 overflow-y-auto"
              style={{ flex: 1 }}
            >
              <div
                className="h-0.5 w-8 rounded-full"
                style={{ background: accentColor, opacity: 0.6 }}
              />

              <div>
                <h2
                  className="font-display mb-1.5 leading-tight"
                  style={{
                    fontSize: "clamp(1.3rem, 5vw, 1.75rem)",
                    color: "rgba(255,255,255,0.93)",
                    fontWeight: 300,
                  }}
                >
                  {photo.title}
                </h2>
                <p
                  className="font-body text-sm"
                  style={{ color: accentColor, opacity: 0.85 }}
                >
                  {photo.date}
                </p>
              </div>

              {photo.caption && (
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontStyle: "italic",
                    lineHeight: "1.8",
                  }}
                >
                  "{photo.caption}"
                </p>
              )}

              {total > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {imageCount > 0 && (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      {imageCount} Foto
                    </span>
                  )}
                  {videoCount > 0 && (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs"
                      style={{
                        background: `${accentColor}10`,
                        border: `1px solid ${accentColor}25`,
                        color: accentColor,
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      {videoCount} Video
                    </span>
                  )}
                </div>
              )}

              {photo.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full font-body text-xs"
                      style={{
                        background: `${accentColor}12`,
                        border: `1px solid ${accentColor}30`,
                        color: accentColor,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {total > 1 && (
                <div>
                  <p
                    className="font-body text-xs mb-2 uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    {total} media
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {mediaItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i, i > current ? 1 : -1)}
                        className="rounded-lg overflow-hidden transition-all duration-200 active:scale-95 relative"
                        style={{
                          width: "48px",
                          height: "48px",
                          flexShrink: 0,
                          border:
                            i === current
                              ? `2px solid ${accentColor}`
                              : "2px solid rgba(255,255,255,0.1)",
                          boxShadow:
                            i === current
                              ? `0 0 10px ${accentColor}50`
                              : "none",
                        }}
                      >
                        {item.type === "video" ? (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: `${accentColor}12` }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill={accentColor}
                            >
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={`thumb-${i}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {photo.chapterLabel && (
                <div
                  className="mt-auto pt-4 font-body text-xs uppercase"
                  style={{
                    color: "rgba(255,255,255,0.22)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    letterSpacing: "0.12em",
                  }}
                >
                  {photo.chapterLabel}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}