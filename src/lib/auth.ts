// lib/auth.ts

export type User = {
  id: string;
  name: string;
  email: string;
  role: "MAIN_ADMIN" | "SYSTEM_ADMIN" | "AGENCY_USER" | "AGENCY_ADMIN";
  agencyCode?: string;
};

const SESSION_KEY = "unity_user";
const SESSION_EXPIRATION_MINUTES = 15;

export function setSession(user: User) {
  const now = new Date().getTime();
  const expiresAt = now + SESSION_EXPIRATION_MINUTES * 60 * 1000;
  const sessionData = JSON.stringify({ user, expiresAt });
  localStorage.setItem(SESSION_KEY, sessionData);
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const { user, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      clearSession();
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
