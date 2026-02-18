import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  userRole,
  isCollapsed,
  onToggleCollapse,
}) {
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem("memoire_sidebar_expanded");
    return saved ? JSON.parse(saved) : { main: true, settings: false };
  });

  useEffect(() => {
    localStorage.setItem("memoire_sidebar_expanded", JSON.stringify(expanded));
  }, [expanded]);

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuStyle = (isActive) => ({
    background: isActive ? "rgba(232,196,160,0.1)" : "transparent",
    color: isActive ? "#e8c4a0" : "rgba(255,255,255,0.5)",
    borderLeft: isActive ? "2px solid #e8c4a0" : "2px solid transparent",
    justifyContent: isCollapsed ? "center" : "flex-start",
    paddingLeft: isCollapsed ? "0" : "1.5rem",
    paddingRight: isCollapsed ? "0" : "1.5rem",
  });

  return (
    <div
      className={`h-full flex flex-col pt-8 pb-6 border-r border-white/5 bg-[#080810] transition-all duration-300 ease-in-out relative group/sidebar ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Toggle Button - Tactical Placement */}
      <button
        onClick={onToggleCollapse}
        className={`absolute -right-3 top-10 w-6 h-6 rounded-full bg-[#1a1a2a] border border-white/10 flex items-center justify-center text-white/40 hover:text-[#e8c4a0] hover:border-[#e8c4a0]/50 transition-all z-50 shadow-xl opacity-0 group-hover/sidebar:opacity-100 ${isCollapsed ? "opacity-100" : ""}`}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Brand */}
      <div
        className={`px-4 mb-12 flex items-center transition-all ${isCollapsed ? "justify-center" : "px-8 gap-3"}`}
      >
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-display text-2xl text-[#e8c4a0] shrink-0">
          M
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="font-display text-sm tracking-[0.2em] text-white/90">
              MEMOIRE
            </h1>
            <p className="font-body text-[9px] tracking-widest text-white/30 uppercase">
              Dashboard
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex-1 px-2 space-y-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {/* MAIN SECTION */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <button
              onClick={() => toggleExpand("main")}
              className="w-full flex items-center justify-between px-4 py-2 font-display text-[10px] tracking-widest text-white/30 uppercase hover:text-white/60 transition-colors"
            >
              Main
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-300 ${expanded.main ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          ) : (
            <div className="w-full h-[1px] bg-white/5 my-4" />
          )}

          <AnimatePresence initial={false}>
            {(expanded.main || isCollapsed) && (
              <motion.div
                initial={
                  isCollapsed
                    ? { opacity: 1, height: "auto" }
                    : { height: 0, opacity: 0 }
                }
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-1"
              >
                {[
                  { id: "overview", label: "Overview", icon: "◈" },
                  { id: "chapters", label: "Chapters", icon: "◉" },
                  { id: "photos", label: "All Photos", icon: "◎" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="w-full flex items-center gap-3 py-2.5 rounded-r-xl font-body text-xs transition-all duration-200 group relative"
                    style={menuStyle(activeTab === item.id)}
                    title={isCollapsed ? item.label : ""}
                  >
                    <span
                      className={`text-base transition-all ${isCollapsed ? "opacity-100" : "opacity-40"}`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.label}</span>}
                    {isCollapsed && activeTab === item.id && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute left-0 w-1 h-6 bg-[#e8c4a0] rounded-r-full"
                      />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SETTINGS SECTION */}
        <div className="pt-2 space-y-1">
          {!isCollapsed ? (
            <button
              onClick={() => toggleExpand("settings")}
              className="w-full flex items-center justify-between px-4 py-2 font-display text-[10px] tracking-widest text-white/30 uppercase hover:text-white/60 transition-colors"
            >
              Settings
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-300 ${expanded.settings ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          ) : (
            <div className="w-full h-[1px] bg-white/5 my-4" />
          )}

          <AnimatePresence initial={false}>
            {(expanded.settings || isCollapsed) && (
              <motion.div
                initial={
                  isCollapsed
                    ? { opacity: 1, height: "auto" }
                    : { height: 0, opacity: 0 }
                }
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-1"
              >
                <button
                  onClick={() => setActiveTab("user")}
                  className="w-full flex items-center gap-3 py-2.5 rounded-r-xl font-body text-xs transition-all duration-200 group relative"
                  style={menuStyle(activeTab === "user")}
                  title={isCollapsed ? "User Management" : ""}
                >
                  <span
                    className={`text-base transition-all ${isCollapsed ? "opacity-100" : "opacity-40"}`}
                  >
                    ⚙
                  </span>
                  {!isCollapsed && <span>User Management</span>}
                  {isCollapsed && activeTab === "user" && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-6 bg-[#e8c4a0] rounded-r-full"
                    />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Info */}
      <div
        className={`px-4 pt-6 border-t border-white/5 transition-all ${isCollapsed ? "flex justify-center" : "px-8"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8c4a0]/20 to-transparent border border-[#e8c4a0]/20 flex items-center justify-center font-display text-xs text-[#e8c4a0] shrink-0">
            {userRole?.[0]?.toUpperCase()}
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-w-0"
            >
              <p className="font-body text-[10px] text-white/80 truncate">
                Admin Mode
              </p>
              <p className="font-body text-[8px] text-white/20 uppercase tracking-tighter">
                {userRole}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
