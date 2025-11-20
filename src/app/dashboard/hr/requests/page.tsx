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

type RequestType =
  | "TimeOff"
  | "AvailabilityChange"
  | "StatusChange"
  | "Sick"
  | "ClockAdjust"
  | "ClientAcceptance";

type RequestStatus = "Pending" | "Approved" | "Declined";

type EmployeeRequest = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  reason?: string | null;

  // Time off–style fields
  startDate?: string | null;
  endDate?: string | null;
  timeOffType?: "PTO" | "Sick" | "Vacation" | "Personal" | "Unpaid" | null;

  // Availability change
  availabilityChanges?: any | null;

  // Status change
  newStatus?: string | null;

  createdAt: string;
  employee: {
    id: string;
    name: string;
    status: string;
  };
};

type TypeFilter = "all" | RequestType;
type StatusFilter = "all" | RequestStatus;

export default function RequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = await getLoggedInUser();
        if (!user?.agency?.id) {
          toast.error("Missing agency. Please re-login.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/requests/pending/${user.agency.id}`
        );
        if (!res.ok) throw new Error("Failed to load requests");
        const data = await res.json();

        setRequests(data.requests || []);
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

  // UI label mapping for types
  const typeLabel = (type: RequestType): string => {
    switch (type) {
      case "TimeOff":
        return "Time Off Request";
      case "AvailabilityChange":
        return "Availability Change Request";
      case "StatusChange":
        return "Status Change Request";
      case "Sick":
        return "Sick Day Request";
      case "ClockAdjust":
        return "Clock Adjustment Request";
      case "ClientAcceptance":
        return "Client Acceptance Request";
      default:
        return type;
    }
  };

  const renderTypeBadge = (type: RequestType) => {
    const label = typeLabel(type);

    switch (type) {
      case "TimeOff":
      case "Sick":
        return <Badge variant="secondary">{label}</Badge>;
      case "AvailabilityChange":
        return <Badge>{label}</Badge>;
      case "StatusChange":
        return <Badge variant="outline">{label}</Badge>;
      case "ClockAdjust":
        return <Badge className="bg-sky-600 hover:bg-sky-700">{label}</Badge>;
      case "ClientAcceptance":
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700">{label}</Badge>
        );
    }
  };

  const renderStatusBadge = (status: RequestStatus) => {
    if (status === "Pending")
      return <Badge className="bg-amber-500">Pending</Badge>;
    if (status === "Approved")
      return <Badge className="bg-emerald-600">Approved</Badge>;
    return <Badge className="bg-rose-600">Declined</Badge>;
  };

  const renderTimeOffSummary = (
    req: EmployeeRequest,
    labelOverride?: string
  ) => {
    const label =
      labelOverride ??
      (req.timeOffType ? `${req.timeOffType} Time` : "Time Off");

    return (
      <div className="text-sm text-muted-foreground">
        {req.startDate && req.endDate && (
          <div>
            {format(new Date(req.startDate), "MM/dd/yyyy")} →{" "}
            {format(new Date(req.endDate), "MM/dd/yyyy")} ({label})
          </div>
        )}
        {req.reason && <div>Reason: {req.reason}</div>}
      </div>
    );
  };

  const renderDetails = (req: EmployeeRequest) => {
    // Time off request (generic)
    if (req.type === "TimeOff") {
      return renderTimeOffSummary(req);
    }

    // Explicit Sick request (separate from TimeOffType.Sick)
    if (req.type === "Sick") {
      return renderTimeOffSummary(req, "Sick Day");
    }

    if (req.type === "AvailabilityChange") {
      const changes = (req.availabilityChanges as any[]) || [];
      return (
        <div className="text-sm text-muted-foreground">
          <div>Requested availability:</div>
          <ul className="ml-4 list-disc">
            {changes.map((c, idx) => (
              <li key={idx}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][c.weekday]}{" "}
                {c.start}–{c.end}
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
          <div>
            New status:{" "}
            <span className="font-medium">{req.newStatus ?? "—"}</span>
          </div>
          {req.reason && <div>Reason: {req.reason}</div>}
        </div>
      );
    }

    if (req.type === "ClockAdjust") {
      return (
        <div className="text-sm text-muted-foreground">
          <div>Requested clock adjustment.</div>
          {req.startDate && (
            <div>For date: {format(new Date(req.startDate), "MM/dd/yyyy")}</div>
          )}
          {req.reason && <div>Reason: {req.reason}</div>}
        </div>
      );
    }

    if (req.type === "ClientAcceptance") {
      return (
        <div className="text-sm text-muted-foreground">
          <div>Client acceptance review requested.</div>
          {req.reason && <div>Details: {req.reason}</div>}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Employee Requests</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage employee time-off, availability, status, and other
            HR-related requests.
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {/* Type filter */}
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as TypeFilter)}
          >
            <SelectTrigger className="w-[210px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="TimeOff">Time Off</SelectItem>
              <SelectItem value="Sick">Sick Day</SelectItem>
              <SelectItem value="AvailabilityChange">
                Availability Change
              </SelectItem>
              <SelectItem value="StatusChange">Status Change</SelectItem>
              <SelectItem value="ClockAdjust">Clock Adjustment</SelectItem>
              <SelectItem value="ClientAcceptance">
                Client Acceptance
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
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

      {/* Requests List */}
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
// "use client";

// import React from "react";
// import ProtectedRoute from "@/components/auth/ProtectedRoute";
// import TimeOffRequests from "@/components/employee-requests/TimeOffRequests";
// import ShiftRequests from "@/components/employee-requests/ShiftRequests";
// import ClientAcceptanceRequests from "@/components/employee-requests/ClientAcceptanceRequests";
// import ClockAdjustRequests from "@/components/employee-requests/ClockAdjustRequests";

// export default function RequestsPage() {
//   return (
//     <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
//       <div className="min-h-screen flex bg-gray-50">
//         <main className="flex-1 p-6 space-y-8">
//           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
//             Requests
//           </h2>
//           <p className="mt-2 text-gray-600 dark:text-gray-300">
//             Review and manage pending staff and client requests.
//           </p>

//           <div className="space-y-8">
//             <TimeOffRequests />
//             <ShiftRequests />
//             <ClientAcceptanceRequests />
//             <ClockAdjustRequests />
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );
// }
