// "use client";

// import { useState } from "react";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { Pencil } from "lucide-react";
// import { Label } from "@/components/ui/label";
// import { mockVisits, visitColumns } from "./mock-visits";
// import { NOTE_DOC_URL } from "@/lib/constants";
// import { PlusIcon } from "@radix-ui/react-icons";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export default function VisitsPage() {
//   const [filters, setFilters] = useState({
//     employee: "",
//     client: "",
//     service: "",
//     status: "",
//     payer: "",
//     medicaidId: "",
//     exceptionOnly: false,
//     dateFrom: "",
//     dateTo: "",
//   });

//   const [perPage, setPerPage] = useState("25");
//   const [showDisplayFilters, setShowDisplayFilters] = useState(false);

//   const handleSearch = () => {
//     // Filter logic could go here
//   };
//   const [displayColumns, setDisplayColumns] = useState(
//     visitColumns.map((col) => col.key)
//   );

//   const handleDisplayToggle = (colKey: string) => {
//     setDisplayColumns((prev) =>
//       prev.includes(colKey)
//         ? prev.filter((k) => k !== colKey)
//         : [...prev, colKey]
//     );
//   };

//   return (
//     <div className="p-6">
//       <div className="mb-4">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold">Visits</h1>
//           <Button>
//             <PlusIcon className="mr-2" />
//             Create a Visit
//           </Button>
//         </div>

//         {/* Filters */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           <div>
//             <Label>Date From</Label>
//             <Input
//               type="date"
//               value={filters.dateFrom}
//               onChange={(e) =>
//                 setFilters((f) => ({ ...f, dateFrom: e.target.value }))
//               }
//             />
//           </div>
//           <div>
//             <Label>Date To</Label>
//             <Input
//               type="date"
//               value={filters.dateTo}
//               onChange={(e) =>
//                 setFilters((f) => ({ ...f, dateTo: e.target.value }))
//               }
//             />
//           </div>
//           <div>
//             <Label>Employee</Label>
//             <Input
//               value={filters.employee}
//               onChange={(e) =>
//                 setFilters((f) => ({ ...f, employee: e.target.value }))
//               }
//               placeholder="Search employee"
//             />
//           </div>
//           <div>
//             <Label>Client</Label>
//             <Input
//               value={filters.client}
//               onChange={(e) =>
//                 setFilters((f) => ({ ...f, client: e.target.value }))
//               }
//               placeholder="Search client"
//             />
//           </div>
//           <div>
//             <Label>Service</Label>
//             <Input
//               value={filters.service}
//               onChange={(e) =>
//                 setFilters((f) => ({ ...f, service: e.target.value }))
//               }
//               placeholder="Service name"
//             />
//           </div>
//           <div>
//             <Label>Status</Label>
//             <Select
//               onValueChange={(val) =>
//                 setFilters((f) => ({ ...f, status: val }))
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="pending">Pending</SelectItem>
//                 <SelectItem value="completed">Completed</SelectItem>
//                 <SelectItem value="billed">Billed</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div>
//             <Label>Payer</Label>
//             <Input
//               value={filters.payer}
//               onChange={(e) =>
//                 setFilters((f) => ({ ...f, payer: e.target.value }))
//               }
//             />
//           </div>
//           <div>
//             <Label>Medicaid ID</Label>
//             <Input
//               value={filters.medicaidId}
//               onChange={(e) =>
//                 setFilters((f) => ({ ...f, medicaidId: e.target.value }))
//               }
//             />
//           </div>
//           <div className="col-span-2 flex items-end gap-2">
//             <Checkbox
//               checked={filters.exceptionOnly}
//               onCheckedChange={(val) =>
//                 setFilters((f) => ({ ...f, exceptionOnly: val as boolean }))
//               }
//             />
//             <Label>Show only visits with exceptions</Label>
//           </div>
//           <div className="col-span-2">
//             <Button onClick={handleSearch} className="w-full">
//               Search Visits
//             </Button>
//           </div>
//         </div>

//         {/* Display Filters */}
//         <details className="mb-4">
//           <summary className="cursor-pointer font-semibold">
//             Display Filters
//           </summary>
//           <ScrollArea className="border rounded p-4 max-h-56 mt-2">
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//               {visitColumns.map(({ key, label }) => (
//                 <div key={key} className="flex items-center space-x-2">
//                   <Checkbox
//                     checked={displayColumns.includes(key)}
//                     onCheckedChange={() => handleDisplayToggle(key)}
//                   />
//                   <Label>{label}</Label>
//                 </div>
//               ))}
//             </div>
//           </ScrollArea>
//         </details>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between mt-4">
//         <div className="flex items-center space-x-2">
//           <Label>Visits per page:</Label>
//           <Select
//             onValueChange={(val) => setPerPage(val)}
//             defaultValue={perPage}
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
//         <div>
//           <Button variant="ghost">← Prev</Button>
//           <Button variant="ghost">Next →</Button>
//         </div>
//       </div>

//       {/* Visit Table */}
//       <div className="overflow-x-auto border rounded">
//         <table className="w-full text-sm text-left">
//           <thead className="bg-gray-100 dark:bg-gray-800">
//             <tr>
//               {displayColumns.map((colKey) => {
//                 const column = visitColumns.find((col) => col.key === colKey);
//                 return (
//                   <th key={colKey} className="px-4 py-2 font-medium">
//                     {column?.label}
//                   </th>
//                 );
//               })}
//               <th className="px-4 py-2 font-medium">Edit</th>
//             </tr>
//           </thead>
//           <tbody>
//             {mockVisits.map((visit, idx) => (
//               <tr key={idx} className="border-t">
//                 {displayColumns.map((colKey) => {
//                   let value = visit[colKey as keyof typeof visit];

//                   if (colKey === "note") {
//                     return (
//                       <td
//                         key={colKey}
//                         className="px-4 py-2 text-blue-600 underline"
//                       >
//                         <a
//                           href={NOTE_DOC_URL}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                         >
//                           View Note
//                         </a>
//                       </td>
//                     );
//                   }

//                   if (colKey === "doNotBill") {
//                     return (
//                       <td key={colKey} className="px-4 py-2">
//                         <Checkbox checked={value === "Yes"} disabled />
//                       </td>
//                     );
//                   }

//                   return (
//                     <td key={colKey} className="px-4 py-2">
//                       {value || "—"}
//                     </td>
//                   );
//                 })}
//                 <td className="px-4 py-2">
//                   <Button variant="ghost" size="icon">
//                     <Pencil className="w-4 h-4" />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import { mockVisits, visitColumns } from "./mock-visits";
import { NOTE_DOC_URL } from "@/lib/constants";
import { PlusIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

// Default display columns
const defaultDisplayColumns = [
  "date",
  "clockIn",
  "clockOut",
  "clientName",
  "employeeName",
  "service",
  "hours",
  "units",
  "visitStatus",
  "doNotBill",
  "edit",
];

export default function VisitsPage() {
  const searchParams = useSearchParams();
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

  const handleDisplayToggle = (colKey: string) => {
    setDisplayColumns((prev) =>
      prev.includes(colKey)
        ? prev.filter((k) => k !== colKey)
        : [...prev, colKey]
    );
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const filteredVisits = useMemo(() => {
    return mockVisits.filter((visit) => {
      return (
        ((!filters.employee ||
          visit.employeeName
            ?.toLowerCase()
            .includes(filters.employee.toLowerCase())) &&
          (!filters.client ||
            visit.clientName
              ?.toLowerCase()
              .includes(filters.client.toLowerCase())) &&
          (!filters.service ||
            visit.service
              ?.toLowerCase()
              .includes(filters.service.toLowerCase())) &&
          (!filters.status || visit.visitStatus === filters.status) &&
          (!filters.payer ||
            visit.payer?.toLowerCase().includes(filters.payer.toLowerCase())) &&
          (!filters.medicaidId ||
            visit.medicaidId?.includes(filters.medicaidId)) &&
          // (!filters.exceptionOnly || visit.exception === true)
          !filters.exceptionOnly) ||
        visit.exception === "Exception Occurred"
      );
    });
  }, [filters]);

  const paginatedVisits = filteredVisits.slice(
    (currentPage - 1) * parseInt(perPage),
    currentPage * parseInt(perPage)
  );

  const totalPages = Math.ceil(filteredVisits.length / parseInt(perPage));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Visits</h1>
        <Button>
          <PlusIcon className="mr-2" />
          Create a Visit
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <Label>Date From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dateFrom: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Date To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dateTo: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Employee</Label>
          <Input
            value={filters.employee}
            onChange={(e) =>
              setFilters((f) => ({ ...f, employee: e.target.value }))
            }
            placeholder="Search employee"
          />
        </div>
        <div>
          <Label>Client</Label>
          <Input
            value={filters.client}
            onChange={(e) =>
              setFilters((f) => ({ ...f, client: e.target.value }))
            }
            placeholder="Search client"
          />
        </div>
        <div>
          <Label>Service</Label>
          <Input
            value={filters.service}
            onChange={(e) =>
              setFilters((f) => ({ ...f, service: e.target.value }))
            }
            placeholder="Service name"
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            onValueChange={(val) => setFilters((f) => ({ ...f, status: val }))}
            value={filters.status}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="billed">Billed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Payer</Label>
          <Input
            value={filters.payer}
            onChange={(e) =>
              setFilters((f) => ({ ...f, payer: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Medicaid ID</Label>
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
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {displayColumns.map((colKey) => {
                const column = visitColumns.find((col) => col.key === colKey);
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
              <tr key={idx} className="border-t">
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
                        <Button variant="ghost" size="icon">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </td>
                    );
                  }

                  return (
                    <td key={colKey} className="px-4 py-2">
                      {visit[colKey as keyof typeof visit] || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
}
