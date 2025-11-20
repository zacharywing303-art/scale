"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PayrollFilters from "@/components/payroll/PayrollFilters";
import PayrollTable, { PayrollRow } from "@/components/payroll/PayrollTable";
import PayrollSummary from "@/components/payroll/PayrollSummary";
import RateChangeModal, {
  RatePending,
} from "@/components/payroll/RateChangeModal";
import TimecardModal from "@/components/payroll/TimeCardModal";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";

export default function PayrollPage() {
  const user = getLoggedInUser();
  const searchParams = useSearchParams();

  const taskId = searchParams.get("taskId") || undefined;
  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || "";

  const [taskInfo, setTaskInfo] = useState<any | null>(null);

  const [payFrequency, setPayFrequency] = useState("Weekly");
  const [includeMileage, setIncludeMileage] = useState(true);
  const [includeVisits, setIncludeVisits] = useState(true);
  const [includeFacility, setIncludeFacility] = useState(true);
  const [includeOffice, setIncludeOffice] = useState(true);

  const [periodFrom, setPeriodFrom] = useState<string>(fromParam);
  const [periodTo, setPeriodTo] = useState<string>(toParam);

  const [employees, setEmployees] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Rate updates to persist in EmploymentInfo (employeeId => fields)
  const [rateUpdates, setRateUpdates] = useState<{
    [employeeCode: string]: {
      visitRate?: number;
      facilityRate?: number;
      officeRate?: number;
      mileageRate?: number;
    };
  }>({});

  const [ratePending, setRatePending] = useState<RatePending | null>(null);

  // For timecard UI
  const [timecardEmp, setTimecardEmp] = useState<PayrollRow | null>(null);

  // 🔹 If we *don’t* have from/to in the URL, use the suggested period
  useEffect(() => {
    async function fetchSuggestedPeriod() {
      try {
        if (!user?.agency?.id) return;
        // If URL already specified a range (from Unity Task), don't override it
        if (fromParam && toParam) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/period/suggested?agencyId=${user.agency.id}`
        );
        if (!res.ok) throw new Error("Failed to load suggested period");
        const data = await res.json();
        setPeriodFrom(data.periodFrom.split("T")[0]);
        setPeriodTo(data.periodTo.split("T")[0]);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSuggestedPeriod();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.agency?.id, fromParam, toParam]);

  // 🔹 Load Unity Task info if we came from a task
  useEffect(() => {
    if (!taskId) return;

    async function fetchTask() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`
        );
        if (!res.ok) {
          if (res.status === 404) {
            setTaskInfo(null);
            return;
          }
          let msg = "Failed to fetch task info";
          try {
            const body = await res.json();
            if (body?.message) msg = body.message;
          } catch {
            // ignore
          }
          throw new Error(msg);
        }
        const data = await res.json();
        setTaskInfo(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Error loading task info");
      }
    }

    fetchTask();
  }, [taskId]);

  async function loadPreview() {
    try {
      if (!user?.agency?.id) {
        toast.error("Missing agency context");
        return;
      }
      if (!periodFrom || !periodTo) {
        toast.error("Please select a date range");
        return;
      }
      setLoading(true);
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/preview`
      );
      url.searchParams.set("agencyId", user.agency.id);
      url.searchParams.set("periodFrom", periodFrom);
      url.searchParams.set("periodTo", periodTo);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load payroll preview");

      const data = await res.json();
      setEmployees(data || []);
      setRateUpdates({});
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error loading payroll preview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (periodFrom && periodTo) {
      loadPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodFrom, periodTo]);

  // Handle editable fields
  const handleChangeField = (
    employeeId: string,
    field: keyof PayrollRow,
    value: number
  ) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.employeeId === employeeId ? { ...e, [field]: value } : e
      )
    );
  };

  // Handle rate changes -> show modal
  const handleRateChange = (
    employeeId: string,
    employeeCode: string,
    field: keyof PayrollRow,
    value: number
  ) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.employeeId === employeeId ? { ...e, [field]: value } : e
      )
    );

    if (
      field === "visitRate" ||
      field === "facilityRate" ||
      field === "officeRate" ||
      field === "mileageRate"
    ) {
      setRatePending({
        employeeId,
        employeeCode,
        field,
        newValue: value,
      });
    }
  };

  const confirmRateUpdate = (makePermanent: boolean) => {
    if (!ratePending) return;

    if (makePermanent) {
      setRateUpdates((prev) => ({
        ...prev,
        [ratePending.employeeCode]: {
          ...(prev[ratePending.employeeCode] || {}),
          [ratePending.field]: ratePending.newValue,
        },
      }));
    }

    setRatePending(null);
  };

  const totalPayroll = useMemo(() => {
    return employees
      .reduce((sum, emp) => {
        let total = 0;
        if (includeVisits)
          total += (emp.visitHours || 0) * (emp.visitRate || 0);
        if (includeFacility)
          total += (emp.facilityHours || 0) * (emp.facilityRate || 0);
        if (includeOffice)
          total += (emp.officeHours || 0) * (emp.officeRate || 0);
        if (includeMileage)
          total += (emp.mileage || 0) * (emp.mileageRate || 0);
        total += (emp.overtimeHours || 0) * (emp.visitRate || 0) * 1.5;
        return sum + total;
      }, 0)
      .toFixed(2);
  }, [
    employees,
    includeVisits,
    includeFacility,
    includeOffice,
    includeMileage,
  ]);

  async function handleRunPayroll() {
    try {
      if (!user?.agency?.id || !user.id) {
        toast.error("Missing user/agency context");
        return;
      }
      if (!periodFrom || !periodTo) {
        toast.error("Please select a date range");
        return;
      }

      const body = {
        agencyId: user.agency.id,
        periodFrom,
        periodTo,
        runByUserId: user.id,
        employees,
        updateRates: rateUpdates,
        taskId, // 🔗 this is what the backend uses to auto-complete the Run Payroll task
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payroll/run`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Failed to run payroll");
      const data = await res.json();
      toast.success("Payroll run created and logged");

      // Optionally: if you want to also reflect that the task is now completed in the header:
      if (taskInfo) {
        setTaskInfo((prev: any) =>
          prev ? { ...prev, isDone: true, isActive: false } : prev
        );
      }

      // router.push(`/dashboard/hr/payroll/history/${data.history.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to run payroll");
    }
  }

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 space-y-6">
          {/* 🔷 Unity Task Header (no manual Mark Complete) */}
          {taskId && taskInfo && (
            <div className="px-6 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-blue-700">
                    {taskInfo.name || "Run Payroll Task"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Assigned:{" "}
                    {taskInfo.assignedDate
                      ? format(new Date(taskInfo.assignedDate), "PPP")
                      : "N/A"}{" "}
                    | Due:{" "}
                    {taskInfo.dueDate
                      ? format(new Date(taskInfo.dueDate), "PPP")
                      : "N/A"}
                  </p>
                  {periodFrom && periodTo && (
                    <p className="text-xs text-gray-500 mt-1">
                      Running payroll for {format(new Date(periodFrom), "PPP")}{" "}
                      to {format(new Date(periodTo), "PPP")}
                    </p>
                  )}
                  {!taskInfo.isDone && (
                    <p className="text-xs text-gray-500 mt-1">
                      This Unity Task will be completed automatically when
                      payroll is successfully run for this period.
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-3 md:mt-0">
                  {taskInfo.isDone ? (
                    <Button disabled variant="secondary">
                      ✅ Completed
                    </Button>
                  ) : (
                    <Button disabled variant="outline">
                      Pending – auto-completes on payroll run
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Payroll Overview
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Review employee hours, mileage, and rates. Adjust options and
                  frequency before running payroll.
                </p>
              </div>
              <div className="flex gap-2">
                <div>
                  <label className="text-xs text-gray-500">Period From</label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1 text-sm"
                    value={periodFrom}
                    onChange={(e) => setPeriodFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Period To</label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1 text-sm"
                    value={periodTo}
                    onChange={(e) => setPeriodTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <PayrollFilters
              payFrequency={payFrequency}
              setPayFrequency={setPayFrequency}
              mileageRate={0} // not used globally but you can repurpose
              setMileageRate={() => {}}
              mileageCap={0}
              setMileageCap={() => {}}
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
              employees={employees}
              loading={loading}
              includeVisits={includeVisits}
              includeFacility={includeFacility}
              includeOffice={includeOffice}
              includeMileage={includeMileage}
              onChangeField={handleChangeField}
              onRateChange={handleRateChange}
              onOpenTimecard={setTimecardEmp}
            />

            <PayrollSummary
              totalPayroll={totalPayroll}
              onPreview={loadPreview}
              onRunPayroll={handleRunPayroll}
            />
          </div>
        </main>

        {/* Rate change confirmation modal */}
        {ratePending && (
          <RateChangeModal
            pending={ratePending}
            onChoice={confirmRateUpdate}
            onCancel={() => setRatePending(null)}
          />
        )}

        {/* Timecard modal for facility/office hours */}
        {timecardEmp && (
          <TimecardModal
            employee={timecardEmp}
            periodFrom={periodFrom}
            periodTo={periodTo}
            onClose={() => setTimecardEmp(null)}
            onSave={(facilityTotal, officeTotal) => {
              setEmployees((prev) =>
                prev.map((e) =>
                  e.employeeId === timecardEmp.employeeId
                    ? {
                        ...e,
                        facilityHours: facilityTotal,
                        officeHours: officeTotal,
                      }
                    : e
                )
              );
              setTimecardEmp(null);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
