import { User } from "@/lib/auth";

export function getLoggedInUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("loggedInUser");
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "/login";
}
