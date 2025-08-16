"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Type for chat request
interface ChatRequest {
  threadId: string;
  from: {
    userId: string;
    displayName: string;
    participantType: string;
  };
  startedAt: string;
}

export default function SystemAdminDashboardPage() {
  const router = useRouter();
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);

  const fetchChatRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/chat/requests"); // Backend endpoint returning pending requests
      const data: ChatRequest[] = await res.json();
      setChatRequests(data);
    } catch (err) {
      console.error("Failed to fetch chat requests", err);
    }
  };

  useEffect(() => {
    fetchChatRequests();
    // Optionally, poll every 10-15s for new requests:
    const interval = setInterval(fetchChatRequests, 15000);
    return () => clearInterval(interval);
  }, []);

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

          {/* NEW: Messages / Chat Requests */}
          <Card
            className="hover:shadow-lg transition cursor-pointer"
            onClick={() => router.push("/system_admin/live_chat")}
          >
            <CardHeader>
              <CardTitle>Live Chat Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {chatRequests.length > 0 ? (
                <p>{chatRequests.length} pending request(s)</p>
              ) : (
                <p>No pending chat requests</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
