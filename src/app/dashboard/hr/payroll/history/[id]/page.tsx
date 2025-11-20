"use client";

import React, { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useParams } from "next/navigation";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

type HistoryDetail = {
  id: string;
  agencyId: string;
  periodFrom: string;
  periodTo: string;
  runAt: string;
  runBy: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string | null;
  approvedAt?: string | null;
  totalAmount?: number | null;
  employees: any[];
};

export default function PayrollHistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = getLoggedInUser();
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const canApprove = user?.role === "AGENCY_ADMIN";

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/history/${id}`
        );
        const data = await res.json();
        setDetail(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDetail();
  }, [id]);

  const total = useMemo(() => {
    if (!detail) return "0.00";
    return (detail.totalAmount ?? 0).toFixed(2);
  }, [detail]);

  async function handleApproval(action: "approve" | "reject") {
    try {
      const url =
        action === "approve"
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/history/${id}/approve`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/history/${id}/reject`;

      const body: any = {
        approverId: user?.id,
      };
      if (action === "reject") {
        const notes = window.prompt("Add optional rejection note:") || "";
        body.notes = notes;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setDetail((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success(
        action === "approve" ? "Payroll approved" : "Payroll rejected"
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
    }
  }

  function exportFormat(format: string) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/history/${id}/export?format=${format}`;
    window.open(url, "_blank");
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
          <main className="flex-1 p-6">
            <p>Loading payroll...</p>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!detail) {
    return (
      <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
          <main className="flex-1 p-6">
            <p>Payroll history not found.</p>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Payroll Run – {format(new Date(detail.runAt), "MM/dd/yyyy p")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Period: {format(new Date(detail.periodFrom), "MM/dd/yyyy")} –{" "}
                {format(new Date(detail.periodTo), "MM/dd/yyyy")}
              </p>
              <p className="text-gray-500 text-xs">Run by: {detail.runBy}</p>
              <p className="text-gray-500 text-xs">
                Status: <span className="font-semibold">{detail.status}</span>
                {detail.approvedBy && (
                  <>
                    {" "}
                    – {detail.approvedBy} (
                    {detail.approvedAt
                      ? format(new Date(detail.approvedAt), "MM/dd/yyyy p")
                      : ""}
                    )
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                Total: ${total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportFormat("csv")}
                >
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportFormat("adp")}
                >
                  ADP CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportFormat("quickbooks")}
                >
                  QuickBooks CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportFormat("pdf")}
                >
                  PDF
                </Button>
              </div>
              {canApprove && detail.status === "PENDING" && (
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproval("approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApproval("reject")}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Snapshot of employees */}
          <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-3 py-2 text-left">Employee</th>
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-right">Visit Hrs</th>
                  <th className="px-3 py-2 text-right">Visit Rate</th>
                  <th className="px-3 py-2 text-right">Facility Hrs</th>
                  <th className="px-3 py-2 text-right">Office Hrs</th>
                  <th className="px-3 py-2 text-right">Mileage</th>
                  <th className="px-3 py-2 text-right">OT Hrs</th>
                </tr>
              </thead>
              <tbody>
                {detail.employees.map((e: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-1">{e.name}</td>
                    <td className="px-3 py-1">{e.employeeCode ?? "—"}</td>
                    <td className="px-3 py-1 text-right">
                      {e.visitHours ?? 0}
                    </td>
                    <td className="px-3 py-1 text-right">{e.visitRate ?? 0}</td>
                    <td className="px-3 py-1 text-right">
                      {e.facilityHours ?? 0}
                    </td>
                    <td className="px-3 py-1 text-right">
                      {e.officeHours ?? 0}
                    </td>
                    <td className="px-3 py-1 text-right">{e.mileage ?? 0}</td>
                    <td className="px-3 py-1 text-right">
                      {e.overtimeHours ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
