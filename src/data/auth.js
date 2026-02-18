/**
 * auth.js
 * 
 * IMPORTANT: We deliberately DO NOT import CREDENTIALS from authData.js statically.
 * Static ES module imports are frozen at Vite build time and will NEVER reflect
 * updates pushed to GitHub after deployment. Instead, credentials are always
 * fetched live from GitHub or passed in at runtime.
 */

import { GITHUB_CONFIG } from "./githubSync";

// ─── Session Keys ────────────────────────────────────────────────────────────
const SESSION_KEY = "_m_s_v1_secure";
const INTEGRITY_SALT = "m3m0ir3_2024_auth_layer";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateIntegrity(data) {
  return btoa(JSON.stringify(data) + INTEGRITY_SALT)
    .split("")
    .reverse()
    .join("");
}

// ─── Live Credentials Fetcher ─────────────────────────────────────────────────
// Always fetches the latest authData.js from GitHub — never uses stale bundle data.
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

    // Parse CREDENTIALS array
    const credsMatch = text.match(/export const CREDENTIALS\s*=\s*(\[[\s\S]*?\]);/);
    // Parse SECURITY_CONFIG object
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
// Accepts credentials array directly (fetched live by the caller)
export function loginWithCredentials(username, password, credentials) {
  const found = credentials?.find(
    (c) => c.username === username.trim() && c.password === password,
  );
  if (!found) return null;

  const sessionData = {
    r: found.role,
    u: found.username,
    t: Date.now(),
  };

  const payload = {
    d: btoa(JSON.stringify(sessionData)),
    i: generateIntegrity(sessionData),
  };

  // Store ONLY session token — never store credentials/password in browser
  sessionStorage.setItem(SESSION_KEY, btoa(JSON.stringify(payload)));

  // Clear any legacy stale credential caches that may exist
  _clearLegacyStorage();

  return sessionData;
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  _clearLegacyStorage();
}

// ─── Session Reader ───────────────────────────────────────────────────────────
export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const payload = JSON.parse(atob(raw));
    const sessionData = JSON.parse(atob(payload.d));

    // Verify integrity
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

// ─── Legacy Storage Cleanup ───────────────────────────────────────────────────
// Remove any old credential data accidentally cached in browser storage
function _clearLegacyStorage() {
  const staleKeys = [
    "memoire_github_token",
    "memoire_github_owner",
    "memoire_github_repo",
    "memoire_github_branch",
    "memoire_data",
    "memoire_credentials",
    "memoire_auth",
  ];
  staleKeys.forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

// Run cleanup on module load
_clearLegacyStorage();