import { motion } from "framer-motion";
import Gallery from "../components/Gallery";

export default function GalleryPage() {
  return (
    <div className="pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center py-16 px-6"
      >
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px w-10 shimmer-accent" />
          <span
            className="font-body text-xs uppercase"
            style={{ color: "#e8c4a0", letterSpacing: "0.25em" }}
          >
            Koleksi Lengkap
          </span>
          <div className="h-px w-10 shimmer-accent" />
        </div>
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 5rem)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.93)",
          }}
        >
          Semua Kenangan
        </h1>
        <p
          className="font-body mt-3 text-sm max-w-md mx-auto"
          style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.8" }}
        >
          Setiap bab, setiap momen — jelajahi arsip lengkap.
        </p>
      </motion.div>
      <Gallery />
    </div>
  );
}
