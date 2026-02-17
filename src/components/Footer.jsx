import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative z-10 mt-8 mx-4 sm:mx-6 mb-6 rounded-3xl px-8 py-10"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 -4px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-display text-xs"
            style={{
              background: "rgba(232,196,160,0.1)",
              border: "1px solid rgba(232,196,160,0.25)",
              color: "#e8c4a0",
            }}
          >
            M
          </div>
          <span
            className="font-display text-base tracking-widest"
            style={{ color: "rgba(232,196,160,0.7)", letterSpacing: "0.2em" }}
          >
            Memoire
          </span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-6">
          {[
            { label: "Home", to: "/" },
            { label: "Gallery", to: "/gallery" },
            { label: "About", to: "/about" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-body text-xs transition-colors duration-200 hover:text-white"
              style={{
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p
          className="font-body text-xs"
          style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}
        >
          © {year} Memoire Dearly Febriano Irwansyah. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}