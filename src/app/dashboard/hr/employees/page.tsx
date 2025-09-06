"use client";

import { useState, useEffect } from "react";
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
import { DataTable } from "@/components/data-table";
import CreateEmployeeModal from "./CreateEmployeeModal";

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

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/employees", {
          credentials: "include",
        });
        const data = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredData = employees.filter((employee) => {
    // Use firstName/lastName if available, else fall back to name
    const firstName =
      employee.firstName || (employee.name ? employee.name.split(" ")[0] : "");
    const lastName =
      employee.lastName ||
      (employee.name ? employee.name.split(" ").slice(1).join(" ") : "");

    // Helper to normalize strings: trim, lowercase, collapse whitespace
    const normalize = (str: string = "") =>
      str.trim().toLowerCase().replace(/\s+/g, " ");

    return (
      normalize(firstName).includes(normalize(filters.firstName)) &&
      normalize(lastName).includes(normalize(filters.lastName)) &&
      (filters.status
        ? normalize(employee.status) === normalize(filters.status)
        : true) &&
      (filters.language
        ? (employee.languages || [])
            .map(normalize)
            .some((lang: string) => lang.includes(normalize(filters.language)))
        : true) &&
      (filters.position
        ? normalize(employee.position) === normalize(filters.position)
        : true) &&
      (filters.employeeId
        ? employee.employeeID &&
          normalize(employee.employeeID).includes(normalize(filters.employeeId))
        : true) &&
      (filters.supervisor
        ? employee.supervisor &&
          normalize(employee.supervisor).includes(normalize(filters.supervisor))
        : true) &&
      (filters.officeStaff
        ? normalize(employee.position) === "office"
        : true) &&
      (filters.management ? employee.isManagement : true)
    );
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employees</h2>
        <CreateEmployeeModal />
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
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Vacation">Vacation</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Language"
          value={filters.language}
          onChange={(e) => setFilters({ ...filters, language: e.target.value })}
        />
        <Select
          value={filters.position}
          onValueChange={(value) => setFilters({ ...filters, position: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Caregiver">Caregiver</SelectItem>
            <SelectItem value="Registered_Nurse">Registered Nurse</SelectItem>
            <SelectItem value="Licensed_Practical_Nurse">
              Licensed Practical Nurse
            </SelectItem>
          </SelectContent>
        </Select>
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
      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <DataTable columns={employeeColumns} data={filteredData} />
      )}
    </div>
  );
}
