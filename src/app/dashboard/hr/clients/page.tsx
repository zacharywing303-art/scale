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
import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns"; // we'll define columns next
import { clientsData } from "./mock-data"; // fake data
import CreateClientModal from "./CreateClientModal";

// Define the Client type
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  middleInitial: string;
  status: "active" | "pending" | "inactive";
  supervisor: "Nina Lewis" | "Tom Reid" | "all";
  medicaidId: string;
  payerId: string;
  serviceStartDate: string;
  serviceEndDate: string;
  services: string[];
  program: string;
}

export default function ClientsPage() {
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    idNumber: "",
    status: "",
    payerId: "",
    medicaidId: "",
    program: "",
    language: "",
    supervisor: "",
  });

  const [perPage, setPerPage] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);

  const handleChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    setFilters({
      firstName: "",
      lastName: "",
      idNumber: "",
      status: "",
      payerId: "",
      medicaidId: "",
      program: "",
      language: "",
      supervisor: "",
    });
  };

  const filteredClients = clientsData.filter((client) => {
    const matches = Object.entries(filters).every(([key, value]) =>
      value
        ? client[key as keyof typeof client]
            ?.toLowerCase()
            .includes(value.toLowerCase())
        : true
    );
    return matches;
  });

  const mappedClients: Client[] = filteredClients.map((client, idx) => ({
    id: client.id || `client-${idx}`, // Ensure there's a fallback ID
    firstName: client.firstName,
    lastName: client.lastName,
    middleInitial: "", // or parse if available
    status: (["active", "pending", "inactive"].includes(client.status)
      ? client.status
      : "active") as "active" | "pending" | "inactive",
    supervisor: (["Nina Lewis", "Tom Reid", "all"].includes(client.supervisor)
      ? client.supervisor
      : "Nina Lewis") as "Nina Lewis" | "Tom Reid" | "all",
    medicaidId: client.medicaidId,
    payerId: client.payerId,
    serviceStartDate: client.serviceStart,
    serviceEndDate: client.serviceEnd,
    services: client.services.split(",").map((s) => s.trim()), // convert to string[]
    program: client.program || "N/A", // Ensure there's a fallback
  }));

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * parseInt(perPage),
    currentPage * parseInt(perPage)
  );

  const totalPages = Math.ceil(paginatedClients.length / parseInt(perPage));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clients</h2>
        <CreateClientModal />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label className="mb-1 block">First Name</Label>
          <Input
            value={filters.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Last Name</Label>
          <Input
            value={filters.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Client ID</Label>
          <Input
            value={filters.idNumber}
            onChange={(e) => handleChange("idNumber", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Status</Label>
          <Select
            onValueChange={(val) => handleChange("status", val)}
            value={filters.status}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block">Payer ID</Label>
          <Input
            value={filters.payerId}
            onChange={(e) => handleChange("payerId", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Medicaid ID</Label>
          <Input
            value={filters.medicaidId}
            onChange={(e) => handleChange("medicaidId", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Program</Label>
          <Input
            value={filters.program}
            onChange={(e) => handleChange("program", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Language</Label>
          <Input
            value={filters.language}
            onChange={(e) => handleChange("language", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Supervisor</Label>
          <Select
            onValueChange={(val) => handleChange("supervisor", val)}
            value={filters.supervisor}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nina Lewis">Nina Lewis</SelectItem>
              <SelectItem value="Tom Reid">Tom Reid</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 md:col-span-3 flex gap-3">
          <Button onClick={() => {}} className="w-full">
            Search
          </Button>
          <Button variant="outline" onClick={clearFilters} className="w-full">
            Clear
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable data={mappedClients} columns={columns} />

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Label>Clients per page:</Label>
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
