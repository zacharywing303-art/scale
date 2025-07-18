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

// Define the Client type
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  middleInitial: string;
  status: "active" | "pending" | "inactive";
  supervisor: string;
  medicaidId: string;
  payerId: string;
  serviceStartDate: string;
  serviceEndDate: string;
  services: string[];
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

  const [rowsPerPage, setRowsPerPage] = useState(25);

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
    id: client.idNumber || `client-${idx}`, // Ensure there's a fallback ID
    firstName: client.firstName,
    lastName: client.lastName,
    middleInitial: "", // or parse if available
    status: (["active", "pending", "inactive"].includes(client.status)
      ? client.status
      : "active") as "active" | "pending" | "inactive",
    supervisor: client.supervisor,
    medicaidId: client.medicaidId,
    payerId: client.payerId,
    serviceStartDate: client.serviceStart,
    serviceEndDate: client.serviceEnd,
    services: client.services.split(",").map((s) => s.trim()), // convert to string[]
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clients</h2>
        <Button variant="default">Create Client</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label>First Name</Label>
          <Input
            value={filters.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={filters.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>
        <div>
          <Label>Client ID</Label>
          <Input
            value={filters.idNumber}
            onChange={(e) => handleChange("idNumber", e.target.value)}
          />
        </div>
        <div>
          <Label>Status</Label>
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
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Payer ID</Label>
          <Input
            value={filters.payerId}
            onChange={(e) => handleChange("payerId", e.target.value)}
          />
        </div>
        <div>
          <Label>Medicaid ID</Label>
          <Input
            value={filters.medicaidId}
            onChange={(e) => handleChange("medicaidId", e.target.value)}
          />
        </div>
        <div>
          <Label>Program</Label>
          <Input
            value={filters.program}
            onChange={(e) => handleChange("program", e.target.value)}
          />
        </div>
        <div>
          <Label>Language</Label>
          <Input
            value={filters.language}
            onChange={(e) => handleChange("language", e.target.value)}
          />
        </div>
        <div>
          <Label>Supervisor</Label>
          <Input
            value={filters.supervisor}
            onChange={(e) => handleChange("supervisor", e.target.value)}
          />
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
    </div>
  );
}
