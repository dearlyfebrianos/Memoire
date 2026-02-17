import { useState } from "react";
import { motion } from "framer-motion";
import PhotoCard from "./PhotoCard";
import PhotoModal from "./PhotoModal";
import { useStore } from "../data/useStore";

export default function Gallery() {
  const { chapters, allPhotos } = useStore();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [activeChapter, setActiveChapter] = useState("all");

  const filtered =
    activeChapter === "all"
      ? allPhotos
      : allPhotos.filter((p) => p.chapter === activeChapter);

  const activeChapterData = chapters.find((c) => c.id === activeChapter);
  const accentColor = activeChapterData?.accentColor ?? "#e8c4a0";

  return (
    <section id="gallery" className="relative z-10 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-10 shimmer-accent" />
            <span
              className="font-body text-xs tracking-[0.3em] uppercase"
              style={{ color: "#e8c4a0", letterSpacing: "0.25em" }}
            >
              All Chapters
            </span>
            <div className="h-px w-10 shimmer-accent" />
          </div>
          <h2
            className="font-display mb-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            The Full Gallery
          </h2>
          <p
            className="font-body text-sm max-w-md mx-auto"
            style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.8" }}
          >
            Filter by chapter or browse all {allPhotos.length} memories
            together.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {[
            { id: "all", label: "All", emoji: "✦", accentColor: "#e8c4a0" },
            ...chapters,
          ].map((tab) => {
            const isActive = activeChapter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChapter(tab.id)}
                className="px-5 py-2.5 rounded-full font-body text-sm transition-all duration-300"
                style={{
                  background: isActive
                    ? `${tab.accentColor}18`
                    : "rgba(255,255,255,0.05)",
                  border: isActive
                    ? `1px solid ${tab.accentColor}44`
                    : "1px solid rgba(255,255,255,0.1)",
                  color: isActive ? tab.accentColor : "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(10px)",
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                }}
              >
                {tab.emoji ? `${tab.emoji} ` : ""}
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        <motion.div
          key={activeChapter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((photo, i) => {
            const chapterData = chapters.find((c) => c.id === photo.chapter);
            return (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                accentColor={chapterData?.accentColor ?? "#e8c4a0"}
                onClick={(p) => setSelectedPhoto(p)}
              />
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <p
              className="font-display text-2xl mb-2"
              style={{ fontWeight: 300 }}
            >
              No memories yet
            </p>
            <p className="font-body text-sm">
              This chapter is waiting to be written.
            </p>
          </div>
        )}
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          accentColor={
            chapters.find((c) => c.id === selectedPhoto.chapter)?.accentColor ??
            "#e8c4a0"
          }
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </section>
  );
}
