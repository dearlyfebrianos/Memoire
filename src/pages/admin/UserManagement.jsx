import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pushAuthToGitHub } from "../../data/githubSync";
import { SECURITY_CONFIG } from "../../data/authData";

export default function UserManagement({
  currentUser,
  isOwner,
  initialCredentials,
  onUpdate,
}) {
  const [users, setUsers] = useState(initialCredentials);
  const [selectedUsername, setSelectedUsername] = useState(currentUser);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setUsers(initialCredentials);
  }, [initialCredentials]);

  const activeUser =
    users.find((u) => u.username === selectedUsername) || users[0];

  const handleUpdate = async (
    username,
    newUsername,
    newPassword,
    newAvatar,
    newBio,
    newDisplayName,
  ) => {
    setStatus("saving");
    try {
      const updatedUsers = users.map((u) =>
        u.username === username
          ? {
              ...u,
              username: newUsername,
              password: newPassword,
              avatar: newAvatar,
              bio: newBio,
              displayName: newDisplayName,
            }
          : u,
      );

      await pushAuthToGitHub(updatedUsers, SECURITY_CONFIG);
      setUsers(updatedUsers);
      if (onUpdate) onUpdate(updatedUsers);

      if (username === selectedUsername) {
        setSelectedUsername(newUsername);
      }

      setStatus("success");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (e) {
      setError(e.message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const handleLockdownUpdate = async (newCode) => {
    setStatus("saving");
    try {
      const newSecurityConfig = { ...SECURITY_CONFIG, lockdownCode: newCode };
      await pushAuthToGitHub(users, newSecurityConfig);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (e) {
      setError(e.message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pt-4">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h2 className="font-display text-3xl md:text-4xl text-white/90 tracking-tight">
            User Management
          </h2>
          <p className="font-body text-sm text-white/40 mt-2 max-w-md leading-relaxed">
            Kelola profil, akses, dan keamanan akun administrator.
          </p>
        </div>
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-body text-white/40">
          Sync Status:{" "}
          <span
            className={
              status === "saving"
                ? "text-yellow-400"
                : status === "success"
                  ? "text-green-400"
                  : status === "error"
                    ? "text-red-400"
                    : "text-white/60"
            }
          >
            {status === "idle"
              ? "Ready"
              : status === "saving"
                ? "Syncing..."
                : status === "success"
                  ? "Synced"
                  : "Error"}
          </span>
        </div>
      </div>

      {/* Account Selector (Owner Only) */}
      {isOwner && (
        <div className="flex gap-4 items-center">
          <span className="text-xs uppercase tracking-widest text-white/30 font-display">
            Select Account:
          </span>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
            {users.map((u) => (
              <button
                key={u.role}
                onClick={() => setSelectedUsername(u.username)}
                className={`px-4 py-2 rounded-lg text-xs font-display uppercase tracking-widest transition-all ${
                  selectedUsername === u.username
                    ? "bg-[#e8c4a0] text-[#0a0a0f] shadow-lg"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {u.role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Card */}
      <div className="w-full">
        <UserCard
          key={activeUser.role}
          user={activeUser}
          onSave={handleUpdate}
          isSelf={activeUser.username === currentUser}
          status={status}
        />
      </div>

      {/* Lockdown Code Manager — Owner Only */}
      {isOwner && (
        <LockdownManager
          currentCode={SECURITY_CONFIG.lockdownCode}
          onSave={handleLockdownUpdate}
          status={status}
        />
      )}

      {/* Toasts */}
      <AnimatePresence>
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl bg-[#0f0f12] border border-red-500/20 shadow-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 text-red-400">
              ⚠️
            </div>
            <div>
              <h4 className="font-display text-sm text-red-200">Gagal Update</h4>
              <p className="font-body text-xs text-red-400/60 max-w-[200px]">{error}</p>
            </div>
          </motion.div>
        )}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl bg-[#0f0f12] border border-green-500/20 shadow-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h4 className="font-display text-sm text-green-200">Berhasil Disimpan</h4>
              <p className="font-body text-xs text-green-400/60 max-w-[240px]">
                Perubahan tersimpan. Vercel akan deploy otomatis dalam 30-60 detik.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Lockdown Code Manager (Owner Only)
───────────────────────────────────────────── */
function LockdownManager({ currentCode, onSave, status }) {
  const [code, setCode] = useState(currentCode);
  const [showCode, setShowCode] = useState(false);
  const [focused, setFocused] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const hasChanged = code !== currentCode;
  const isMatch = code === confirmCode;

  return (
    <div className="relative p-1 rounded-3xl bg-gradient-to-b from-amber-500/10 to-transparent overflow-hidden">
      <div className="bg-[#0a0a0f] rounded-[22px] p-8 md:p-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-lg text-white/90 uppercase tracking-widest">
              Lockdown Code
            </h3>
            <p className="font-body text-xs text-white/30 mt-0.5">
              Kode rahasia untuk mengunci sistem. Hanya owner yang bisa mengubah ini.
            </p>
          </div>
          <div className="ml-auto px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-display uppercase tracking-widest">
            Owner Only
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Code Input */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest text-white/30 font-medium ml-1">
              New Lockdown Code
            </label>
            <div
              className={`relative flex items-center bg-white/[0.03] border rounded-2xl transition-all duration-300 ${
                focused
                  ? "border-amber-500/50 bg-white/[0.06] shadow-[0_0_20px_-10px_rgba(245,158,11,0.3)]"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="pl-5 text-white/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <input
                type={showCode ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full bg-transparent border-none px-5 py-4 font-body text-sm text-white/90 placeholder-white/20 focus:ring-0"
                placeholder="Masukkan kode baru..."
              />
              <button
                onClick={() => setShowCode(!showCode)}
                className="absolute right-4 p-2 rounded-xl text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
              >
                {showCode ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Code Input */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest text-white/30 font-medium ml-1">
              Konfirmasi Kode
            </label>
            <div
              className={`relative flex items-center bg-white/[0.03] border rounded-2xl transition-all duration-300 ${
                confirmCode
                  ? isMatch
                    ? "border-green-500/40 bg-white/[0.04]"
                    : "border-red-500/40 bg-white/[0.04]"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className={`pl-5 ${confirmCode ? (isMatch ? "text-green-400" : "text-red-400") : "text-white/20"}`}>
                {confirmCode ? (
                  isMatch ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                className="w-full bg-transparent border-none px-5 py-4 font-body text-sm text-white/90 placeholder-white/20 focus:ring-0"
                placeholder="Ulangi kode baru..."
              />
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 p-2 rounded-xl text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
              >
                {showConfirm ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {confirmCode && !isMatch && (
              <p className="text-[10px] text-red-400/70 font-body ml-1">Kode tidak cocok</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          disabled={!hasChanged || !isMatch || !code || status === "saving"}
          onClick={() => onSave(code)}
          className="w-full relative overflow-hidden rounded-2xl py-4 font-display text-sm uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.99]"
          style={{
            background:
              hasChanged && isMatch && code
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "rgba(255,255,255,0.03)",
            color: hasChanged && isMatch && code ? "#000" : "rgba(255,255,255,0.2)",
            cursor: hasChanged && isMatch && code ? "pointer" : "not-allowed",
            boxShadow:
              hasChanged && isMatch && code
                ? "0 10px 30px -10px rgba(245,158,11,0.4)"
                : "none",
          }}
        >
          <span className="flex items-center justify-center gap-3">
            {status === "saving" ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Saving Lockdown Code...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {hasChanged && isMatch && code
                  ? "Update Lockdown Code"
                  : !code
                    ? "Masukkan kode baru"
                    : !isMatch
                      ? "Kode belum cocok"
                      : "Tidak ada perubahan"}
              </>
            )}
          </span>
        </button>

        {/* Warning note */}
        <p className="text-[10px] text-amber-500/40 font-body text-center uppercase tracking-widest">
          ⚠ Pastikan kode baru mudah diingat — kode ini digunakan untuk lockdown darurat
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   User Card Component
───────────────────────────────────────────── */
function UserCard({ user, onSave, isSelf, status }) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState(user.password);
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [bio, setBio] = useState(user.bio || "");
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);

  const hasChanged =
    username !== user.username ||
    password !== user.password ||
    avatar !== (user.avatar || "") ||
    bio !== (user.bio || "") ||
    displayName !== (user.displayName || "");

  return (
    <div className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/5 to-white/0 overflow-hidden transition-all duration-500 hover:from-white/10 w-full">
      <div className="relative h-full bg-[#0a0a0f] rounded-[22px] p-8 md:p-12 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 gap-6 md:gap-0">
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-3xl object-cover shadow-2xl border border-white/10 bg-white/5"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://ui-avatars.com/api/?name=" + (displayName || username);
                  }}
                />
              ) : (
                <div
                  className={`w-24 h-24 rounded-3xl flex items-center justify-center font-display text-4xl shadow-2xl ${
                    user.role === "owner"
                      ? "bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-orange-200 border border-orange-500/30"
                      : "bg-white/5 text-white/40 border border-white/10"
                  }`}
                >
                  {(displayName || user.role)[0].toUpperCase()}
                </div>
              )}
              {isSelf && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0a0a0f] flex items-center justify-center border border-white/10">
                  <div className="w-4 h-4 rounded-full bg-[#e8c4a0] animate-pulse border-2 border-[#0a0a0f]" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-display text-2xl text-white/90 capitalize tracking-wide">
                {displayName || username}
                <span className="ml-3 text-[10px] uppercase tracking-[0.2em] text-white/20 border border-white/10 px-2 py-1 rounded-md">
                  {user.role}
                </span>
              </h3>
              <p className="font-body text-sm text-white/30 tracking-wide mt-1 max-w-sm">
                {bio || (isSelf ? "Tambahkan bio anda..." : "Belum ada bio.")}
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Public Info */}
          <div className="space-y-6">
            <h4 className="font-display text-xs uppercase tracking-widest text-[#e8c4a0]/60 border-b border-white/5 pb-2 mb-4">
              Public Profile
            </h4>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-white/30 font-medium ml-1">Display Name</label>
              <div className={`relative flex items-center bg-white/[0.03] border rounded-2xl transition-all duration-300 ${focused === "display" ? "border-[#e8c4a0]/50 bg-white/[0.06] shadow-[0_0_20px_-10px_rgba(232,196,160,0.3)]" : "border-white/10 hover:border-white/20"}`}>
                <div className="pl-6 text-white/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} onFocus={() => setFocused("display")} onBlur={() => setFocused(null)} type="text" className="w-full bg-transparent border-none px-6 py-5 font-body text-sm text-white/90 placeholder-white/20 focus:ring-0" placeholder="Nama keren kamu..." />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-white/30 font-medium ml-1">Avatar URL</label>
              <div className={`relative flex items-center bg-white/[0.03] border rounded-2xl transition-all duration-300 ${focused === "avatar" ? "border-[#e8c4a0]/50 bg-white/[0.06] shadow-[0_0_20px_-10px_rgba(232,196,160,0.3)]" : "border-white/10 hover:border-white/20"}`}>
                <div className="pl-6 text-white/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </div>
                <input value={avatar} onChange={(e) => setAvatar(e.target.value)} onFocus={() => setFocused("avatar")} onBlur={() => setFocused(null)} type="text" className="w-full bg-transparent border-none px-6 py-5 font-body text-sm text-white/90 placeholder-white/20 focus:ring-0" placeholder="https://example.com/avatar.jpg" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-white/30 font-medium ml-1">Bio / Description</label>
              <div className={`relative flex items-start bg-white/[0.03] border rounded-2xl transition-all duration-300 ${focused === "bio" ? "border-[#e8c4a0]/50 bg-white/[0.06] shadow-[0_0_20px_-10px_rgba(232,196,160,0.3)]" : "border-white/10 hover:border-white/20"}`}>
                <div className="pl-6 pt-5 text-white/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </div>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} onFocus={() => setFocused("bio")} onBlur={() => setFocused(null)} rows="3" className="w-full bg-transparent border-none px-6 py-5 font-body text-sm text-white/90 placeholder-white/20 focus:ring-0 resize-none" placeholder="Tell us about this role..." />
              </div>
            </div>
          </div>

          {/* Right Column: Credentials */}
          <div className="space-y-6">
            <h4 className="font-display text-xs uppercase tracking-widest text-[#e8c4a0]/60 border-b border-white/5 pb-2 mb-4">
              Security Credentials
            </h4>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-white/30 font-medium ml-1">Username</label>
              <div className={`relative flex items-center bg-white/[0.03] border rounded-2xl transition-all duration-300 ${focused === "user" ? "border-[#e8c4a0]/50 bg-white/[0.06] shadow-[0_0_20px_-10px_rgba(232,196,160,0.3)]" : "border-white/10 hover:border-white/20"}`}>
                <div className="pl-6 text-white/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <input value={username} onChange={(e) => setUsername(e.target.value)} onFocus={() => setFocused("user")} onBlur={() => setFocused(null)} type="text" className="w-full bg-transparent border-none px-6 py-5 font-body text-base text-white/90 placeholder-white/20 focus:ring-0" placeholder="Enter username" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-white/30 font-medium ml-1">Password</label>
              <div className={`relative flex items-center bg-white/[0.03] border rounded-2xl transition-all duration-300 ${focused === "pass" ? "border-[#e8c4a0]/50 bg-white/[0.06] shadow-[0_0_20px_-10px_rgba(232,196,160,0.3)]" : "border-white/10 hover:border-white/20"}`}>
                <div className="pl-6 text-white/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)} className="w-full bg-transparent border-none px-6 py-5 font-body text-base text-white/90 placeholder-white/20 focus:ring-0" placeholder="Enter password" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-4 p-2 rounded-xl text-white/20 hover:text-white/60 hover:bg-white/5 transition-all">
                  {showPass ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            disabled={!hasChanged || status === "saving"}
            onClick={() => onSave(user.username, username, password, avatar, bio, displayName)}
            className="group/btn w-full relative overflow-hidden rounded-2xl py-5 font-display text-sm uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-[0.99]"
            style={{
              background: hasChanged ? "#e8c4a0" : "rgba(255,255,255,0.03)",
              color: hasChanged ? "#000" : "rgba(255,255,255,0.2)",
              cursor: hasChanged ? "pointer" : "not-allowed",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {status === "saving" && hasChanged ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                  Saving Profile...
                </>
              ) : (
                <>
                  {hasChanged ? "Save Profile Changes" : "No Changes Detected"}
                  {hasChanged && (
                    <svg className="transform transition-transform group-hover/btn:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  )}
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}