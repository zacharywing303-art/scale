"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ScheduleFiltersProps = {
  employees: string[];
  clients: string[];
  services: string[];
  roles: string[];
  filters: {
    type: string;
    employee: string;
    client: string;
    service: string;
    role: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      type: string;
      employee: string;
      client: string;
      service: string;
      role: string;
    }>
  >;
};

export default function ScheduleFilters({
  employees,
  clients,
  services,
  roles,
  filters,
  setFilters,
}: ScheduleFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
      {/* Type Filter */}
      <Select
        value={filters.type || "all"}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, type: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Shift">Shifts</SelectItem>
          <SelectItem value="Visit">Visits</SelectItem>
          <SelectItem value="Office">Office</SelectItem>
          <SelectItem value="Facility">Facility</SelectItem>
        </SelectContent>
      </Select>

      {/* Employee Filter */}
      <Select
        value={filters.employee || "all"}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, employee: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by employee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Employees</SelectItem>
          {employees.map((e) => (
            <SelectItem key={e || "unknown"} value={e || "unknown"}>
              {e || "Unassigned"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Client Filter */}
      <Select
        value={filters.client || "all"}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, client: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clients</SelectItem>
          {clients.map((c) => (
            <SelectItem key={c || "unknown"} value={c || "unknown"}>
              {c || "Unassigned"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Service Filter */}
      <Select
        value={filters.service || "all"}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, service: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          {services.map((s) => (
            <SelectItem key={s || "unknown"} value={s || "unknown"}>
              {s || "Unassigned"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Role Filter */}
      <Select
        value={filters.role || "all"}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, role: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
