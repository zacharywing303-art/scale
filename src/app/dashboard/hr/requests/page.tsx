"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TimeOffRequests from "@/components/employee-requests/TimeOffRequests";
import ShiftRequests from "@/components/employee-requests/ShiftRequests";
import ClientAcceptanceRequests from "@/components/employee-requests/ClientAcceptanceRequests";
import ClockAdjustRequests from "@/components/employee-requests/ClockAdjustRequests";

export default function RequestsPage() {
  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
      <div className="min-h-screen flex bg-gray-50">
        <main className="flex-1 p-6 space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Requests
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Review and manage pending staff and client requests.
          </p>

          <div className="space-y-8">
            <TimeOffRequests />
            <ShiftRequests />
            <ClientAcceptanceRequests />
            <ClockAdjustRequests />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
