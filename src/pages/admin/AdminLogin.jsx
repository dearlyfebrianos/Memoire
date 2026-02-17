import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ADMIN_USER = "dearly";
const ADMIN_PASS = "dearlyfebriano08";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem("memoire_admin", "true");
        navigate("/admin/dashboard");
      } else {
        setError("Username atau password salah.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #080810 0%, #0f0e1f 50%, #0d1220 100%)",
      }}
    >
      <div
        className="fixed w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #3d2b6e, transparent)",
          filter: "blur(80px)",
          opacity: 0.2,
          top: "-100px",
          left: "-100px",
        }}
      />
      <div
        className="fixed w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #1a3a5c, transparent)",
          filter: "blur(80px)",
          opacity: 0.2,
          bottom: "10%",
          right: "-80px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative"
      >
        <div
          className="rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 font-display text-xl"
              style={{
                background: "rgba(232,196,160,0.1)",
                border: "1px solid rgba(232,196,160,0.3)",
                color: "#e8c4a0",
                boxShadow: "0 0 30px rgba(232,196,160,0.1)",
              }}
            >
              ✦
            </div>
            <h1
              className="font-display text-2xl mb-1"
              style={{ color: "rgba(255,255,255,0.9)", fontWeight: 300 }}
            >
              Admin Panel
            </h1>
            <p
              className="font-body text-xs"
              style={{
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.1em",
              }}
            >
              MEMOIRE
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block font-body text-xs mb-2"
                style={{
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.9)",
                  cursor: "text",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(232,196,160,0.4)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(232,196,160,0.06)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                className="block font-body text-xs mb-2"
                style={{
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 pr-12 rounded-xl font-body text-sm outline-none transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.9)",
                    cursor: "text",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(232,196,160,0.4)";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(232,196,160,0.06)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {showPass ? (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2.5 rounded-xl font-body text-xs"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#fca5a5",
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-body text-sm tracking-widest uppercase transition-all duration-300 mt-2"
              style={{
                background: loading
                  ? "rgba(232,196,160,0.08)"
                  : "rgba(232,196,160,0.12)",
                border: "1px solid rgba(232,196,160,0.3)",
                color: loading ? "rgba(232,196,160,0.4)" : "#e8c4a0",
                letterSpacing: "0.15em",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Masuk...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center mt-6 font-body text-xs"
          style={{ color: "rgba(255,255,255,0.18)" }}
        >
          Memoire Admin Panel · Private Access
        </p>
      </motion.div>
    </div>
  );
}