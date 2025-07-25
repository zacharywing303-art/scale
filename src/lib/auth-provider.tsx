// lib/auth-provider.tsx

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "./auth-context";
import { getSession, clearSession } from "./auth";

import type { User } from "./auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);

      // Session timeout
      const expiresAt = JSON.parse(
        localStorage.getItem("unity_user") || "{}"
      ).expiresAt;
      const timeLeft = expiresAt - Date.now();

      const timeout = setTimeout(() => {
        clearSession();
        setUser(null);
        router.push("/login");
      }, timeLeft);

      return () => clearTimeout(timeout);
    } else {
      router.push("/login");
    }
  }, []);

  const logout = () => {
    clearSession();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
