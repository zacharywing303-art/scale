"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function SystemAdminDashboardPage() {
  const router = useRouter();
  // const user = getLoggedInUser();

  // useEffect(() => {
  //   if (!user || user.role !== "system_admin") {
  //     router.replace("/login");
  //   }
  // }, []);

  // if (!user || user.role !== "system_admin") return null;
  return (
    <ProtectedRoute allowedRoles={["SYSTEM_ADMIN", "MAIN_ADMIN"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/system_admin/agencies">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <CardTitle>Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                View and manage all agencies using the platform.
              </CardContent>
            </Card>
          </Link>

          <Link href="/system_admin/support-requests">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <CardTitle>Support Requests</CardTitle>
              </CardHeader>
              <CardContent>Track and respond to support tickets.</CardContent>
            </Card>
          </Link>

          <Link href="/system_admin/user-management">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                Reset passwords, assign roles, and manage accounts.
              </CardContent>
            </Card>
          </Link>

          <Link href="/system_admin/settings">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                Configure global settings for all agencies.
              </CardContent>
            </Card>
          </Link>

          <Link href="/system_admin/statistics">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <CardTitle>Agency Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                View usage metrics and performance data.
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
