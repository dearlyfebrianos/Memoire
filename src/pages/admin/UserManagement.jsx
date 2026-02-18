import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pushAuthToGitHub } from "../../data/githubSync";

export default function UserManagement({
  currentUser,
  isOwner,
  initialCredentials,
}) {
  const [users, setUsers] = useState(initialCredentials);
  const [status, setStatus] = useState("idle"); // idle | saving | success | error
  const [error, setError] = useState("");

  const handleUpdate = async (username, newUsername, newPassword) => {
    setStatus("saving");
    try {
      const updatedUsers = users.map((u) =>
        u.username === username
          ? { ...u, username: newUsername, password: newPassword }
          : u,
      );

      await pushAuthToGitHub(updatedUsers);
      setUsers(updatedUsers);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (e) {
      setError(e.message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h2 className="font-display text-3xl md:text-4xl text-white/90 tracking-tight">
            User Management
          </h2>
          <p className="font-body text-sm text-white/40 mt-2 max-w-md leading-relaxed">
            Kelola akses dan keamanan akun administrator. Perubahan akan
            disinkronisasi ke GitHub.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {users.map((user) => {
          const canEdit = isOwner || user.username === currentUser;
          if (!canEdit && !isOwner) return null;

          return (
            <UserCard
              key={user.role}
              user={user}
              onSave={handleUpdate}
              isSelf={user.username === currentUser}
              status={status}
            />
          );
        })}
      </div>

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
              <p className="font-body text-xs text-red-400/60 max-w-[200px]">
                {error}
              </p>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
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

function UserCard({ user, onSave, isSelf, status }) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState(user.password);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);

  const hasChanged = username !== user.username || password !== user.password;

  return (
    <div className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/5 to-white/0 overflow-hidden transition-all duration-500 hover:from-white/10">
      <div className="relative h-full bg-[#0a0a0f] rounded-[22px] p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display text-2xl shadow-lg ${user.role === 'owner' ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-orange-200 border border-orange-500/30' : 'bg-white/5 text-white/40 border border-white/10'}`}>
              {user.role[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-display text-lg text-white/90 capitalize tracking-wide">
                {user.role}
              </h3>
              <p className="font-body text-xs text-white/30 uppercase tracking-widest mt-0.5">
                {isSelf ? "Currently Active" : "Account Access"}
              </p>
            </div>
          </div>
          {isSelf && (
            <div className="px-3 py-1 rounded-full bg-[#e8c4a0]/10 border border-[#e8c4a0]/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e8c4a0] animate-pulse" />
              <span className="font-body text-[10px] uppercase tracking-wider text-[#e8c4a0]">
                You
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium ml-1">
              Username
            </label>
            <div 
              className={`relative flex items-center bg-white/[0.03] border rounded-xl transition-all duration-300 ${focused === 'user' ? 'border-[#e8c4a0]/50 bg-white/[0.06] shadow-[0_0_15px_-5px_rgba(232,196,160,0.3)]' : 'border-white/10 hover:border-white/20'}`}
            >
              <div className="pl-4 text-white/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocused('user')}
                onBlur={() => setFocused(null)}
                type="text"
                className="w-full bg-transparent border-none px-4 py-3.5 font-body text-sm text-white/90 placeholder-white/20 focus:ring-0"
                placeholder="Enter username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium ml-1">
              Password
            </label>
            <div 
               className={`relative flex items-center bg-white/[0.03] border rounded-xl transition-all duration-300 ${focused === 'pass' ? 'border-[#e8c4a0]/50 bg-white/[0.06] shadow-[0_0_15px_-5px_rgba(232,196,160,0.3)]' : 'border-white/10 hover:border-white/20'}`}
            >
              <div className="pl-4 text-white/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused(null)}
                className="w-full bg-transparent border-none px-4 py-3.5 font-body text-sm text-white/90 placeholder-white/20 focus:ring-0"
                placeholder="Enter password"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 p-2 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            disabled={!hasChanged || status === "saving"}
            onClick={() => onSave(user.username, username, password)}
            className="group/btn w-full relative overflow-hidden rounded-xl py-4 font-display text-xs uppercase tracking-[0.15em] transition-all duration-300 transform active:scale-[0.98]"
            style={{
              background: hasChanged ? "#e8c4a0" : "rgba(255,255,255,0.03)",
              color: hasChanged ? "#000" : "rgba(255,255,255,0.2)",
              cursor: hasChanged ? "pointer" : "not-allowed",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
               {status === "saving" && hasChanged ? (
                 <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                  Saving Changes...
                 </>
               ) : (
                 <>
                   {hasChanged ? "Save Credential Updates" : "No Changes Detected"}
                   {hasChanged && <svg className="transform transition-transform group-hover/btn:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                 </>
               )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
