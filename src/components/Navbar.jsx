import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../data/useStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [mobileChapterOpen, setMobileChapterOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { publicChapters: chapters } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setChapterOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setChapterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (to) => location.pathname === to;
  const isChapterActive = chapters.some(
    (c) => location.pathname === `/chapter/${c.slug}`,
  );

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(8,8,16,0.75)" : "rgba(8,8,16,0.2)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
          >
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
              className="font-display text-lg sm:text-xl"
              style={{ color: "#e8c4a0", letterSpacing: "0.18em" }}
            >
              Memoire
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            <NavLink to="/" active={isActive("/")}>
              Home
            </NavLink>

            <NavLink to="/gallery" active={isActive("/gallery")}>
              Gallery
            </NavLink>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setChapterOpen(!chapterOpen)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-body transition-all duration-300 relative"
                style={{
                  color:
                    isChapterActive || chapterOpen
                      ? "#e8c4a0"
                      : "rgba(255,255,255,0.6)",
                  letterSpacing: "0.05em",
                }}
              >
                Chapter
                <motion.svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  animate={{ rotate: chapterOpen ? 180 : 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </motion.svg>
                {isChapterActive && !chapterOpen && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: "#e8c4a0" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              <AnimatePresence>
                {chapterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute mt-2 rounded-2xl overflow-hidden"
                    style={{
                      right: 0,
                      minWidth: "220px",
                      background: "rgba(10,10,22,0.97)",
                      backdropFilter: "blur(30px)",
                      WebkitBackdropFilter: "blur(30px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow:
                        "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="p-2">
                      {chapters.length === 0 ? (
                        <p
                          className="px-4 py-3 text-xs font-body"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          Belum ada chapter
                        </p>
                      ) : (
                        chapters.map((chapter, i) => {
                          const active =
                            location.pathname === `/chapter/${chapter.slug}`;
                          return (
                            <motion.div
                              key={chapter.id}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                            >
                              <Link
                                to={`/chapter/${chapter.slug}`}
                                onClick={() => setChapterOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                                style={{
                                  background: active
                                    ? `${chapter.accentColor}14`
                                    : "transparent",
                                  border: active
                                    ? `1px solid ${chapter.accentColor}28`
                                    : "1px solid transparent",
                                }}
                                onMouseEnter={(e) => {
                                  if (!active)
                                    e.currentTarget.style.background =
                                      "rgba(255,255,255,0.06)";
                                }}
                                onMouseLeave={(e) => {
                                  if (!active)
                                    e.currentTarget.style.background = active
                                      ? `${chapter.accentColor}14`
                                      : "transparent";
                                }}
                              >
                                <span className="text-base leading-none flex-shrink-0">
                                  {chapter.emoji}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="font-body text-sm truncate"
                                    style={{
                                      color: active
                                        ? chapter.accentColor
                                        : "rgba(255,255,255,0.78)",
                                    }}
                                  >
                                    {chapter.label}
                                  </p>
                                  <p
                                    className="font-body"
                                    style={{
                                      fontSize: "0.63rem",
                                      color: "rgba(255,255,255,0.3)",
                                    }}
                                  >
                                    {chapter.years} · {chapter.photos.length}{" "}
                                    foto
                                  </p>
                                </div>
                                {active && (
                                  <div
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ background: chapter.accentColor }}
                                  />
                                )}
                              </Link>
                            </motion.div>
                          );
                        })
                      )}
                    </div>

                    <div
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <Link
                        to="/gallery"
                        onClick={() => setChapterOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 w-full font-body text-xs transition-colors duration-200"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#e8c4a0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(255,255,255,0.35)")
                        }
                      >
                        Lihat semua gallery
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/about" active={isActive("/about")}>
              About
            </NavLink>
          </div>

          <button
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg flex-shrink-0 transition-all"
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
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 md:hidden"
              style={{ background: "rgba(0,0,0,0.4)" }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-40 md:hidden overflow-y-auto"
              style={{
                width: "min(280px, 80vw)",
                background: "rgba(10,10,22,0.98)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                borderLeft: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span
                  className="font-display text-base"
                  style={{ color: "#e8c4a0", letterSpacing: "0.15em" }}
                >
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-3 py-4 space-y-1">
                <MobileNavLink
                  to="/"
                  active={isActive("/")}
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </MobileNavLink>

                <MobileNavLink
                  to="/gallery"
                  active={isActive("/gallery")}
                  onClick={() => setMobileOpen(false)}
                >
                  Gallery
                </MobileNavLink>

                <div>
                  <button
                    onClick={() => setMobileChapterOpen(!mobileChapterOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-body transition-all duration-200"
                    style={{
                      color: isChapterActive
                        ? "#e8c4a0"
                        : "rgba(255,255,255,0.7)",
                      background: isChapterActive
                        ? "rgba(232,196,160,0.07)"
                        : "transparent",
                    }}
                  >
                    <span style={{ letterSpacing: "0.04em" }}>Chapter</span>
                    <div className="flex items-center gap-2">
                      {chapters.length > 0 && (
                        <span
                          className="px-2 py-0.5 rounded-full font-body text-xs"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "0.65rem",
                          }}
                        >
                          {chapters.length}
                        </span>
                      )}
                      <motion.svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        animate={{ rotate: mobileChapterOpen ? 180 : 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </motion.svg>
                    </div>
                  </button>

                  <AnimatePresence>
                    {mobileChapterOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          className="ml-3 mt-1 mb-1 pl-3 space-y-0.5"
                          style={{
                            borderLeft: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          {chapters.map((chapter) => {
                            const active =
                              location.pathname === `/chapter/${chapter.slug}`;
                            return (
                              <Link
                                key={chapter.id}
                                to={`/chapter/${chapter.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                                style={{
                                  background: active
                                    ? `${chapter.accentColor}14`
                                    : "transparent",
                                  border: active
                                    ? `1px solid ${chapter.accentColor}22`
                                    : "1px solid transparent",
                                }}
                              >
                                <span className="text-sm flex-shrink-0">
                                  {chapter.emoji}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="font-body text-sm truncate"
                                    style={{
                                      color: active
                                        ? chapter.accentColor
                                        : "rgba(255,255,255,0.72)",
                                    }}
                                  >
                                    {chapter.label}
                                  </p>
                                  <p
                                    className="font-body"
                                    style={{
                                      fontSize: "0.62rem",
                                      color: "rgba(255,255,255,0.3)",
                                    }}
                                  >
                                    {chapter.years} · {chapter.photos.length}{" "}
                                    foto
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <MobileNavLink
                  to="/about"
                  active={isActive("/about")}
                  onClick={() => setMobileOpen(false)}
                >
                  About
                </MobileNavLink>
              </div>

              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <p
                  className="font-display text-xs"
                  style={{
                    color: "rgba(255,255,255,0.12)",
                    letterSpacing: "0.2em",
                  }}
                >
                  MEMOIRE
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className="relative px-4 py-2 text-sm font-body transition-all duration-300"
      style={{
        color: active ? "#e8c4a0" : "rgba(255,255,255,0.6)",
        letterSpacing: "0.05em",
      }}
    >
      {children}
      {active && (
        <motion.span
          layoutId="nav-dot"
          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ background: "#e8c4a0" }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

function MobileNavLink({ to, active, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center px-4 py-3 rounded-xl text-sm font-body transition-all duration-200"
      style={{
        color: active ? "#e8c4a0" : "rgba(255,255,255,0.7)",
        background: active ? "rgba(232,196,160,0.07)" : "transparent",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </Link>
  );
}