"use client";

import { useAuth } from "@/app/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ProtectedRouteProps = {
  allowedRoles?: string[];
  children: React.ReactNode;
};

export default function ProtectedRoute({
  allowedRoles = [],
  children,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const hasHandled = useRef(false);

  // ✅ Wait for client mount before checking anything
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || hasHandled.current) return;

    if (!isAuthenticated) {
      router.push("/login");
      hasHandled.current = true;
    } else if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user?.role ?? user?.roleType?.name ?? "")
    ) {
      setUnauthorized(true);
      hasHandled.current = true;
    }
  }, [mounted, isAuthenticated, user, allowedRoles, router, pathname]);

  useEffect(() => {
    if (unauthorized) {
      const confirmed = window.confirm(
        "You do not have permissions to access this page. Please contact the system administrator if you believe this is an error."
      );

      if (confirmed || !confirmed) {
        router.back();
        setTimeout(() => window.location.reload(), 100);
      }
    }
  }, [unauthorized, router]);

  // ✅ Don’t render until mounted (prevents SSR mismatch)
  if (!mounted) return null;
  if (!isAuthenticated || unauthorized) return null;

  return <>{children}</>;
}
