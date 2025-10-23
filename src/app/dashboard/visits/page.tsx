"use client";

import { useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import { visitColumns } from "./visitColumns";
import { NOTE_DOC_URL } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateVisitModal from "./CreateVisitModal";
import VisitDetailModal from "./[visit_id]/VisitDetailModal";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { exportTableData } from "@/lib/exportData";
import ExportButton from "@/components/ExportButton";

// Default display columns
const defaultDisplayColumns = [
  "clientName",
  "employeeName",
  "date",
  "scheduledTimeIn",
  "scheduledTimeOut",
  "scheduledHours",
  "clockIn",
  "clockOut",
  "service",
  "hours",
  "units",
  "visitStatus",
  "doNotBill",
  "edit",
];

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const exceptionOnlyParam = searchParams.get("exceptionOnly") === "true";

  const [filters, setFilters] = useState({
    employee: "",
    client: "",
    service: "",
    status: "",
    payer: "",
    medicaidId: "",
    exceptionOnly: exceptionOnlyParam,
    dateFrom: "",
    dateTo: "",
  });

  const [perPage, setPerPage] = useState("25");
  const [displayColumns, setDisplayColumns] = useState(defaultDisplayColumns);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Fetch visits from backend for user's agency
  useEffect(() => {
    async function fetchVisits() {
      try {
        const user = getLoggedInUser();
        if (!user?.agency?.id) {
          setError("No agency found for this user.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/visits/agency/${user.agency.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch visits");
        const data = await res.json();

        // ✅ Format each visit for table display
        const msToHHMM = (ms: number) => {
          const totalMinutes = Math.round(ms / (1000 * 60));
          if (!isFinite(totalMinutes) || totalMinutes <= 0) return "-";
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
        };

        const formatted = data.map((v: any) => ({
          id: v.id,
          date: v.callIn
            ? new Date(v.callIn).toLocaleDateString()
            : v.scheduledTimeIn
            ? new Date(v.scheduledTimeIn).toLocaleDateString()
            : "-",
          scheduledTimeIn: v.scheduledTimeIn
            ? new Date(v.scheduledTimeIn).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          scheduledTimeOut: v.scheduledTimeOut
            ? new Date(v.scheduledTimeOut).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          // Prefer v.scheduledHours; if missing compute elapsed time between scheduledTimeIn/out and return HH:MM
          scheduledHours:
            v.scheduledHours !== null &&
            v.scheduledHours !== undefined &&
            v.scheduledHours !== ""
              ? v.scheduledHours
              : v.scheduledTimeIn && v.scheduledTimeOut
              ? (() => {
                  const inTs = new Date(v.scheduledTimeIn).getTime();
                  const outTs = new Date(v.scheduledTimeOut).getTime();
                  const diffMs = outTs - inTs;
                  return msToHHMM(diffMs);
                })()
              : "-",
          clockIn: v.callIn
            ? new Date(v.callIn).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          clockOut: v.callOut
            ? new Date(v.callOut).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          clientName: v.clientName || "-",
          employeeName: v.employeeName || "-",
          service: v.service || "-",
          hours: v.callHours || "-",
          units: v.units || "-",
          visitStatus: v.visitStatus || "-",
          medicaidId: v.clientMedicaidID || "-",
          employeeId: v.employeeID || "-",
          clientId: v.clientID || "-",
          payer: v.payer || "-",
          adjustedClockIn: v.adjustedIn
            ? new Date(v.adjustedIn).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          adjustedClockOut: v.adjustedOut
            ? new Date(v.adjustedOut).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          adjustedHours:
            v.adjustedHours !== null &&
            v.adjustedHours !== undefined &&
            v.adjustedHours !== ""
              ? v.adjustedHours
              : v.adjustedIn && v.adjustedOut
              ? (() => {
                  const inTs = new Date(v.adjustedIn).getTime();
                  const outTs = new Date(v.adjustedOut).getTime();
                  const diffMs = outTs - inTs;
                  return msToHHMM(diffMs);
                })()
              : "-",
          paidHours: v.payHours || "-",
          approved: v.approved ? "Yes" : "No",
          billHours: v.billHours || "-",
          claimsVerificationStatus: v.claimsVerificationStatus || "-",
          clientPhone: v.clientPrimaryPhoneNumber || "-",
          clientVerified: v.clientVerified ? "Yes" : "No",
          doNotBill: v.doNotBill ? "Yes" : "No",
          employeePhone: v.employeeContactPhoneNumber || "-",
          groupVisitCode: v.groupVisitCode || "-",
          callLocation: v.inOutCallLocation || "-",
          note: NOTE_DOC_URL,
          program: v.program || "-",
          tasks: v.visitTasks.length || 0,
          exception:
            v.totalCurrentExceptions > 0
              ? "Exception Occurred"
              : "No Exception",
        }));

        setVisits(formatted);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading visits");
      } finally {
        setLoading(false);
      }
    }

    fetchVisits();
  }, []);

  // ✅ Filter logic (same as before)
  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const matches =
        (!filters.employee ||
          visit.employeeName
            .toLowerCase()
            .includes(filters.employee.toLowerCase())) &&
        (!filters.client ||
          visit.clientName
            .toLowerCase()
            .includes(filters.client.toLowerCase())) &&
        (!filters.service ||
          visit.service
            .toLowerCase()
            .includes(filters.service.toLowerCase())) &&
        (!filters.status ||
          visit.visitStatus
            .toLowerCase()
            .includes(filters.status.toLowerCase())) &&
        (!filters.payer ||
          visit.payer.toLowerCase().includes(filters.payer.toLowerCase())) &&
        (!filters.medicaidId ||
          visit.medicaidId.includes(filters.medicaidId)) &&
        (!filters.exceptionOnly || visit.exception === "Exception Occurred");

      // date range filter
      const visitDate = new Date(visit.date);
      const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const to = filters.dateTo ? new Date(filters.dateTo) : null;
      if (from && visitDate < from) return false;
      if (to && visitDate > to) return false;

      return matches;
    });
  }, [visits, filters]);

  const paginatedVisits = filteredVisits.slice(
    (currentPage - 1) * parseInt(perPage),
    currentPage * parseInt(perPage)
  );

  const totalPages = Math.ceil(filteredVisits.length / parseInt(perPage));

  // const handleDisplayToggle = (colKey: string) => {
  //   setDisplayColumns((prev) =>
  //     prev.includes(colKey)
  //       ? prev.filter((k) => k !== colKey)
  //       : [...prev, colKey]
  //   );
  // };
  const handleDisplayToggle = (colKey: string) => {
    setDisplayColumns((prev) => {
      if (prev.includes(colKey)) {
        // Remove column
        return prev.filter((k) => k !== colKey);
      } else {
        // Add back in correct order (based on visitColumns master order)
        const updated = [...prev, colKey];
        return visitColumns
          .map((c) => c.key)
          .filter((key) => updated.includes(key)); // Keep correct global order
      }
    });
  };

  const handleSearch = () => setCurrentPage(1);

  if (loading)
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading visits…
      </div>
    );
  if (error)
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN"]} permission="View Visits">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Visits</h1>
          <CreateVisitModal />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <Label className="mb-1 block">Date From</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((f) => ({ ...f, dateFrom: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className="mb-1 block">Date To</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters((f) => ({ ...f, dateTo: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className="mb-1 block">Employee</Label>
            <Input
              value={filters.employee}
              onChange={(e) =>
                setFilters((f) => ({ ...f, employee: e.target.value }))
              }
              placeholder="Search employee ID or name"
            />
          </div>
          <div>
            <Label className="mb-1 block">Client</Label>
            <Input
              value={filters.client}
              onChange={(e) =>
                setFilters((f) => ({ ...f, client: e.target.value }))
              }
              placeholder="Search client ID or name"
            />
          </div>
          <div>
            <Label className="mb-1 block">Service</Label>
            <Input
              value={filters.service}
              onChange={(e) =>
                setFilters((f) => ({ ...f, service: e.target.value }))
              }
              placeholder="Service name"
            />
          </div>
          <div>
            <Label className="mb-1 block">Status</Label>
            <Select
              onValueChange={(val) =>
                setFilters((f) => ({ ...f, status: val }))
              }
              value={filters.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Incomplete">Incomplete</SelectItem>
                <SelectItem value="InProcess">In Process</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Processed">Processed</SelectItem>
                <SelectItem value="Omitted">Omitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Payer</Label>
            <Input
              value={filters.payer}
              onChange={(e) =>
                setFilters((f) => ({ ...f, payer: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className="mb-1 block">Medicaid ID</Label>
            <Input
              value={filters.medicaidId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, medicaidId: e.target.value }))
              }
            />
          </div>
          <div className="col-span-2 flex items-end gap-2">
            <Checkbox
              checked={filters.exceptionOnly}
              onCheckedChange={(val) =>
                setFilters((f) => ({ ...f, exceptionOnly: val as boolean }))
              }
            />
            <Label>Show only visits with exceptions</Label>
          </div>
          <div className="col-span-2">
            <Button onClick={handleSearch} className="w-full">
              Search Visits
            </Button>
          </div>
        </div>

        <ExportButton
          filteredVisits={filteredVisits}
          displayColumns={displayColumns}
        />

        {/* Display Filters */}
        <details className="mb-4">
          <summary className="cursor-pointer font-semibold">
            Display Filters
          </summary>
          <ScrollArea className="border rounded p-4 max-h-56 mt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {visitColumns.map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={displayColumns.includes(key)}
                    onCheckedChange={() => handleDisplayToggle(key)}
                  />
                  <Label>{label}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </details>

        {/* Table */}
        <div className="overflow-x-auto border rounded">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Loading visits...
            </div>
          ) : paginatedVisits.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No visits found</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {displayColumns.map((colKey) => {
                    const column = visitColumns.find(
                      (col) => col.key === colKey
                    );
                    return (
                      <th
                        key={colKey}
                        className="px-4 py-2 font-medium whitespace-nowrap"
                      >
                        {column?.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paginatedVisits.map((visit, idx) => (
                  <tr key={visit.id ?? idx} className="border-t">
                    {displayColumns.map((colKey) => {
                      if (colKey === "note") {
                        return (
                          <td key={colKey} className="px-4 py-2">
                            <a
                              href={NOTE_DOC_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              View Note
                            </a>
                          </td>
                        );
                      }

                      if (colKey === "doNotBill") {
                        return (
                          <td key={colKey} className="px-4 py-2">
                            <Checkbox
                              checked={visit.doNotBill === "Yes"}
                              disabled
                            />
                          </td>
                        );
                      }

                      if (colKey === "edit") {
                        return (
                          <td key={colKey} className="px-4 py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/dashboard/visits/${visit.id}`)
                              }
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </td>
                        );
                      }

                      return (
                        <td key={colKey} className="px-4 py-2">
                          {visit[colKey] ?? "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Label>Visits per page:</Label>
            <Select
              onValueChange={(val) => {
                setPerPage(val);
                setCurrentPage(1);
              }}
              value={perPage}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              onClick={() =>
                setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
              disabled={currentPage >= totalPages}
            >
              Next →
            </Button>
          </div>
        </div>
        {/* Visit Detail Modal */}
        {selectedVisit && (
          <VisitDetailModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            visit={selectedVisit}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
