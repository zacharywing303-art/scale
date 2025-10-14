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

export default function EditSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    type: "",
    service: "",
    employee: "",
    client: "",
    job: "",
    date: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [perPage, setPerPage] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSchedules = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedules`
      );
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const paginatedSchedules = schedules.slice(
    (currentPage - 1) * parseInt(perPage),
    currentPage * parseInt(perPage)
  );

  const totalPages = Math.ceil(schedules.length / parseInt(perPage));

  if (loading) return <p className="p-6 text-gray-500">Loading schedules...</p>;

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Schedule</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select
            onValueChange={(val) => setFilters({ ...filters, type: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type (Visit, Office, etc...)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Visit">Visit</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Facility">Facility</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Service / Reason"
            onChange={(e) =>
              setFilters({ ...filters, service: e.target.value })
            }
          />
          <Input
            placeholder="Employee"
            onChange={(e) =>
              setFilters({ ...filters, employee: e.target.value })
            }
          />
          <Input
            placeholder="Client"
            onChange={(e) => setFilters({ ...filters, client: e.target.value })}
          />
        </div>

        {/* Schedule Table */}
        <ScrollArea className="rounded border">
          <table className="min-w-full table-auto text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Type</th>
                <th className="p-3">Client</th>
                <th className="p-3">Service</th>
                <th className="p-3">Start Time</th>
                <th className="p-3">End Time</th>
                <th className="p-3">Date</th>
                <th className="p-3">Recurring</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSchedules.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.employee?.name || "N/A"}</td>
                  <td className="p-3">{s.scheduleType}</td>
                  <td className="p-3">{s.client?.name || "N/A"}</td>
                  <td className="p-3">{s.service?.name || "N/A"}</td>
                  <td className="p-3">
                    {new Date(s.startTime.replace(" ", "T")).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </td>
                  <td className="p-3">
                    {new Date(s.endTime.replace(" ", "T")).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </td>
                  <td className="p-3">
                    {new Date(
                      s.eventDate.replace(" ", "T")
                    ).toLocaleDateString()}
                  </td>
                  <td className="p-3">{s.recurring ? "Yes" : "No"}</td>
                  <td className="p-3 text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </DialogTrigger>
                      <EditScheduleModal
                        schedule={s}
                        onClose={fetchSchedules}
                      />
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

// import React, { useState } from "react";
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
// import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
// import EditScheduleModal from "./EditScheduleModal";
// import { Label } from "@/components/ui/label";

// const mockSchedules = [
//   {
//     id: "1",
//     employee: "Jane Doe",
//     type: "Visit",
//     client: "John Smith",
//     service: "IHCS Level 1",
//     scheduledIn: "9:00 AM",
//     scheduledOut: "11:00 AM",
//     dateFrom: "2025-06-29",
//     dateTo: "2025-07-01",
//     recurring: true,
//   },
//   {
//     id: "2",
//     employee: "Mark Johnson",
//     type: "Office",
//     client: null,
//     service: "Team Meeting",
//     scheduledIn: "1:00 PM",
//     scheduledOut: "2:00 PM",
//     dateFrom: "2025-06-29",
//     dateTo: "2025-06-29",
//     recurring: false,
//   },
// ];

// export default function EditSchedulePage() {
//   const [filters, setFilters] = useState({
//     type: "",
//     service: "",
//     employee: "",
//     client: "",
//     job: "",
//     date: new Date(),
//   });

//   const [perPage, setPerPage] = useState("25");
//   const [currentPage, setCurrentPage] = useState(1);

//   const paginatedSchedules = mockSchedules.slice(
//     (currentPage - 1) * parseInt(perPage),
//     currentPage * parseInt(perPage)
//   );

//   const totalPages = Math.ceil(mockSchedules.length / parseInt(perPage));

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Edit Schedule</h1>

//       {/* Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <Select onValueChange={(val) => setFilters({ ...filters, type: val })}>
//           <SelectTrigger>
//             <SelectValue placeholder="Type (Visit, Office, etc...)" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="Visit">Visit</SelectItem>
//             <SelectItem value="Office">Office</SelectItem>
//             <SelectItem value="Facility">Facility</SelectItem>
//           </SelectContent>
//         </Select>

//         <Input
//           placeholder="Service / Reason"
//           onChange={(e) => setFilters({ ...filters, service: e.target.value })}
//         />

//         <Input
//           placeholder="Employee"
//           onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
//         />

//         <Input
//           placeholder="Client"
//           onChange={(e) => setFilters({ ...filters, client: e.target.value })}
//         />

//         <Input
//           placeholder="Job Role (e.g., Caregiver, Nurse)"
//           onChange={(e) => setFilters({ ...filters, job: e.target.value })}
//         />
//       </div>

//       {/* Schedule Table */}
//       <ScrollArea className="rounded border">
//         <table className="min-w-full table-auto text-left text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3 font-medium text-gray-600">Employee</th>
//               <th className="p-3 font-medium text-gray-600">Type</th>
//               <th className="p-3 font-medium text-gray-600">Client</th>
//               <th className="p-3 font-medium text-gray-600">Service/Reason</th>
//               <th className="p-3 font-medium text-gray-600">Scheduled In</th>
//               <th className="p-3 font-medium text-gray-600">Scheduled Out</th>
//               <th className="p-3 font-medium text-gray-600">Date From</th>
//               <th className="p-3 font-medium text-gray-600">Date To</th>
//               <th className="p-3 font-medium text-gray-600">Recurring</th>
//               <th className="p-3 font-medium text-gray-600 text-right">
//                 Action
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {mockSchedules.map((s) => (
//               <tr key={s.id} className="border-t">
//                 <td className="p-3">{s.employee}</td>
//                 <td className="p-3">{s.type}</td>
//                 <td className="p-3">{s.client ?? "N/A"}</td>
//                 <td className="p-3">{s.service}</td>
//                 <td className="p-3">{s.scheduledIn}</td>
//                 <td className="p-3">{s.scheduledOut}</td>
//                 <td className="p-3">{s.dateFrom}</td>
//                 <td className="p-3">{s.dateTo}</td>
//                 <td className="p-3">{s.recurring ? "Yes" : "No"}</td>
//                 <td className="p-3 text-right">
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button size="sm" variant="outline">
//                         Edit Schedule
//                       </Button>
//                     </DialogTrigger>
//                     <EditScheduleModal
//                       schedule={s}
//                       onClose={() => {
//                         // TODO: Replace with refetch when connected to backend
//                         console.log("Modal closed, refresh schedules here");
//                       }}
//                     />
//                   </Dialog>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </ScrollArea>

//       {/* Pagination */}
//       <div className="flex items-center justify-between mt-4">
//         <div className="flex items-center space-x-2">
//           <Label>Clients per page:</Label>
//           <Select
//             onValueChange={(val) => {
//               setPerPage(val);
//               setCurrentPage(1);
//             }}
//             value={perPage}
//           >
//             <SelectTrigger className="w-20">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="10">10</SelectItem>
//               <SelectItem value="25">25</SelectItem>
//               <SelectItem value="50">50</SelectItem>
//               <SelectItem value="100">100</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             variant="ghost"
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//           >
//             ← Prev
//           </Button>
//           <span className="text-sm text-muted-foreground">
//             Page {currentPage} of {totalPages}
//           </span>
//           <Button
//             variant="ghost"
//             onClick={() =>
//               setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
//             }
//             disabled={currentPage >= totalPages}
//           >
//             Next →
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
