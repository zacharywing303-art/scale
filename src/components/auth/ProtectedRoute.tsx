"use client";

import { useAuth } from "@/app/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ProtectedRouteProps = {
  allowedRoles?: string[];
  permission?: string;
  children: React.ReactNode;
};

export default function ProtectedRoute({
  allowedRoles = [],
  permission,
  children,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const hasHandled = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || hasHandled.current) return;

    // Not logged in? Redirect
    if (!isAuthenticated) {
      router.push("/login");
      hasHandled.current = true;
      return;
    }

    // ✅ Check role
    const userRole = user?.role ?? user?.roleType?.name ?? "";
    const roleAllowed =
      allowedRoles.length === 0 || allowedRoles.includes(userRole);

    // ✅ Check permission (if specified)
    let hasPermission = true;
    if (permission) {
      const userPermissions =
        user?.roleType?.permissions?.map((p) => p.name) ?? [];
      hasPermission = userPermissions.includes(permission);
    }

    // ❌ Block if either role or permission fails
    if (!roleAllowed || !hasPermission) {
      setUnauthorized(true);
      hasHandled.current = true;
      return;
    }
  }, [
    mounted,
    isAuthenticated,
    user,
    allowedRoles,
    permission,
    router,
    pathname,
  ]);

  // Handle unauthorized
  useEffect(() => {
    if (unauthorized) {
      const confirmed = window.confirm(
        "You do not have permission to access this page. Please contact your system administrator."
      );

      if (confirmed || !confirmed) {
        router.back();
        setTimeout(() => window.location.reload(), 100);
      }
    }
  }, [unauthorized, router]);

  if (!mounted) return null;
  if (!isAuthenticated || unauthorized) return null;

  return <>{children}</>;
}
