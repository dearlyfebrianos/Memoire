import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhotoModal({
  photo,
  accentColor = "#e8c4a0",
  onClose,
}) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl"
          style={{
            background: "rgba(12,12,22,0.85)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: `1px solid ${accentColor}25`,
            boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px ${accentColor}15, inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.7)",
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

          <div className="flex flex-col md:flex-row max-h-[90vh]">
            <div
              className="relative md:w-2/3 bg-black"
              style={{ minHeight: "280px" }}
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover"
                style={{ maxHeight: "70vh" }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(12,12,22,0.9), transparent)",
                }}
              />
            </div>

            <div className="md:w-1/3 flex flex-col p-7 md:p-8 justify-center gap-5">
              <div
                className="h-px w-8"
                style={{ background: accentColor, opacity: 0.6 }}
              />

              <div>
                <h2
                  className="font-display text-2xl md:text-3xl mb-2"
                  style={{
                    color: "rgba(255,255,255,0.93)",
                    fontWeight: 300,
                    lineHeight: 1.2,
                  }}
                >
                  {photo.title}
                </h2>
                <p
                  className="font-body text-sm"
                  style={{
                    color: accentColor,
                    opacity: 0.8,
                    letterSpacing: "0.08em",
                  }}
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

              {photo.tags && photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full font-body text-xs"
                      style={{
                        background: `${accentColor}10`,
                        border: `1px solid ${accentColor}28`,
                        color: accentColor,
                        letterSpacing: "0.07em",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {photo.chapterLabel && (
                <div
                  className="mt-auto pt-5 font-body text-xs"
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
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