/**
 * auth.js
 *
 * Sumber kebenaran: authData.js (static import — works di local & production)
 * GitHub fetch: hanya dipakai untuk manual refresh setelah push ke repo
 *
 * Kenapa static import lebih baik untuk kasus ini:
 * - Local dev: langsung baca file, tidak perlu network
 * - Production: Vercel rebuild bundle setiap kali authData.js berubah di GitHub
 *   sehingga static import sudah berisi nilai terbaru setelah deploy
 * - Tidak ada dependency ke GitHub token / network saat runtime normal
 */

import { CREDENTIALS, SECURITY_CONFIG } from "./authData";
import { GITHUB_CONFIG } from "./githubSync";

// ─── Session Keys ─────────────────────────────────────────────────────────────
const SESSION_KEY = "_m_s_v1_secure";
const INTEGRITY_SALT = "m3m0ir3_2024_auth_layer";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateIntegrity(data) {
  return btoa(JSON.stringify(data) + INTEGRITY_SALT)
    .split("")
    .reverse()
    .join("");
}

// Bersihkan semua legacy cache dari browser storage
function clearLegacyStorage() {
  const keys = [
    "memoire_github_token",
    "memoire_github_owner",
    "memoire_github_repo",
    "memoire_github_branch",
    "memoire_data",
    "memoire_credentials",
    "memoire_auth",
  ];
  keys.forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}
clearLegacyStorage();

// ─── Sumber data utama (static — langsung dari file) ─────────────────────────
// Ini yang dipakai di seluruh app. Setelah Vercel deploy ulang,
// nilai ini otomatis mengikuti authData.js terbaru.
export function getStaticCredentials() {
  return CREDENTIALS;
}

export function getStaticSecurityConfig() {
  return SECURITY_CONFIG;
}

// ─── GitHub fetch (hanya untuk manual refresh / post-save sync) ──────────────
// Dipanggil HANYA ketika user menekan tombol refresh manual di dashboard,
// atau setelah Vercel build selesai. Bukan sumber utama.
export async function fetchLiveAuthData() {
  try {
    const { owner, repo, branch, getToken } = GITHUB_CONFIG;
    const token = getToken();

    const url = token
      ? `https://api.github.com/repos/${owner}/${repo}/contents/src/data/authData.js?ref=${branch}&t=${Date.now()}`
      : `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/src/data/authData.js?t=${Date.now()}`;

    const headers = { Accept: "application/vnd.github.v3.raw" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { cache: "no-store", headers });
    if (!res.ok) return null;

    const text = await res.text();

    const credsMatch = text.match(/export const CREDENTIALS\s*=\s*(\[[\s\S]*?\]);/);
    const secMatch = text.match(/export const SECURITY_CONFIG\s*=\s*(\{[\s\S]*?\});/);

    const credentials = credsMatch ? new Function(`return ${credsMatch[1]}`)() : null;
    const securityConfig = secMatch ? new Function(`return ${secMatch[1]}`)() : null;

    return { credentials, securityConfig };
  } catch (e) {
    console.warn("[auth] fetchLiveAuthData failed:", e.message);
    return null;
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
// Menerima credentials array sebagai parameter — caller yang tentukan sumber datanya
export function loginWithCredentials(username, password, credentials) {
  const list = credentials ?? CREDENTIALS;
  const found = list.find(
    (c) => c.username === username.trim() && c.password === password,
  );
  if (!found) return null;

  const sessionData = { r: found.role, u: found.username, t: Date.now() };
  const payload = {
    d: btoa(JSON.stringify(sessionData)),
    i: generateIntegrity(sessionData),
  };

  sessionStorage.setItem(SESSION_KEY, btoa(JSON.stringify(payload)));
  clearLegacyStorage();
  return sessionData;
}

// Backward-compat: login langsung pakai CREDENTIALS dari authData
export function login(username, password) {
  return loginWithCredentials(username, password, CREDENTIALS);
}

// ─── Session ──────────────────────────────────────────────────────────────────
export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  clearLegacyStorage();
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const payload = JSON.parse(atob(raw));
    const sessionData = JSON.parse(atob(payload.d));
    if (payload.i !== generateIntegrity(sessionData)) {
      console.warn("[auth] Session integrity check failed.");
      logout();
      return null;
    }
    return { role: sessionData.r, username: sessionData.u };
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return getSession() !== null;
}

export function useAuth() {
  const session = getSession();
  return {
    session,
    isLoggedIn: !!session,
    isOwner: session?.role === "owner",
    isAdmin: session?.role === "admin",
    role: session?.role ?? null,
    username: session?.username ?? null,
  };
}