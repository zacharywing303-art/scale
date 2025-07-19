"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const services = ["All Services", "Nursing", "Therapy", "Daily Living"];
const employees = ["All Employees", "Alice", "Bob", "Carlos"];
const clients = ["All Clients", "John Doe", "Jane Smith"];
const roles = ["All Roles", "Supervisor", "Manager", "Nurse", "Caregiver"];

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
      <div>
        <Label htmlFor="type" className="mb-1 block">
          Type
        </Label>
        <Select
          value={filters.type}
          onValueChange={(value) => onChange({ ...filters, type: value })}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="home">Home Care</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filters.type === "home" && (
        <div>
          <Label htmlFor="service" className="mb-1 block">
            Service
          </Label>
          <Select
            value={filters.service || ""}
            onValueChange={(value) => onChange({ ...filters, service: value })}
          >
            <SelectTrigger id="service">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="employee" className="mb-1 block">
          Employee
        </Label>
        <Select
          value={filters.employee || ""}
          onValueChange={(value) => onChange({ ...filters, employee: value })}
        >
          <SelectTrigger id="employee">
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="client" className="mb-1 block">
          Client
        </Label>
        <Select
          value={filters.client || ""}
          onValueChange={(value) => onChange({ ...filters, client: value })}
        >
          <SelectTrigger id="client">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="role" className="mb-1 block">
          Role
        </Label>
        <Select
          value={filters.role || ""}
          onValueChange={(value) => onChange({ ...filters, role: value })}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
