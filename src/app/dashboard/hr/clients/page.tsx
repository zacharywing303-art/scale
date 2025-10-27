"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns"; // we'll define columns next
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import CreateClientModal from "./CreateClientModal";

interface Client {
  id: string;
  name: string;
  status: string;
  supervisor?: string;
  medicaidID: string;
  clientID: string;
  payerId?: string;
  startDate?: string;
  endDate?: string;
  services?: string[];
  program?: { name?: string };
  languages?: string[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: "",
    medicaidID: "",
    status: "",
    supervisor: "",
    program: "",
    language: "",
  });
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [languages] = useState([
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Mandarin",
    "Hindi",
    "Arabic",
    "Russian",
    "Other",
  ]);

  const user = getLoggedInUser();

  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!user?.agency?.id) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employees/agency/${user.agency.id}`
        );
        const data = await res.json();
        const supervisorsOnly = data.filter((emp: any) => emp.isSupervisor);
        setSupervisors(supervisorsOnly);
      } catch (err) {
        console.error("Error loading supervisors:", err);
      }
    };
    fetchSupervisors();
  }, [user]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!user?.agency?.id) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/clients/agency/${user.agency.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error("❌ Error fetching clients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  const [perPage, setPerPage] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);

  const handleChange = (field: string, value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const clearFilters = () =>
    setFilters({
      name: "",
      medicaidID: "",
      status: "",
      supervisor: "",
      program: "",
      language: "",
    });

  const filteredClients = clients.filter((client) => {
    const matches = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === "language") {
        return client.languages?.some((l) =>
          l.toLowerCase().includes(value.toLowerCase())
        );
      }
      const fieldValue =
        key === "name" ? client.name : client[key as keyof Client];
      return fieldValue?.toString().toLowerCase().includes(value.toLowerCase());
    });
    return matches;
  });

  // const mappedClients: Client[] = filteredClients.map((client, idx) => ({
  //   id: client.id || `client-${idx}`, // Ensure there's a fallback ID
  //   firstName: client.firstName,
  //   lastName: client.lastName,
  //   middleInitial: "", // or parse if available
  //   status: (["active", "pending", "inactive"].includes(client.status)
  //     ? client.status
  //     : "active") as "active" | "pending" | "inactive",
  //   supervisor: (["Nina Lewis", "Tom Reid", "all"].includes(client.supervisor)
  //     ? client.supervisor
  //     : "Nina Lewis") as "Nina Lewis" | "Tom Reid" | "all",
  //   medicaidId: client.medicaidId,
  //   payerId: client.payerId,
  //   serviceStartDate: client.serviceStart,
  //   serviceEndDate: client.serviceEnd,
  //   services: client.services.split(",").map((s) => s.trim()), // convert to string[]
  //   program: client.program || "N/A", // Ensure there's a fallback
  // }));

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * parseInt(perPage),
    currentPage * parseInt(perPage)
  );

  const totalPages = Math.ceil(paginatedClients.length / parseInt(perPage));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <CreateClientModal onClientCreated={() => window.location.reload()} />
      </div>

      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label className="mb-1">Client Name</Label>
              <Input
                value={filters.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-1">Medicaid ID</Label>
              <Input
                value={filters.medicaidID}
                onChange={(e) => handleChange("medicaidID", e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-1">Status</Label>
              <Select
                onValueChange={(v) => handleChange("status", v)}
                value={filters.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div>
              <Label className="mb-1">Language</Label>
              <Select
                onValueChange={(v) => handleChange("language", v)}
                value={filters.language}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supervisor */}
            <div>
              <Label className="mb-1">Supervisor</Label>
              <Select
                onValueChange={(v) => handleChange("supervisor", v)}
                value={filters.supervisor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 md:col-span-3 flex gap-3">
              <Button>Search</Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>

          <DataTable
            data={filteredClients.map((c) => ({
              id: c.id,
              clientID: c.clientID,
              firstName: c.name.split(" ")[0],
              lastName: c.name.split(" ")[1] || "",
              middleInitial: "",
              status: c.status as any,
              supervisor: (c.supervisor as any) || "N/A",
              medicaidId: c.medicaidID,
              payerId: c.payerId || "",
              startDate: c.startDate || "",
              endDate: c.endDate || "",
              services: c.services || [],
              program: c.program?.name || "N/A",
            }))}
            columns={columns}
          />
        </>
      )}
    </div>
  );
  // return (
  //   <div className="p-6">
  //     <div className="flex items-center justify-between mb-6">
  //       <h2 className="text-2xl font-bold text-gray-800">Clients</h2>
  //       <CreateClientModal />
  //     </div>

  //     {/* Filters */}
  //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  //       <div>
  //         <Label className="mb-1 block">First Name</Label>
  //         <Input
  //           value={filters.firstName}
  //           onChange={(e) => handleChange("firstName", e.target.value)}
  //         />
  //       </div>
  //       <div>
  //         <Label className="mb-1 block">Last Name</Label>
  //         <Input
  //           value={filters.lastName}
  //           onChange={(e) => handleChange("lastName", e.target.value)}
  //         />
  //       </div>
  //       <div>
  //         <Label className="mb-1 block">Client ID</Label>
  //         <Input
  //           value={filters.idNumber}
  //           onChange={(e) => handleChange("idNumber", e.target.value)}
  //         />
  //       </div>
  //       <div>
  //         <Label className="mb-1 block">Status</Label>
  //         <Select
  //           onValueChange={(val) => handleChange("status", val)}
  //           value={filters.status}
  //         >
  //           <SelectTrigger>
  //             <SelectValue placeholder="Select status" />
  //           </SelectTrigger>
  //           <SelectContent>
  //             <SelectItem value="pending">Pending</SelectItem>
  //             <SelectItem value="active">Active</SelectItem>
  //             <SelectItem value="inactive">Inactive</SelectItem>
  //             <SelectItem value="all">All</SelectItem>
  //           </SelectContent>
  //         </Select>
  //       </div>
  //       <div>
  //         <Label className="mb-1 block">Payer ID</Label>
  //         <Input
  //           value={filters.payerId}
  //           onChange={(e) => handleChange("payerId", e.target.value)}
  //         />
  //       </div>
  //       <div>
  //         <Label className="mb-1 block">Medicaid ID</Label>
  //         <Input
  //           value={filters.medicaidId}
  //           onChange={(e) => handleChange("medicaidId", e.target.value)}
  //         />
  //       </div>
  //       <div>
  //         <Label className="mb-1 block">Program</Label>
  //         <Input
  //           value={filters.program}
  //           onChange={(e) => handleChange("program", e.target.value)}
  //         />
  //       </div>
  //       <div>
  //         <Label className="mb-1 block">Language</Label>
  //         <Input
  //           value={filters.language}
  //           onChange={(e) => handleChange("language", e.target.value)}
  //         />
  //       </div>
  //       <div>
  //         <Label className="mb-1 block">Supervisor</Label>
  //         <Select
  //           onValueChange={(val) => handleChange("supervisor", val)}
  //           value={filters.supervisor}
  //         >
  //           <SelectTrigger>
  //             <SelectValue placeholder="Select supervisor" />
  //           </SelectTrigger>
  //           <SelectContent>
  //             <SelectItem value="Nina Lewis">Nina Lewis</SelectItem>
  //             <SelectItem value="Tom Reid">Tom Reid</SelectItem>
  //             <SelectItem value="all">All</SelectItem>
  //           </SelectContent>
  //         </Select>
  //       </div>
  //       <div className="col-span-1 md:col-span-3 flex gap-3">
  //         <Button onClick={() => {}} className="w-full">
  //           Search
  //         </Button>
  //         <Button variant="outline" onClick={clearFilters} className="w-full">
  //           Clear
  //         </Button>
  //       </div>
  //     </div>

  //     {/* Table */}
  //     <DataTable data={mappedClients} columns={columns} />

  //     {/* Pagination */}
  //     <div className="flex items-center justify-between mt-4">
  //       <div className="flex items-center space-x-2">
  //         <Label>Clients per page:</Label>
  //         <Select
  //           onValueChange={(val) => {
  //             setPerPage(val);
  //             setCurrentPage(1);
  //           }}
  //           value={perPage}
  //         >
  //           <SelectTrigger className="w-20">
  //             <SelectValue />
  //           </SelectTrigger>
  //           <SelectContent>
  //             <SelectItem value="10">10</SelectItem>
  //             <SelectItem value="25">25</SelectItem>
  //             <SelectItem value="50">50</SelectItem>
  //             <SelectItem value="100">100</SelectItem>
  //           </SelectContent>
  //         </Select>
  //       </div>
  //       <div className="flex gap-2">
  //         <Button
  //           variant="ghost"
  //           onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
  //           disabled={currentPage === 1}
  //         >
  //           ← Prev
  //         </Button>
  //         <span className="text-sm text-muted-foreground">
  //           Page {currentPage} of {totalPages}
  //         </span>
  //         <Button
  //           variant="ghost"
  //           onClick={() =>
  //             setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
  //           }
  //           disabled={currentPage >= totalPages}
  //         >
  //           Next →
  //         </Button>
  //       </div>
  //     </div>
  //   </div>
  // );
}
