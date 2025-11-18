"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Loader2,
  MapPin,
  Download,
  Search,
  Flame,
} from "lucide-react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

// dynamic import to avoid SSR issues
const SimpleMap = dynamic(() => import("@/components/maps/SimpleMap"), {
  ssr: false,
  loading: () => (
    <div className="h-48 flex items-center justify-center text-gray-400">
      <Loader2 className="animate-spin w-6 h-6" />
    </div>
  ),
});

interface VisitLite {
  id: number;
  callIn: string | null;
  callOut: string | null;
  clientName: string | null;
  employeeName: string | null;
  clientID: string | null;
  latitudeIn: number | null;
  longitudeIn: number | null;
  latitudeOut: number | null;
  longitudeOut: number | null;
}

interface ClientHome {
  latitude: number | null;
  longitude: number | null;
  address: string;
}

interface GpsException {
  id: string;
  type: "IN" | "OUT";
  distance: number;
  reason: string | null;
  createdAt: string;
  reviewed: boolean;
  reviewedAt: string | null;
  reviewedBy: string | null;
  visit: VisitLite;
  clientHome: ClientHome | null;
}

interface GpsExceptionResponse {
  items: GpsException[];
  total: number;
  page: number;
  pageSize: number;
}

interface GpsSummary {
  total: number;
  unresolved: number;
  todayTotal: number;
  todayUnresolved: number;
  weekTotal: number;
  weekUnresolved: number;
}

const PAGE_SIZE = 20;

// distance color helper
function getDistanceClasses(miles: number) {
  if (miles <= 0.5) return "bg-yellow-100 text-yellow-800";
  if (miles <= 2) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

// ETA helper (e.g. 25mph default street speed)
function getEtaMinutes(miles: number, mph = 25) {
  if (!miles || miles <= 0) return null;
  const minutes = (miles / mph) * 60;
  return Math.round(minutes);
}

export default function GPSExceptionReviewPage() {
  const user = getLoggedInUser();
  const searchParams = useSearchParams(); // ✅
  const taskId = searchParams.get("taskId");
  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || "";
  const [taskInfo, setTaskInfo] = useState<any | null>(null); // ✅
  const [data, setData] = useState<GpsException[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: fromParam,
    to: toParam,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<GpsSummary | null>(null);
  const [heatmapView, setHeatmapView] = useState(false);

  const hasMore = useMemo(() => page * PAGE_SIZE < total, [page, total]);

  async function loadSummary() {
    if (!user?.agency?.id) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visits/gps-exceptions/${user.agency.id}/summary`
    );
    const json = await res.json();
    setSummary(json);
  }

  async function load(reset = false) {
    if (!user?.agency?.id) return;
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    const query = new URLSearchParams();

    // When showAll === false → only unreviewed
    if (!showAll) {
      query.set("unreviewed", "true");
    }

    // Date range is *always* applied when present
    if (dateRange.from && dateRange.to) {
      query.set("from", dateRange.from);
      query.set("to", dateRange.to);
    }

    if (searchTerm.trim()) {
      query.set("search", searchTerm.trim());
    }
    query.set("page", String(reset ? 1 : page + (reset ? 0 : 1)));
    query.set("pageSize", String(PAGE_SIZE));

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visits/gps-exceptions/${
        user.agency.id
      }?${query.toString()}`
    );
    const json: GpsExceptionResponse = await res.json();

    if (reset) {
      setData(json.items);
      setPage(json.page);
      setTotal(json.total);
      setLoading(false);
    } else {
      setData((prev) => [...prev, ...json.items]);
      setPage(json.page);
      setTotal(json.total);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    load(true);
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAll]);

  function handleApplyFilters() {
    // enforce 7-day span on frontend
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      const diffMs = toDate.getTime() - fromDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        alert("Date range cannot exceed 7 days.");
        return;
      }
    }
    load(true);
    loadSummary();
  }

  // Load Unity Task info if taskId is present
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

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  const handleMarkTaskComplete = async () => {
    if (!taskId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/complete`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Failed to mark task complete");
      toast.success("Task marked as complete!");
      setTaskInfo((prev: any) =>
        prev ? { ...prev, isDone: true, isActive: false } : prev
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error marking task complete");
    }
  };

  async function handleMarkReviewed(ex: GpsException) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visits/gps-exceptions/${ex.id}/review`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: !ex.reviewed }),
      }
    );
    if (!res.ok) {
      alert("Failed to update review status");
      return;
    }
    const updated = await res.json();

    setData((prev) =>
      prev.map((e) =>
        e.id === ex.id
          ? {
              ...e,
              reviewed: updated.reviewed,
              reviewedAt: updated.reviewedAt,
              reviewedBy: updated.reviewedBy,
            }
          : e
      )
    );
    loadSummary();
  }

  function exportCsv() {
    if (!data.length) return;

    const headers = [
      "VisitId",
      "ClientName",
      "EmployeeName",
      "Type",
      "DistanceMiles",
      "CreatedAt",
      "Reviewed",
      "ReviewedAt",
      "ReviewedBy",
      "Reason",
      "ClientHomeAddress",
    ];

    const rows = data.map((ex) => [
      ex.visit.id,
      ex.visit.clientName ?? "",
      ex.visit.employeeName ?? "",
      ex.type,
      ex.distance.toFixed(3),
      new Date(ex.createdAt).toISOString(),
      ex.reviewed ? "Yes" : "No",
      ex.reviewedAt ?? "",
      ex.reviewedBy ?? "",
      (ex.reason ?? "").replace(/[\r\n]+/g, " "),
      ex.clientHome?.address ?? "",
    ]);

    const csv =
      headers.join(",") +
      "\n" +
      rows
        .map((r) =>
          r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gps_exceptions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const allMapPoints = useMemo(
    () =>
      data
        .map((ex) => {
          const points: {
            lat: number;
            lng: number;
            label?: string;
            kind?: "EXCEPTION" | "HOME";
          }[] = [];

          const exLat =
            ex.type === "IN" ? ex.visit.latitudeIn : ex.visit.latitudeOut;
          const exLng =
            ex.type === "IN" ? ex.visit.longitudeIn : ex.visit.longitudeOut;

          if (exLat != null && exLng != null) {
            points.push({
              lat: exLat,
              lng: exLng,
              label: `${ex.type} Exception – ${ex.visit.clientName ?? ""}`,
              kind: "EXCEPTION",
            });
          }

          if (ex.clientHome?.latitude && ex.clientHome.longitude) {
            points.push({
              lat: ex.clientHome.latitude,
              lng: ex.clientHome.longitude,
              label: `Client Home – ${ex.visit.clientName ?? ""}`,
              kind: "HOME",
            });
          }

          return points;
        })
        .flat(),
    [data]
  );

  return (
    <TooltipProvider>
      {taskId && taskInfo && (
        <div className="px-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
            <div>
              <h2 className="text-lg font-semibold text-blue-700">
                {taskInfo.name || "Review GPS Exceptions Task"}
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
              {dateRange.from && dateRange.to && (
                <p className="text-xs text-gray-500 mt-1">
                  Reviewing exceptions from{" "}
                  {format(new Date(dateRange.from), "PPP")} to{" "}
                  {format(new Date(dateRange.to), "PPP")}
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-3 md:mt-0">
              {taskInfo.isDone ? (
                <Button disabled variant="secondary">
                  ✅ Completed
                </Button>
              ) : (
                <Button
                  onClick={handleMarkTaskComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark Task Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold">GPS Exceptions</h2>
            <p className="text-gray-600">
              GPS-based compliance exceptions detected at clock in/out.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setHeatmapView((v) => !v)}>
              <Flame className="w-4 h-4 mr-1" />
              {heatmapView ? "List View" : "Heatmap View"}
            </Button>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Header metrics */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-500">Total GPS Issues</div>
              <div className="text-2xl font-semibold">{summary.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Unresolved</div>
              <div className="text-2xl font-semibold text-red-600">
                {summary.unresolved}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Today</div>
              <div className="text-lg font-semibold">
                {summary.todayTotal}{" "}
                <span className="text-xs text-gray-500">
                  ({summary.todayUnresolved} open)
                </span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">This Week</div>
              <div className="text-lg font-semibold">
                {summary.weekTotal}{" "}
                <span className="text-xs text-gray-500">
                  ({summary.weekUnresolved} open)
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="secondary" onClick={() => setShowAll((v) => !v)}>
            {showAll
              ? "Show Unreviewed Only"
              : "Show All (requires date range)"}
          </Button>

          {showAll && (
            <>
              <Input
                type="date"
                className="w-auto"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((r) => ({ ...r, from: e.target.value }))
                }
              />
              <Input
                type="date"
                className="w-auto"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((r) => ({ ...r, to: e.target.value }))
                }
              />
            </>
          )}

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search client or employee"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>

          <Button onClick={handleApplyFilters}>Apply</Button>
        </div>

        {/* Heatmap view */}
        {heatmapView && (
          <Card className="p-4 h-[500px]">
            {allMapPoints.length ? (
              <SimpleMap points={allMapPoints} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No GPS exception points to display.
              </div>
            )}
          </Card>
        )}

        {/* List */}
        {!heatmapView && (
          <>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
              </div>
            ) : data.length === 0 ? (
              <p className="text-gray-500 italic">
                No GPS exceptions found for the selected filters.
              </p>
            ) : (
              <div className="space-y-4">
                {data.map((ex) => {
                  const isOpen = expanded === ex.id;
                  const time =
                    ex.type === "IN" ? ex.visit.callIn : ex.visit.callOut;
                  const etaMin = getEtaMinutes(ex.distance);
                  const distanceClass = getDistanceClasses(ex.distance);

                  const exceptionLat =
                    ex.type === "IN"
                      ? ex.visit.latitudeIn
                      : ex.visit.latitudeOut;
                  const exceptionLng =
                    ex.type === "IN"
                      ? ex.visit.longitudeIn
                      : ex.visit.longitudeOut;

                  const mapPoints: {
                    lat: number;
                    lng: number;
                    label?: string;
                    kind?: "EXCEPTION" | "HOME";
                  }[] = [];

                  if (exceptionLat != null && exceptionLng != null) {
                    mapPoints.push({
                      lat: exceptionLat,
                      lng: exceptionLng,
                      label:
                        ex.type === "IN"
                          ? "Clock-in exception"
                          : "Clock-out exception",
                      kind: "EXCEPTION",
                    });
                  }
                  if (
                    ex.clientHome?.latitude != null &&
                    ex.clientHome.longitude != null
                  ) {
                    mapPoints.push({
                      lat: ex.clientHome.latitude,
                      lng: ex.clientHome.longitude,
                      label: ex.clientHome.address,
                      kind: "HOME",
                    });
                  }

                  return (
                    <Card key={ex.id} className="p-4 border rounded-lg">
                      {/* Header row */}
                      <div
                        className="flex justify-between items-center cursor-pointer gap-4"
                        onClick={() => toggleExpand(ex.id)}
                      >
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {ex.visit.clientName ?? "Unknown Client"} —{" "}
                            {ex.visit.employeeName ?? "Unknown Employee"}
                          </div>

                          <div className="flex flex-wrap gap-2 items-center text-sm">
                            <span
                              className={clsx(
                                "flex gap-1 items-center font-semibold",
                                ex.type === "IN" && "text-red-600",
                                ex.type === "OUT" && "text-orange-600"
                              )}
                            >
                              <AlertTriangle size={16} />
                              {ex.type === "IN"
                                ? "Clock-In"
                                : "Clock-Out"}:{" "}
                              {time ? new Date(time).toLocaleString() : "N/A"}
                            </span>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className={distanceClass}>
                                  {ex.distance.toFixed(2)} mi
                                  {etaMin && (
                                    <span className="ml-1 text-xs opacity-80">
                                      · ETA
                                    </span>
                                  )}
                                </Badge>
                              </TooltipTrigger>
                              {etaMin && (
                                <TooltipContent>
                                  Approx{" "}
                                  <span className="font-semibold">
                                    {etaMin} min
                                  </span>{" "}
                                  away at 25 mph
                                </TooltipContent>
                              )}
                            </Tooltip>

                            {ex.clientHome && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {ex.clientHome.address}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            className={clsx(
                              "text-xs",
                              ex.reviewed
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            )}
                          >
                            {ex.reviewed ? "Reviewed" : "Not Reviewed"}
                          </Badge>
                          {isOpen ? <ChevronUp /> : <ChevronDown />}
                        </div>
                      </div>

                      {/* Collapsible section */}
                      <div
                        className={clsx(
                          "transition-all overflow-hidden",
                          isOpen ? "max-h-[500px] mt-4" : "max-h-0"
                        )}
                      >
                        <div className="border-t pt-4 space-y-4">
                          {/* Map */}
                          <div className="h-64 border rounded overflow-hidden">
                            {mapPoints.length ? (
                              <SimpleMap points={mapPoints} />
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                No GPS coordinates available for this exception.
                              </div>
                            )}
                          </div>

                          {/* Reason */}
                          {ex.reason && (
                            <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                              {ex.reason}
                            </p>
                          )}

                          {/* Review button */}
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              Created: {new Date(ex.createdAt).toLocaleString()}
                              {ex.reviewedAt && (
                                <>
                                  {" · Reviewed: "}
                                  {new Date(ex.reviewedAt).toLocaleString()}
                                  {ex.reviewedBy && ` by ${ex.reviewedBy}`}
                                </>
                              )}
                            </div>
                            <Button
                              variant={ex.reviewed ? "outline" : "default"}
                              className="flex gap-2 items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkReviewed(ex);
                              }}
                            >
                              <CheckCircle size={16} />
                              {ex.reviewed
                                ? "Mark as Unreviewed"
                                : "Mark as Reviewed"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination / load more */}
            {!loading && hasMore && !heatmapView && (
              <div className="flex justify-center pt-4">
                <Button onClick={() => load(false)} disabled={loadingMore}>
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
