// lib/protected-route.tsx

"use client";
import { useAuth } from "./auth-context";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null; // Or show spinner

  return <>{children}</>;
}
