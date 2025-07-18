"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { employeeColumns } from "./columns";
import { Employee } from "./employee";
import { DataTable } from "@/components/data-table";

const mockEmployees: Employee[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    status: "active",
    language: "English",
    position: "Caregiver",
    employeeId: "EMP001",
    supervisor: "Jane Smith",
    isOfficeStaff: false,
    isManagement: false,
    hireDate: "2023-01-15",
    endDate: "",
    updatedAt: "2025-06-29 10:00 AM",
  },
  {
    id: "2",
    firstName: "Lisa",
    lastName: "Jones",
    status: "vacation",
    language: "Spanish",
    position: "Nurse",
    employeeId: "EMP002",
    supervisor: "John Clark",
    isOfficeStaff: true,
    isManagement: true,
    hireDate: "2021-06-20",
    endDate: "",
    updatedAt: "2025-06-29 09:45 AM",
  },
];

export default function EmployeesPage() {
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    status: "",
    language: "",
    position: "",
    employeeId: "",
    supervisor: "",
    officeStaff: false,
    management: false,
  });

  const [data] = useState(mockEmployees);

  const filteredData = data.filter((employee) => {
    return (
      employee.firstName
        .toLowerCase()
        .includes(filters.firstName.toLowerCase()) &&
      employee.lastName
        .toLowerCase()
        .includes(filters.lastName.toLowerCase()) &&
      (filters.status ? employee.status === filters.status : true) &&
      (filters.language ? employee.language === filters.language : true) &&
      (filters.position ? employee.position === filters.position : true) &&
      (filters.employeeId
        ? employee.employeeId.includes(filters.employeeId)
        : true) &&
      (filters.supervisor
        ? employee.supervisor.includes(filters.supervisor)
        : true) &&
      (filters.officeStaff ? employee.isOfficeStaff : true) &&
      (filters.management ? employee.isManagement : true)
    );
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employees</h2>
        <Button>Add Employee</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Input
          placeholder="Last Name"
          value={filters.lastName}
          onChange={(e) => setFilters({ ...filters, lastName: e.target.value })}
        />
        <Input
          placeholder="First Name"
          value={filters.firstName}
          onChange={(e) =>
            setFilters({ ...filters, firstName: e.target.value })
          }
        />
        <Select
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="vacation">Vacation</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Language"
          value={filters.language}
          onChange={(e) => setFilters({ ...filters, language: e.target.value })}
        />
        <Input
          placeholder="Position"
          value={filters.position}
          onChange={(e) => setFilters({ ...filters, position: e.target.value })}
        />
        <Input
          placeholder="Employee ID"
          value={filters.employeeId}
          onChange={(e) =>
            setFilters({ ...filters, employeeId: e.target.value })
          }
        />
        <Input
          placeholder="Assigned Supervisor"
          value={filters.supervisor}
          onChange={(e) =>
            setFilters({ ...filters, supervisor: e.target.value })
          }
        />
        <div className="flex items-center gap-2">
          <Checkbox
            checked={filters.officeStaff}
            onCheckedChange={(checked) =>
              setFilters({ ...filters, officeStaff: !!checked })
            }
          />
          <span>Office Staff</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={filters.management}
            onCheckedChange={(checked) =>
              setFilters({ ...filters, management: !!checked })
            }
          />
          <span>Management</span>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={employeeColumns} data={filteredData} />
    </div>
  );
}
