"use client";

import React, { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";

const mockSchedules = [
  {
    id: 1,
    employee: "Jane Doe",
    type: "Visit",
    client: "John Smith",
    service: "IHCS Level 1",
    scheduledIn: "9:00 AM",
    scheduledOut: "11:00 AM",
    dateFrom: "2025-06-29",
    dateTo: "2025-07-01",
    recurring: true,
  },
  {
    id: 2,
    employee: "Mark Johnson",
    type: "Office",
    client: null,
    service: "Team Meeting",
    scheduledIn: "1:00 PM",
    scheduledOut: "2:00 PM",
    dateFrom: "2025-06-29",
    dateTo: "2025-06-29",
    recurring: false,
  },
];

export default function EditSchedulePage() {
  const [filters, setFilters] = useState({
    type: "",
    service: "",
    employee: "",
    client: "",
    job: "",
    date: new Date(),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Schedule</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select onValueChange={(val) => setFilters({ ...filters, type: val })}>
          <SelectTrigger>
            <SelectValue placeholder="Type (Visit / Office)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Visit">Home Care Visit</SelectItem>
            <SelectItem value="Office">Office</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Service / Reason"
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
        />

        <Input
          placeholder="Employee"
          onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
        />

        <Input
          placeholder="Client"
          onChange={(e) => setFilters({ ...filters, client: e.target.value })}
        />

        <Input
          placeholder="Job Role (e.g., caregiver, nurse)"
          onChange={(e) => setFilters({ ...filters, job: e.target.value })}
        />

        <Calendar
          mode="single"
          selected={filters.date}
          onSelect={(date) =>
            setFilters({ ...filters, date: date ?? filters.date })
          }
        />
      </div>

      {/* Schedule Table */}
      <ScrollArea className="rounded border">
        <table className="min-w-full table-auto text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 font-medium text-gray-600">Employee</th>
              <th className="p-3 font-medium text-gray-600">Type</th>
              <th className="p-3 font-medium text-gray-600">Client</th>
              <th className="p-3 font-medium text-gray-600">Service/Reason</th>
              <th className="p-3 font-medium text-gray-600">Scheduled In</th>
              <th className="p-3 font-medium text-gray-600">Scheduled Out</th>
              <th className="p-3 font-medium text-gray-600">Date From</th>
              <th className="p-3 font-medium text-gray-600">Date To</th>
              <th className="p-3 font-medium text-gray-600">Recurring</th>
              <th className="p-3 font-medium text-gray-600 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {mockSchedules.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.employee}</td>
                <td className="p-3">{s.type}</td>
                <td className="p-3">{s.client ?? "N/A"}</td>
                <td className="p-3">{s.service}</td>
                <td className="p-3">{s.scheduledIn}</td>
                <td className="p-3">{s.scheduledOut}</td>
                <td className="p-3">{s.dateFrom}</td>
                <td className="p-3">{s.dateTo}</td>
                <td className="p-3">{s.recurring ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline">
                    Edit Schedule
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
