"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PayrollFilters from "@/components/payroll/PayrollFilters";
import PayrollTable from "@/components/payroll/PayrollTable";
import PayrollSummary from "@/components/payroll/PayrollSummary";
import { useSearchParams } from "next/navigation";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { format } from "date-fns";

type PayrollEmployee = {
  id: string;
  name: string;
  visitHours: number;
  visitRate: number;
  facilityHours: number;
  facilityRate: number;
  officeHours: number;
  officeRate: number;
  mileage: number;
  mileageRate: number;
  overtimeHours: number;
};

export default function PayrollPage() {
  const searchParams = useSearchParams();
  const user = getLoggedInUser();

  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFrom, setPeriodFrom] = useState<string>("");
  const [periodTo, setPeriodTo] = useState<string>("");
  const [hasRun, setHasRun] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // Filters
  const [payFrequency, setPayFrequency] = useState("Weekly");
  const [mileageRate, setMileageRate] = useState(0.65);
  const [mileageCap, setMileageCap] = useState(500);
  const [includeMileage, setIncludeMileage] = useState(true);
  const [includeVisits, setIncludeVisits] = useState(true);
  const [includeFacility, setIncludeFacility] = useState(true);
  const [includeOffice, setIncludeOffice] = useState(true);

  // Initialize period from query or default to last week
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const tId = searchParams.get("taskId");

    const today = new Date();
    if (from) {
      setPeriodFrom(from);
    } else {
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - 7);
      setPeriodFrom(lastWeekStart.toISOString().split("T")[0]);
    }

    if (to) {
      setPeriodTo(to);
    } else {
      setPeriodTo(today.toISOString().split("T")[0]);
    }

    if (tId) setTaskId(tId);
  }, [searchParams]);

  async function fetchPreview() {
    if (!user?.agency?.id || !periodFrom || !periodTo) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        agencyId: user.agency.id,
        periodFrom,
        periodTo,
      });
      if (taskId) params.append("taskId", taskId);

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/payroll/preview?${params.toString()}`
      );
      if (!res.ok) throw new Error("Failed to load payroll preview");
      const data = await res.json();

      setEmployees(data.employees || []);
      setHasRun(!!data.alreadyRan);

      // Optional: if autoCompleted was returned, you could show a toast
      // e.g. if (data?.autoCompleted?.updatedTask) toast.success("Payroll task already completed for this period");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodFrom, periodTo, taskId]);

  const calculateTotalPay = (emp: PayrollEmployee) => {
    let total = 0;
    if (includeVisits) total += emp.visitHours * emp.visitRate;
    if (includeFacility) total += emp.facilityHours * emp.facilityRate;
    if (includeOffice) total += emp.officeHours * emp.officeRate;
    if (includeMileage) {
      const cappedMiles = Math.min(emp.mileage, mileageCap);
      const rate = mileageRate || emp.mileageRate || 0;
      total += cappedMiles * rate;
    }
    total += emp.overtimeHours * emp.visitRate * 1.5;
    return total.toFixed(2);
  };

  const totalPayroll = useMemo(
    () =>
      employees
        .reduce((sum, emp) => sum + Number(calculateTotalPay(emp)), 0)
        .toFixed(2),
    [employees, calculateTotalPay]
  );

  const handleRunPayroll = async () => {
    if (!user?.agency?.id) return;
    const confirmed = window.confirm(
      `Run payroll for period ${periodFrom} → ${periodTo}?`
    );
    if (!confirmed) return;
    setRunning(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/run`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agencyId: user.agency.id,
            periodFrom,
            periodTo,
            runByUserId: user.id,
            taskId,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to run payroll");
      const data = await res.json();

      setHasRun(true);
      // If backend recomputed preview, you could also use data.preview.employees
      // For now we just refetch:
      await fetchPreview();
      alert("Payroll run completed. Export ready.");
    } catch (err) {
      console.error(err);
      alert("Failed to run payroll.");
    } finally {
      setRunning(false);
    }
  };

  const handleExportCsv = () => {
    // Simple client CSV export for now
    const rows = [
      [
        "Employee",
        "Visit Hours",
        "Visit Rate",
        "Facility Hours",
        "Facility Rate",
        "Office Hours",
        "Office Rate",
        "Mileage",
        "Overtime Hours",
        "Total Pay",
      ],
      ...employees.map((emp) => [
        emp.name,
        emp.visitHours,
        emp.visitRate,
        emp.facilityHours,
        emp.facilityRate,
        emp.officeHours,
        emp.officeRate,
        emp.mileage,
        emp.overtimeHours,
        calculateTotalPay(emp),
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${periodFrom}_${periodTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Payroll Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {taskId
                  ? "This payroll is linked to a Unity Task: Run Payroll."
                  : "Review employee hours, mileage, and rates for the selected period."}
              </p>
            </div>
            <div className="flex gap-2 items-center text-xs sm:text-sm">
              <div>
                <span className="font-medium">Period From:</span>{" "}
                <input
                  type="date"
                  value={periodFrom}
                  onChange={(e) => setPeriodFrom(e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                />
              </div>
              <div>
                <span className="font-medium">To:</span>{" "}
                <input
                  type="date"
                  value={periodTo}
                  onChange={(e) => setPeriodTo(e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                />
              </div>
              <button
                onClick={fetchPreview}
                className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Loading payroll preview...
            </p>
          ) : (
            <>
              <PayrollFilters
                payFrequency={payFrequency}
                setPayFrequency={setPayFrequency}
                mileageRate={mileageRate}
                setMileageRate={setMileageRate}
                mileageCap={mileageCap}
                setMileageCap={setMileageCap}
                includeVisits={includeVisits}
                setIncludeVisits={setIncludeVisits}
                includeFacility={includeFacility}
                setIncludeFacility={setIncludeFacility}
                includeOffice={includeOffice}
                setIncludeOffice={setIncludeOffice}
                includeMileage={includeMileage}
                setIncludeMileage={setIncludeMileage}
              />

              <PayrollTable
                employees={employees as any}
                calculateTotalPay={calculateTotalPay as any}
              />

              <PayrollSummary
                totalPayroll={totalPayroll}
                hasRun={hasRun}
                onRunPayroll={handleRunPayroll}
                running={running}
                onExport={handleExportCsv}
              />
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
// "use client";
// import React, { useState, useEffect } from "react";
// import ProtectedRoute from "@/components/auth/ProtectedRoute";
// import PayrollFilters from "@/components/payroll/PayrollFilters";
// import PayrollTable from "@/components/payroll/PayrollTable";
// import PayrollSummary from "@/components/payroll/PayrollSummary";

// export default function PayrollPage() {
//   const [payFrequency, setPayFrequency] = useState("Weekly");
//   const [mileageRate, setMileageRate] = useState(0.65);
//   const [mileageCap, setMileageCap] = useState(500);
//   const [includeMileage, setIncludeMileage] = useState(true);
//   const [includeVisits, setIncludeVisits] = useState(true);
//   const [includeFacility, setIncludeFacility] = useState(true);
//   const [includeOffice, setIncludeOffice] = useState(true);

//   const employees = [
//     {
//       id: 1,
//       name: "Sarah Johnson",
//       visitHours: 35,
//       visitRate: 25,
//       facilityHours: 10,
//       facilityRate: 20,
//       officeHours: 5,
//       officeRate: 18,
//       mileage: 120,
//       overtimeHours: 3,
//     },
//     {
//       id: 2,
//       name: "Michael Davis",
//       visitHours: 40,
//       visitRate: 26,
//       facilityHours: 0,
//       facilityRate: 0,
//       officeHours: 8,
//       officeRate: 18,
//       mileage: 60,
//       overtimeHours: 0,
//     },
//   ];

//   const calculateTotalPay = (emp: any) => {
//     let total = 0;
//     if (includeVisits) total += emp.visitHours * emp.visitRate;
//     if (includeFacility) total += emp.facilityHours * emp.facilityRate;
//     if (includeOffice) total += emp.officeHours * emp.officeRate;
//     if (includeMileage)
//       total += Math.min(emp.mileage, mileageCap) * mileageRate;
//     total += emp.overtimeHours * emp.visitRate * 1.5;
//     return total.toFixed(2);
//   };

//   const totalPayroll = employees
//     .reduce((sum, emp) => sum + Number(calculateTotalPay(emp)), 0)
//     .toFixed(2);

//   return (
//     <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
//       <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
//         <main className="flex-1 p-6 space-y-6">
//           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
//             Payroll Overview
//           </h2>
//           <p className="text-gray-600 dark:text-gray-300">
//             Review employee hours, mileage, and rates. Adjust options and
//             frequency before running payroll.
//           </p>

//           <PayrollFilters
//             payFrequency={payFrequency}
//             setPayFrequency={setPayFrequency}
//             mileageRate={mileageRate}
//             setMileageRate={setMileageRate}
//             mileageCap={mileageCap}
//             setMileageCap={setMileageCap}
//             includeVisits={includeVisits}
//             setIncludeVisits={setIncludeVisits}
//             includeFacility={includeFacility}
//             setIncludeFacility={setIncludeFacility}
//             includeOffice={includeOffice}
//             setIncludeOffice={setIncludeOffice}
//             includeMileage={includeMileage}
//             setIncludeMileage={setIncludeMileage}
//           />

//           <PayrollTable
//             employees={employees}
//             calculateTotalPay={calculateTotalPay}
//           />

//           <PayrollSummary totalPayroll={totalPayroll} />
//         </main>
//       </div>
//     </ProtectedRoute>
//   );
// }
