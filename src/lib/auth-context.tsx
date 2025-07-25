// lib/auth-context.tsx

"use client";
import { createContext, useContext } from "react";
import { User } from "./auth";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);
