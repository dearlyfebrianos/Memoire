import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { chapters } from "../data/photos";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Gallery", to: "/gallery" },
    ...chapters.map((c) => ({ label: c.label, to: `/chapter/${c.slug}` })),
    { label: "About", to: "/about" },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(8,8,16,0.65)" : "rgba(8,8,16,0.2)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display"
              style={{
                background: "rgba(232,196,160,0.12)",
                border: "1px solid rgba(232,196,160,0.3)",
                color: "#e8c4a0",
              }}
            >
              M
            </div>
            <span
              className="font-display text-xl tracking-widest"
              style={{ color: "#e8c4a0", letterSpacing: "0.2em" }}
            >
              Memoire
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-4 py-2 text-sm font-body transition-all duration-300"
                style={{
                  color: isActive(link.to)
                    ? "#e8c4a0"
                    : "rgba(255,255,255,0.6)",
                  letterSpacing: "0.05em",
                }}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: "#e8c4a0" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <button
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-4 h-px transition-all duration-300"
                style={{
                  background: "#e8c4a0",
                  transform: mobileOpen
                    ? i === 0
                      ? "rotate(45deg) translate(3px, 3px)"
                      : i === 1
                        ? "scaleX(0)"
                        : "rotate(-45deg) translate(3px, -3px)"
                    : "none",
                }}
              />
            ))}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-4 right-4 z-40 rounded-2xl p-5 md:hidden"
            style={{
              background: "rgba(10,10,20,0.9)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={link.to}
                  className="block px-4 py-3 rounded-xl text-sm font-body transition-all duration-200"
                  style={{
                    color: isActive(link.to)
                      ? "#e8c4a0"
                      : "rgba(255,255,255,0.65)",
                    background: isActive(link.to)
                      ? "rgba(232,196,160,0.08)"
                      : "transparent",
                    letterSpacing: "0.04em",
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}