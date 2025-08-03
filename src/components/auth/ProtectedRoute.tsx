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
  const [unauthorized, setUnauthorized] = useState(false);
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;

    if (!isAuthenticated) {
      router.push("/login");
      hasHandled.current = true;
    } else if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user?.role ?? "")
    ) {
      setUnauthorized(true);
      hasHandled.current = true;
    }
  }, [isAuthenticated, user, allowedRoles, router, pathname]);

  useEffect(() => {
    if (unauthorized) {
      const confirmed = window.confirm(
        "You do not have permissions to access this page. Please contact the system administrator if you believe this is an error."
      );

      // Go back and reload previous page only once
      if (confirmed || !confirmed) {
        router.back();
        // Optional: reload page after going back
        setTimeout(() => window.location.reload(), 100);
      }
    }
  }, [unauthorized, router]);

  if (!isAuthenticated || unauthorized) return null;

  return <>{children}</>;
}
