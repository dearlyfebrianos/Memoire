import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { chapters } from "../data/photos";
import PhotoCard from "../components/PhotoCard";
import PhotoModal from "../components/PhotoModal";

export default function ChapterPage() {
  const { slug } = useParams();
  const chapter = chapters.find((c) => c.slug === slug);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!chapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center pt-24 px-6">
        <div
          className="font-display text-5xl mb-4"
          style={{ color: "rgba(255,255,255,0.2)", fontWeight: 300 }}
        >
          404
        </div>
        <p
          className="font-body text-sm mb-8"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Bab ini belum ditulis.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-full font-body text-sm"
          style={{
            background: "rgba(232,196,160,0.1)",
            border: "1px solid rgba(232,196,160,0.3)",
            color: "#e8c4a0",
          }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${chapter.accentColor}18, transparent 70%)`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 font-body text-xs mb-10 transition-opacity hover:opacity-100 opacity-50"
            style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.07em" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Kembali ke Galeri
          </Link>

          <div className="text-5xl mb-6">{chapter.emoji}</div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="h-px w-8"
              style={{ background: chapter.accentColor, opacity: 0.5 }}
            />
            <span
              className="font-body text-xs uppercase tracking-widest"
              style={{ color: chapter.accentColor, letterSpacing: "0.25em" }}
            >
              {chapter.years}
            </span>
            <div
              className="h-px w-8"
              style={{ background: chapter.accentColor, opacity: 0.5 }}
            />
          </div>

          <h1
            className="font-display mb-5"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.93)",
            }}
          >
            {chapter.label}
          </h1>

          <p
            className="font-body text-sm max-w-lg mx-auto"
            style={{ color: "rgba(255,255,255,0.5)", lineHeight: "1.9" }}
          >
            {chapter.description}
          </p>

          <div
            className="inline-block mt-6 px-5 py-2 rounded-full font-body text-xs"
            style={{
              background: `${chapter.accentColor}10`,
              border: `1px solid ${chapter.accentColor}28`,
              color: chapter.accentColor,
              letterSpacing: "0.1em",
            }}
          >
            {chapter.photos.length} kenangan
          </div>
        </motion.div>
      </div>

      <div
        className="mx-6 sm:mx-12 mb-12 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${chapter.accentColor}30, transparent)`,
        }}
      />

      <div className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {chapter.photos.map((photo, i) => (
            <PhotoCard
              key={photo.id}
              photo={{ ...photo, chapterLabel: chapter.label }}
              index={i}
              accentColor={chapter.accentColor}
              onClick={(p) =>
                setSelectedPhoto({ ...p, chapterLabel: chapter.label })
              }
            />
          ))}
        </div>
      </div>

      <div className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div
            className="h-px mb-10"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <p
            className="font-body text-xs text-center mb-6 uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Bab Lainnya
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {chapters
              .filter((c) => c.id !== chapter.id)
              .map((c) => (
                <Link
                  key={c.id}
                  to={`/chapter/${c.slug}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          accentColor={chapter.accentColor}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}