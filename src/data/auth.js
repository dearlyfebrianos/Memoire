const CREDENTIALS = [
  {
    username: "dearly",
    password: "dearlyfebriano08",
    role: "owner",
  },
  {
    username: "admin",
    password: "memoireadmin2026",
    role: "admin",
  },
];

const SESSION_KEY = "memoire_session";

export function login(username, password) {
  const found = CREDENTIALS.find(
    (c) => c.username === username.trim() && c.password === password,
  );
  if (!found) return null;
  const session = { role: found.role, username: found.username };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem("memoire_admin");
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
    if (sessionStorage.getItem("memoire_admin") === "true") {
      return { role: "owner", username: "dearly" };
    }
    return null;
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