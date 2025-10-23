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

    // Not logged in -> redirect to login
    if (!isAuthenticated) {
      router.push("/login");
      hasHandled.current = true;
      return;
    }

    // Determine user's primary role string
    const userRole = user?.role ?? user?.roleType?.name ?? "";

    // 1) Role check
    const roleAllowed =
      allowedRoles.length === 0 || allowedRoles.includes(userRole);

    // 2) Permission check (if requested)
    // By default, assume true (if no permission required)
    let hasPermission = true;

    if (permission) {
      // If user is an AGENCY_ADMIN and AGENCY_ADMIN is an allowedRole,
      // bypass permission check and allow access.
      if (
        userRole === "AGENCY_ADMIN" &&
        allowedRoles.includes("AGENCY_ADMIN")
      ) {
        hasPermission = true;
      } else {
        // Otherwise, check permissions array from roleType
        const userPermissions =
          user?.roleType?.permissions?.map((p: any) => p.name) ?? [];
        hasPermission = userPermissions.includes(permission);
      }
    }

    // Block if role fails OR permission fails
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
