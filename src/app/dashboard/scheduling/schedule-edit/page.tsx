"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditScheduleModal from "./EditScheduleModal";
import { Label } from "@/components/ui/label";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

type GroupedSchedule = {
  createdScheduleID: string;
  scheduleType?: string;
  client?: { name: string } | null;
  service?: { name: string } | null;
  eventCode?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  employees: { name: string }[];
  weekdays: string[];
  recurring?: boolean;
  recurringFrequency?: string;
};

const columns: ColumnDef<GroupedSchedule>[] = [
  {
    header: "Employee(s)",
    accessorFn: (row) => {
      const names = row.employees?.map((e) => e?.name).filter(Boolean) ?? [];
      const seen = new Set<string>();
      const unique = names.filter((n) => {
        const key = n.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return unique.length ? unique.join(", ") : "N/A";
    },
  },
  {
    header: "Type",
    accessorFn: (row) =>
      row.scheduleType
        ? row.scheduleType.charAt(0).toUpperCase() +
          row.scheduleType.slice(1).toLowerCase()
        : "N/A",
  },
  {
    header: "Client",
    accessorFn: (row) => row.client?.name || "N/A",
  },
  {
    header: "Service / Reason",
    accessorFn: (row) =>
      row.scheduleType === "visit"
        ? row.service?.name || "N/A"
        : row.eventCode || "N/A",
  },
  {
    header: "Time",
    accessorFn: (row) =>
      `${new Date(row.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(row.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
  },
  {
    header: "Date Range",
    accessorFn: (row) => {
      const start = new Date(row.startDate).toLocaleDateString();
      const end = new Date(row.endDate).toLocaleDateString();
      return start === end ? start : `${start} - ${end}`;
    },
  },
  {
    header: "Weekday(s)",
    accessorFn: (row) => row.weekdays.join(", "),
  },
  {
    header: "Recurring",
    accessorFn: (row) =>
      row.recurring ? `Yes (${row.recurringFrequency?.toLowerCase()})` : "",
  },
  {
    header: "Action",
    id: "action",
    cell: ({ row }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </DialogTrigger>
        <EditScheduleModal
          schedule={row.original}
          onClose={() => window.location.reload()}
        />
      </Dialog>
    ),
  },
];

export default function EditSchedulePage() {
  const [user, setUser] = useState<any>(null);
  const [schedules, setSchedules] = useState<GroupedSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    service: "",
    employee: "",
    client: "",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
  });
  const [perPage, setPerPage] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);

  /** 🧠 Load logged-in user first */
  useEffect(() => {
    (async () => {
      const u = await getLoggedInUser();
      setUser(u);
    })();
  }, []);

  /** 🔄 Fetch grouped schedules */
  const fetchSchedules = async () => {
    if (!user?.agency?.id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.dateFrom)
        params.append("from", filters.dateFrom.toISOString().split("T")[0]);
      if (filters.dateTo)
        params.append("to", filters.dateTo.toISOString().split("T")[0]);

      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/agency/${user.agency.id}/grouped${query}`
      );
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /** 📅 Re-fetch when filters or user changes */
  useEffect(() => {
    if (user?.agency?.id) fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters.dateFrom, filters.dateTo]);

  /** 🔍 Client-side filters */
  const filteredSchedules = schedules
    .filter((s) => (filters.type ? s.scheduleType === filters.type : true))
    .filter((s) =>
      filters.service
        ? s.service?.name?.toLowerCase().includes(filters.service.toLowerCase())
        : true
    )
    .filter((s) =>
      filters.employee
        ? s.employees
            ?.map((e) => e.name.toLowerCase())
            .some((n) => n.includes(filters.employee.toLowerCase()))
        : true
    )
    .filter((s) =>
      filters.client
        ? s.client?.name?.toLowerCase().includes(filters.client.toLowerCase())
        : true
    );

  const paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * parseInt(perPage),
    currentPage * parseInt(perPage)
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSchedules.length / parseInt(perPage))
  );

  if (loading) return <p className="p-6 text-gray-500">Loading schedules...</p>;

  return (
    <ProtectedRoute
      allowedRoles={["AGENCY_ADMIN"]}
      permission="Create/Edit Schedule"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Schedule</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Select
            onValueChange={(val) => setFilters({ ...filters, type: val })}
            value={filters.type}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type (Visit, Office, etc...)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visit">Visit</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="facility">Facility</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Service / Reason"
            value={filters.service}
            onChange={(e) =>
              setFilters({ ...filters, service: e.target.value })
            }
          />
          <Input
            placeholder="Employee"
            value={filters.employee}
            onChange={(e) =>
              setFilters({ ...filters, employee: e.target.value })
            }
          />
          <Input
            placeholder="Client"
            value={filters.client}
            onChange={(e) => setFilters({ ...filters, client: e.target.value })}
          />

          {/* Date Range Filters */}
          <Input
            type="date"
            value={
              filters.dateFrom
                ? filters.dateFrom.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                dateFrom: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />
          <Input
            type="date"
            value={
              filters.dateTo ? filters.dateTo.toISOString().split("T")[0] : ""
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                dateTo: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />
        </div>

        {/* Schedule Table */}
        <ScrollArea className="rounded border">
          <DataTable columns={columns} data={paginatedSchedules} />
        </ScrollArea>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Label>Per page:</Label>
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
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                setCurrentPage((p) => (p < totalPages ? p + 1 : p))
              }
              disabled={currentPage >= totalPages}
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
// "use client";

// import React, { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Dialog, DialogTrigger } from "@/components/ui/dialog";
// import EditScheduleModal from "./EditScheduleModal";
// import { Label } from "@/components/ui/label";
// import ProtectedRoute from "@/components/auth/ProtectedRoute";
// import { DataTable } from "@/components/data-table";
// import type { ColumnDef } from "@tanstack/react-table";
// import { getLoggedInUser } from "@/lib/auth/authHelpers";

// type Schedule = {
//   id: string;
//   employee?: { name: string } | null;
//   scheduleType?: string;
//   client?: { name: string } | null;
//   service?: { name: string } | null;
//   startTime?: string;
//   endTime?: string;
//   eventDate?: string;
//   recurring?: boolean;
// };

// const columns: ColumnDef<any>[] = [
//   {
//     header: "Employee(s)",
//     accessorFn: (row) => row.employees?.map((e) => e?.name).join(", ") || "N/A",
//   },
//   {
//     header: "Type",
//     accessorKey: "scheduleType",
//   },
//   {
//     header: "Client",
//     accessorFn: (row) => row.client?.name || "N/A",
//   },
//   {
//     header: "Service / Reason",
//     accessorFn: (row) =>
//       row.scheduleType === "visit"
//         ? row.service?.name || "N/A"
//         : row.eventCode || "N/A",
//   },
//   {
//     header: "Time",
//     accessorFn: (row) =>
//       `${new Date(row.startTime).toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       })} - ${new Date(row.endTime).toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       })}`,
//   },
//   {
//     header: "Date",
//     accessorFn: (row) => {
//       const start = new Date(row.startDate).toLocaleDateString();
//       const end = new Date(row.endDate).toLocaleDateString();
//       return start === end ? start : `${start} - ${end}`;
//     },
//   },
//   {
//     header: "Weekday(s)",
//     accessorFn: (row) => row.weekdays.join(", "),
//   },
//   {
//     header: "Recurring",
//     accessorFn: (row) =>
//       row.recurring
//         ? `Yes - ${row.recurringFrequency?.toLowerCase()}`
//         : "",
//   },
//   {
//     header: "Action",
//     id: "action",
//     cell: ({ row }) => (
//       <Dialog>
//         <DialogTrigger asChild>
//           <Button size="sm" variant="outline">
//             Edit
//           </Button>
//         </DialogTrigger>
//         <EditScheduleModal schedule={row.original} onClose={fetchSchedules} />
//       </Dialog>
//     ),
//   },
// ];

// export default function EditSchedulePage() {
//   const [schedules, setSchedules] = useState<Schedule[]>([]);
//   const [filters, setFilters] = useState({
//     type: "",
//     service: "",
//     employee: "",
//     client: "",
//     job: "",
//     date: new Date(),
//   });
//   const [loading, setLoading] = useState(true);
//   const [perPage, setPerPage] = useState("25");
//   const [currentPage, setCurrentPage] = useState(1);

//   const user = getLoggedInUser();

// const fetchSchedules = async () => {
//   try {
//     const query = filters.dateFrom && filters.dateTo
//       ? `?from=${filters.dateFrom.toISOString()}&to=${filters.dateTo.toISOString()}`
//       : "";
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedules/agency/${user?.agency?.id}/grouped${query}`);
//     if (!res.ok) throw new Error("Failed to fetch schedules");
//     const data = await res.json();
//     setSchedules(data);
//   } catch (err) {
//     console.error(err);
//   } finally {
//     setLoading(false);
//   }
// };

//   useEffect(() => {
//     fetchSchedules();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const filteredSchedules = schedules
//     .filter((s) => s.startTime && s.endTime)
//     .filter((s) => (filters.type ? s.scheduleType === filters.type : true))
//     .filter((s) =>
//       filters.service
//         ? s.service?.name?.toLowerCase().includes(filters.service.toLowerCase())
//         : true
//     )
//     .filter((s) =>
//       filters.employee
//         ? s.employee?.name
//             ?.toLowerCase()
//             .includes(filters.employee.toLowerCase())
//         : true
//     )
//     .filter((s) =>
//       filters.client
//         ? s.client?.name?.toLowerCase().includes(filters.client.toLowerCase())
//         : true
//     );

//   const paginatedSchedules = filteredSchedules.slice(
//     (currentPage - 1) * parseInt(perPage),
//     currentPage * parseInt(perPage)
//   );

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredSchedules.length / parseInt(perPage))
//   );

//   if (loading) return <p className="p-6 text-gray-500">Loading schedules...</p>;

//   return (
//     <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold mb-4">Edit Schedule</h1>

//         {/* Filters */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//           <Select
//             onValueChange={(val) => setFilters({ ...filters, type: val })}
//             value={filters.type}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Type (Visit, Office, etc...)" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="Visit">Visit</SelectItem>
//               <SelectItem value="Office">Office</SelectItem>
//               <SelectItem value="Facility">Facility</SelectItem>
//             </SelectContent>
//           </Select>

//           <Input
//             placeholder="Service / Reason"
//             value={filters.service}
//             onChange={(e) =>
//               setFilters({ ...filters, service: e.target.value })
//             }
//           />
//           <Input
//             placeholder="Employee"
//             value={filters.employee}
//             onChange={(e) =>
//               setFilters({ ...filters, employee: e.target.value })
//             }
//           />
//           <Input
//             placeholder="Client"
//             value={filters.client}
//             onChange={(e) => setFilters({ ...filters, client: e.target.value })}
//           />
//           <Input
//     type="date"
//     value={filters.dateFrom?.toISOString().split("T")[0] || ""}
//     onChange={(e) =>
//       setFilters({ ...filters, dateFrom: new Date(e.target.value) })
//     }
//   />
//   <Input
//     type="date"
//     value={filters.dateTo?.toISOString().split("T")[0] || ""}
//     onChange={(e) =>
//       setFilters({ ...filters, dateTo: new Date(e.target.value) })
//     }
//   />
//         </div>

//         {/* Schedule Table */}
//         <ScrollArea className="rounded border">
//           <DataTable columns={columns} data={paginatedSchedules} />
//         </ScrollArea>

//         {/* Pagination */}
//         <div className="flex items-center justify-between mt-4">
//           <div className="flex items-center space-x-2">
//             <Label>Per page:</Label>
//             <Select
//               onValueChange={(val) => {
//                 setPerPage(val);
//                 setCurrentPage(1);
//               }}
//               value={perPage}
//             >
//               <SelectTrigger className="w-20">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="10">10</SelectItem>
//                 <SelectItem value="25">25</SelectItem>
//                 <SelectItem value="50">50</SelectItem>
//                 <SelectItem value="100">100</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="flex gap-2">
//             <Button
//               variant="ghost"
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//             >
//               ← Prev
//             </Button>
//             <span className="text-sm text-muted-foreground">
//               Page {currentPage} of {totalPages}
//             </span>
//             <Button
//               variant="ghost"
//               onClick={() =>
//                 setCurrentPage((p) => (p < totalPages ? p + 1 : p))
//               }
//               disabled={currentPage >= totalPages}
//             >
//               Next →
//             </Button>
//           </div>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }
