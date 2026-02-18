import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CREDENTIALS, generateAuthJS } from "../../data/auth";
import { pushAuthToGitHub } from "../../data/githubSync";
import { GlassCard } from "./AdminDashboard"; // Export GlassCard or redefine

export default function UserManagement({ currentUser, isOwner }) {
  const [users, setUsers] = useState(CREDENTIALS);
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

      await pushAuthToGitHub(updatedUsers, generateAuthJS);
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="font-display text-4xl mb-3 font-light text-white/90">
          User Management
        </h2>
        <p className="font-body text-sm text-white/40">
          Update credentials and manage access permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 right-10 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-body text-sm"
          >
            {error}
          </motion.div>
        )}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 right-10 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-body text-sm"
          >
            Berhasil diupdate ke GitHub! Mohon tunggu 30-60 detik.
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

  const hasChanged = username !== user.username || password !== user.password;

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display text-sm text-white/40">
            {user.role[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-sm text-white/90 uppercase tracking-widest">
              {user.role}
            </h3>
            {isSelf && (
              <span className="text-[10px] text-[#e8c4a0] uppercase border border-[#e8c4a0]/30 px-2 py-0.5 rounded-full">
                Akun Kamu
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="font-display text-[10px] uppercase tracking-widest text-white/30 ml-1">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white/80 outline-none focus:border-[#e8c4a0]/30 transition-all"
          />
        </div>
        <div className="space-y-1.5 relative">
          <label className="font-display text-[10px] uppercase tracking-widest text-white/30 ml-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body text-sm text-white/80 outline-none focus:border-[#e8c4a0]/30 transition-all"
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
      </div>

      <button
        disabled={!hasChanged || status === "saving"}
        onClick={() => onSave(user.username, username, password)}
        className="w-full py-3 rounded-xl font-display text-xs tracking-widest uppercase transition-all"
        style={{
          background: hasChanged
            ? "rgba(232,196,160,0.15)"
            : "rgba(255,255,255,0.03)",
          border: hasChanged
            ? "1px solid rgba(232,196,160,0.3)"
            : "1px solid rgba(255,255,255,0.05)",
          color: hasChanged ? "#e8c4a0" : "rgba(255,255,255,0.1)",
          cursor: hasChanged ? "pointer" : "not-allowed",
        }}
      >
        {status === "saving" ? "Menyimpan..." : "Update Credentials"}
      </button>
    </div>
  );
}
