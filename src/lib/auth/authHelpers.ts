import { MockUser } from "./mockUsers";

export function getLoggedInUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("loggedInUser");
  return stored ? JSON.parse(stored) : null;
}

export function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "/login";
}
