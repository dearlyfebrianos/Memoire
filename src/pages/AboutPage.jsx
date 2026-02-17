import { motion } from "framer-motion";
import About from "../components/About";

export default function AboutPage() {
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
            Cerita Kami
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
          Tentang Memoire
        </h1>
      </motion.div>
      <About />
    </div>
  );
}
