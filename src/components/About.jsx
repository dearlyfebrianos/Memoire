import { motion } from "framer-motion";
import { useState } from "react";
import { chapters } from "../data/photos";
import { CREDENTIALS } from "../data/authData";

function CreatorCard({ user, i }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const bio = user.bio || "Menenun kode menjadi kenangan abadi.";
  const isLongBio = bio.length > 80;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.5 }}
      className="flex flex-col items-center max-w-[240px]"
    >
      <div className="relative mb-5 group">
        <div className="absolute -inset-2 bg-gradient-to-br from-[#e8c4a0]/20 to-transparent rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
        <div className="relative w-24 h-24 rounded-[1.8rem] overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-2xl">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
            />
          ) : (
            <span className="font-display text-3xl text-[#e8c4a0]/30">
              {(user.displayName || user.username)[0].toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <h4 className="font-display text-xl text-white/90 mb-1 tracking-tight">
        {user.displayName || user.username}
      </h4>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-1 rounded-full bg-[#e8c4a0]/40" />
        <span className="font-body text-[9px] uppercase tracking-[0.2em] text-[#e8c4a0]/60">
          {user.role}
        </span>
        <span className="w-1 h-1 rounded-full bg-[#e8c4a0]/40" />
      </div>

      <div className="relative flex flex-col items-center">
        <p
          className={`font-body text-xs text-white/40 leading-relaxed text-center italic px-4 transition-all duration-300 ${
            !isExpanded && isLongBio ? "line-clamp-3" : ""
          }`}
        >
          "{bio}"
        </p>
        {isLongBio && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 font-display text-[9px] uppercase tracking-widest text-[#e8c4a0]/50 hover:text-[#e8c4a0] transition-colors flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                Sembunyikan
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </>
            ) : (
              <>
                Selengkapnya
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function About() {
  const visibleChapters = chapters.filter((c) => !c.hidden);
  const visiblePhotosCount = visibleChapters.reduce(
    (sum, c) => sum + c.photos.filter((p) => !p.hidden).length,
    0,
  );

  const stats = [
    {
      value: visibleChapters.length.toString(),
      label: "Bab",
    },
    {
      value: visiblePhotosCount.toString(),
      label: "Kenangan",
    },
    {
      value: "∞",
      label: "Perasaan",
    },
  ];

  return (
    <section id="about" className="relative z-10 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-10 shimmer-accent" />
            <span
              className="font-body text-xs uppercase"
              style={{ color: "#e8c4a0", letterSpacing: "0.25em" }}
            >
              Sang Pencipta Kenangan
            </span>
            <div className="h-px w-10 shimmer-accent" />
          </div>

          {/* Profiles Section */}
          <div className="flex flex-wrap justify-center gap-12 mb-12 items-start">
            {CREDENTIALS.map((user, i) => (
              <CreatorCard key={user.username} user={user} i={i} />
            ))}
          </div>

          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            Tentang Tempat Ini
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl p-8 sm:p-12 mb-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="shrink-0">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center font-display text-4xl"
                style={{
                  background: "rgba(232,196,160,0.08)",
                  border: "1px solid rgba(232,196,160,0.2)",
                  color: "#e8c4a0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                }}
              >
                ✦
              </div>
            </div>

            <div className="flex-1">
              <h3
                className="font-display text-2xl sm:text-3xl mb-4"
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 300,
                  fontStyle: "italic",
                }}
              >
                Sebuah kehidupan yang diabadikan dalam bingkai-bingkai foto.
              </h3>
              <div
                className="space-y-4 font-body text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                <p>
                  Inilah Memoire — arsip pribadi yang dibangun untuk menyimpan
                  momen-momen penting. Bukan momen yang dipoles, tetapi momen
                  yang nyata: momen spontan, momen keemasan, momen yang buram,
                  momen di mana semua orang sedang tertawa.
                </p>
                <p>
                  Setiap bab mewakili sebuah fase kehidupan. Lorong-lorong
                  sekolah menengah atas, kekacauan indah di sekolah menengah
                  pertama, dan setiap bandara, gunung, dan garis pantai di
                  antaranya.
                </p>
                <p>
                  Ingatan itu rapuh. Inilah cara saya melestarikan ingatan saya.
                </p>
              </div>

              {/* Kutipan */}
              <div
                className="mt-8 pl-5 font-display text-lg italic"
                style={{
                  borderLeft: "2px solid rgba(232,196,160,0.3)",
                  color: "rgba(232,196,160,0.7)",
                  lineHeight: "1.6",
                }}
              >
                "Hal terbaik tentang kenangan adalah menciptakannya."
              </div>
            </div>
          </div>
        </motion.div>

        {/* Baris statistik */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center py-7 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="font-display text-3xl sm:text-4xl mb-1"
                style={{ color: "#e8c4a0", fontWeight: 300 }}
              >
                {stat.value}
              </div>
              <div
                className="font-body text-xs uppercase"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.15em",
                }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
