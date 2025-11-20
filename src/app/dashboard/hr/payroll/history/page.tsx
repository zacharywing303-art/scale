"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type HistoryRow = {
  id: string;
  periodFrom: string;
  periodTo: string;
  runAt: string;
  runBy: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  totalAmount: number | null;
};

export default function PayrollHistoryPage() {
  const user = getLoggedInUser();
  const router = useRouter();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        if (!user?.agency?.id) return;
        const url = new URL(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/history`
        );
        url.searchParams.set("agencyId", user.agency.id);
        const res = await fetch(url.toString());
        const data = await res.json();
        setRows(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Payroll History
          </h2>
          {loading && <p>Loading history...</p>}
          {!loading && rows.length === 0 && (
            <p className="text-sm text-gray-500">
              No payroll runs recorded yet.
            </p>
          )}
          {!loading && rows.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="text-left px-3 py-2 border-b">Period</th>
                    <th className="text-left px-3 py-2 border-b">Run At</th>
                    <th className="text-left px-3 py-2 border-b">Run By</th>
                    <th className="text-left px-3 py-2 border-b">Status</th>
                    <th className="text-right px-3 py-2 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/hr/payroll/history/${row.id}`)
                      }
                    >
                      <td className="px-3 py-2 border-b">
                        {format(new Date(row.periodFrom), "MM/dd/yyyy")} -{" "}
                        {format(new Date(row.periodTo), "MM/dd/yyyy")}
                      </td>
                      <td className="px-3 py-2 border-b">
                        {format(new Date(row.runAt), "MM/dd/yyyy p")}
                      </td>
                      <td className="px-3 py-2 border-b">{row.runBy}</td>
                      <td className="px-3 py-2 border-b">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            row.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : row.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-b text-right">
                        ${(row.totalAmount ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
