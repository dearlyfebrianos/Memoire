// CREDENTIALS imported only for internal use in login()
import { CREDENTIALS } from "./authData";

// We don't re-export CREDENTIALS to avoid circular dependency confusion

// Security: Obfuscated keys to confuse casual hackers
const SESSION_KEY = "_m_s_v1_secure";
const INTEGRITY_SALT = "m3m0ir3_2024_auth_layer";

function generateIntegrity(data) {
  return btoa(JSON.stringify(data) + INTEGRITY_SALT)
    .split("")
    .reverse()
    .join("");
}

export function login(username, password) {
  const found = CREDENTIALS.find(
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

  sessionStorage.setItem(SESSION_KEY, btoa(JSON.stringify(payload)));
  return sessionData;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const payload = JSON.parse(atob(raw));
    const sessionData = JSON.parse(atob(payload.d));

    // Verify Integrity
    if (payload.i !== generateIntegrity(sessionData)) {
      console.warn("Security Breach: Session Manipulation Detected.");
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
