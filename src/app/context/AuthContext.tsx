"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type Role = "main_admin" | "system_admin" | "agency_user";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  agencyCode?: string;
};

type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("unity_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Monitor session timeout
  useEffect(() => {
    const checkTimeout = () => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        logout();
      }
    };
    const interval = setInterval(checkTimeout, 60_000);
    return () => clearInterval(interval);
  }, [lastActivity]);

  const login = (userData: User) => {
    localStorage.setItem("unity_user", JSON.stringify(userData));
    setUser(userData);
    setLastActivity(Date.now());
  };

  const logout = () => {
    localStorage.removeItem("unity_user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
