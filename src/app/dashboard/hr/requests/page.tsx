"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  EmployeeRequest,
  RequestType,
  RequestStatus,
  TimeOffType,
} from "@/app/types/requests";
import { Checkbox } from "@/components/ui/checkbox";

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ApplyMode = "all" | "selected";

type EmployeeOption = {
  id: string;
  name: string;
};

export default function RequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | RequestType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>(
    "all"
  );
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // PTO state
  const [agencyPto, setAgencyPto] = useState<number>(14);
  const [applyMode, setApplyMode] = useState<ApplyMode>("all");
  const [employeeList, setEmployeeList] = useState<EmployeeOption[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = await getLoggedInUser();

        if (!user?.agency?.id) {
          toast.error("Missing agency. Please re-login.");
          setLoading(false);
          return;
        }

        // Employees for PTO panel
        const empRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employees/agency/${user.agency.id}`
        );
        const empData = await empRes.json();
        setEmployeeList(empData as EmployeeOption[]);

        // Load agency default PTO
        const agencyRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/agencies/${user.agency.id}`
        );
        const agencyData = await agencyRes.json();
        setAgencyPto(agencyData.ptoDefaultDays ?? 14);

        // Employee requests
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/requests/pending/${user.agency.id}`
        );
        if (!res.ok) throw new Error("Failed to load requests");
        const data = await res.json();
        setRequests((data.requests || []) as EmployeeRequest[]);
      } catch (err: any) {
        console.error("Error fetching requests:", err);
        toast.error(err.message || "Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [requests, typeFilter, statusFilter]);

  const handleAction = async (id: string, action: "approve" | "decline") => {
    try {
      setActionLoadingId(id);
      const user = await getLoggedInUser();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body:
            action === "approve"
              ? JSON.stringify({ adminId: user?.id })
              : undefined,
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Action failed");

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: data.request.status } : req
        )
      );

      toast.success(
        action === "approve" ? "Request approved" : "Request declined"
      );
    } catch (err: any) {
      console.error("handleAction error:", err);
      toast.error(err.message || "Failed to update request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePtoUpdate = async () => {
    try {
      const user = await getLoggedInUser();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees/pto/update-defaults`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agencyId: user?.agency?.id,
            newDefault: agencyPto,
            applyTo: applyMode,
            employeeIds: applyMode === "selected" ? selectedEmployees : [],
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error);

      toast.success("PTO settings updated successfully!");
    } catch (err: any) {
      console.error("handlePtoUpdate error:", err);
      toast.error(err.message || "Failed to update PTO");
    }
  };

  const toggleEmployeeSelection = (
    id: string,
    checked: boolean | "indeterminate"
  ) => {
    const isChecked = checked === true;
    setSelectedEmployees((prev) =>
      isChecked ? [...prev, id] : prev.filter((eid) => eid !== id)
    );
  };

  const renderTypeLabel = (type: RequestType) => {
    switch (type) {
      case "TimeOff":
        return "Time Off";
      case "AvailabilityChange":
        return "Availability Change";
      case "StatusChange":
        return "Status Change";
      case "Sick":
        return "Sick Time";
      case "ClockAdjust":
        return "Clock Adjust";
      case "ClientAcceptance":
        return "Client Acceptance";
      default:
        return type;
    }
  };

  const renderTimeOffTypeLabel = (t?: TimeOffType | null) => {
    if (!t) return "Time Off";
    switch (t) {
      case "PTO":
        return "PTO";
      case "Sick":
        return "Sick";
      case "Vacation":
        return "Vacation";
      case "Personal":
        return "Personal";
      case "Unpaid":
        return "Unpaid";
      default:
        return t;
    }
  };

  const renderTypeBadge = (type: RequestType) => {
    switch (type) {
      case "TimeOff":
        return <Badge variant="secondary">{renderTypeLabel(type)}</Badge>;
      case "AvailabilityChange":
        return <Badge>{renderTypeLabel(type)}</Badge>;
      case "StatusChange":
        return <Badge variant="outline">{renderTypeLabel(type)}</Badge>;
      case "Sick":
        return <Badge className="bg-rose-600 text-white">Sick Time</Badge>;
      case "ClockAdjust":
        return <Badge className="bg-sky-600 text-white">Clock Adjust</Badge>;
      case "ClientAcceptance":
        return (
          <Badge className="bg-purple-600 text-white">Client Acceptance</Badge>
        );
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const renderStatusBadge = (status: RequestStatus) => {
    if (status === "Pending")
      return <Badge className="bg-amber-500">Pending</Badge>;
    if (status === "Approved")
      return <Badge className="bg-emerald-600">Approved</Badge>;
    return <Badge className="bg-rose-600">Declined</Badge>;
  };

  const renderDetails = (req: EmployeeRequest) => {
    if (req.type === "TimeOff" || req.type === "Sick") {
      return (
        <div className="text-sm text-muted-foreground">
          {req.startDate && req.endDate && (
            <div>
              {format(new Date(req.startDate), "MM/dd/yyyy")} →{" "}
              {format(new Date(req.endDate), "MM/dd/yyyy")} (
              {renderTimeOffTypeLabel(req.timeOffType)})
            </div>
          )}
          {req.reason && <div>Reason: {req.reason}</div>}
        </div>
      );
    }

    if (req.type === "AvailabilityChange") {
      const changes = (req.availabilityChanges || []) as {
        weekday: number;
        start: string;
        end: string;
      }[];

      return (
        <div className="text-sm text-muted-foreground">
          <div>Requested availability:</div>
          <ul className="ml-4 list-disc">
            {changes.map((c, idx) => (
              <li key={idx}>
                {weekdayNames[c.weekday]} {c.start}–{c.end}
              </li>
            ))}
          </ul>
          {req.reason && <div>Reason: {req.reason}</div>}
        </div>
      );
    }

    if (req.type === "StatusChange") {
      return (
        <div className="text-sm text-muted-foreground">
          New status: <span className="font-medium">{req.newStatus}</span>
          {req.reason && <div>Reason: {req.reason}</div>}
        </div>
      );
    }

    if (req.type === "ClockAdjust") {
      return (
        <div className="text-sm text-muted-foreground">
          Clock adjustment requested.
          {req.reason && <div>Reason: {req.reason}</div>}
        </div>
      );
    }

    if (req.type === "ClientAcceptance") {
      return (
        <div className="text-sm text-muted-foreground">
          Client acceptance review.
          {req.reason && <div>Notes: {req.reason}</div>}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Employee Requests</h1>

        <div className="flex gap-2 items-center">
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as any)}
          >
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="TimeOff">Time Off</SelectItem>
              <SelectItem value="Sick">Sick</SelectItem>
              <SelectItem value="AvailabilityChange">
                Availability Change
              </SelectItem>
              <SelectItem value="StatusChange">Status Change</SelectItem>
              <SelectItem value="ClockAdjust">Clock Adjust</SelectItem>
              <SelectItem value="ClientAcceptance">
                Client Acceptance
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as any)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PTO Defaults Admin Panel */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">PTO Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Default */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Agency Default PTO Days
            </label>
            <input
              type="number"
              value={agencyPto}
              onChange={(e) => setAgencyPto(Number(e.target.value))}
              className="border rounded p-2"
            />
          </div>

          {/* Apply Mode */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Apply Default To</label>
            <Select
              value={applyMode}
              onValueChange={(v) => setApplyMode(v as ApplyMode)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="selected">Selected Employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* If apply to selected, show checkbox list */}
          {applyMode === "selected" && (
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Select Employees
              </label>
              <div className="border rounded p-2 max-h-40 overflow-y-auto space-y-1">
                {employeeList.length === 0 ? (
                  <span className="text-xs text-muted-foreground">
                    No employees found for this agency.
                  </span>
                ) : (
                  employeeList.map((emp) => (
                    <label
                      key={emp.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={selectedEmployees.includes(emp.id)}
                        onCheckedChange={(checked) =>
                          toggleEmployeeSelection(emp.id, checked)
                        }
                      />
                      <span>{emp.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Button className="mt-4" onClick={handlePtoUpdate}>
          Save PTO Settings
        </Button>
      </Card>

      {/* Requests list */}
      <Card className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading requests...
          </div>
        ) : !filtered.length ? (
          <div className="py-10 text-center text-muted-foreground">
            No requests found with current filters.
          </div>
        ) : (
          <ScrollArea className="max-h-[600px]">
            <div className="divide-y">
              {filtered.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col md:flex-row md:items-center gap-3 px-4 py-3 hover:bg-muted/40"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{req.employee.name}</span>
                      {renderTypeBadge(req.type)}
                      {renderStatusBadge(req.status)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created:{" "}
                      {format(new Date(req.createdAt), "MM/dd/yyyy hh:mm a")}
                    </div>
                    {renderDetails(req)}
                  </div>

                  {req.status === "Pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleAction(req.id, "decline")}
                      >
                        {actionLoadingId === req.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Decline"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleAction(req.id, "approve")}
                      >
                        {actionLoadingId === req.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Approve"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
