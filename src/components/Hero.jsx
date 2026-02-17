import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { chapters } from "../data/photos";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        className="absolute top-1/4 left-1/6 w-2 h-2 rounded-full"
        style={{ background: "#e8c4a0", opacity: 0.4 }}
        animate={{ y: [-8, 8, -8], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2/3 right-1/5 w-1.5 h-1.5 rounded-full"
        style={{ background: "#c084fc", opacity: 0.5 }}
        animate={{ y: [8, -8, 8], opacity: [0.4, 0.7, 0.4] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full"
        style={{ background: "#38bdf8", opacity: 0.5 }}
        animate={{ y: [-5, 10, -5], opacity: [0.3, 0.65, 0.3] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="h-px w-12 shimmer-accent" />
          <span
            className="text-xs font-body tracking-[0.3em] uppercase"
            style={{ color: "#e8c4a0", letterSpacing: "0.3em" }}
          >
            Arsip Pribadi
          </span>
          <div className="h-px w-12 shimmer-accent" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mb-6"
          style={{
            fontSize: "clamp(3rem, 8vw, 7rem)",
            lineHeight: "1.0",
            fontWeight: 300,
            color: "rgba(255,255,255,0.93)",
            letterSpacing: "-0.01em",
          }}
        >
          Setiap Momen
          <br />
          <span style={{ color: "#e8c4a0", fontStyle: "italic" }}>
            Tersimpan
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="font-body text-lg max-w-xl mx-auto mb-12"
          style={{
            color: "rgba(255,255,255,0.5)",
            lineHeight: "1.8",
            fontWeight: 300,
          }}
        >
          Kumpulan kenangan — yang tenang dan yang riuh — tersimpan rapi dalam
          wadah kaca.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-20"
        >
          <Link
            to="/gallery"
            className="px-8 py-3.5 rounded-full font-body text-sm tracking-widest uppercase transition-all duration-300 hover:scale-105"
            style={{
              background: "rgba(232,196,160,0.12)",
              border: "1px solid rgba(232,196,160,0.35)",
              color: "#e8c4a0",
              letterSpacing: "0.15em",
              backdropFilter: "blur(10px)",
            }}
          >
            Lihat Semua Kenangan
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          {chapters.map((chapter, i) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.12, duration: 0.6 }}
            >
              <Link
                to={`/chapter/${chapter.slug}`}
                className="group block p-5 rounded-2xl transition-all duration-400 hover:scale-[1.03] text-left"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = `${chapter.accentColor}44`;
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${chapter.accentColor}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 24px rgba(0,0,0,0.3)";
                }}
              >
                <div className="text-2xl mb-3">{chapter.emoji}</div>
                <div
                  className="font-display text-lg mb-1"
                  style={{ color: chapter.accentColor, fontWeight: 400 }}
                >
                  {chapter.label}
                </div>
                <div
                  className="font-body text-xs"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {chapter.years}
                </div>
                <div
                  className="mt-3 font-body text-xs leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {chapter.photos.length} kenangan
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        <span
          className="font-body text-xs tracking-widest uppercase"
          style={{ letterSpacing: "0.2em", fontSize: "0.65rem" }}
        >
          Scroll
        </span>
        <motion.div
          className="w-px h-8"
          style={{
            background:
              "linear-gradient(to bottom, rgba(232,196,160,0.4), transparent)",
          }}
          animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
