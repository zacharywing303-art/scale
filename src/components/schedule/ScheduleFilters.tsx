"use client";
import React from "react";

const services = ["Nursing", "Therapy", "Daily Living"];
const employees = ["Alice", "Bob", "Carlos"];
const clients = ["John Doe", "Jane Smith"];
const roles = ["Supervisor", "Manager", "Nurse", "Caregiver"];

type ScheduleFiltersProps = {
  filters: {
    type: string;
    service?: string;
    employee?: string;
    client?: string;
    role?: string;
  };
  onChange: (filters: {
    type: string;
    service?: string;
    employee?: string;
    client?: string;
    role?: string;
  }) => void;
};

export default function ScheduleFilters({
  filters,
  onChange,
}: ScheduleFiltersProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      <select
        className="border rounded p-2"
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
      >
        <option value="office">Office</option>
        <option value="home">Home Care</option>
      </select>

      {filters.type === "home" && (
        <select
          className="border rounded p-2"
          value={filters.service}
          onChange={(e) => onChange({ ...filters, service: e.target.value })}
        >
          <option value="">All Services</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      <select
        className="border rounded p-2"
        value={filters.employee}
        onChange={(e) => onChange({ ...filters, employee: e.target.value })}
      >
        <option value="">All Employees</option>
        {employees.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>

      <select
        className="border rounded p-2"
        value={filters.client}
        onChange={(e) => onChange({ ...filters, client: e.target.value })}
      >
        <option value="">All Clients</option>
        {clients.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className="border rounded p-2"
        value={filters.role}
        onChange={(e) => onChange({ ...filters, role: e.target.value })}
      >
        <option value="">All Roles</option>
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}
