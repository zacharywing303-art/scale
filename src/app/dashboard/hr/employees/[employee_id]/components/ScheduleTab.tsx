"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar"; // Optional: if you use calendar pickers
import SaveChangesButton from "./SaveChangesButton";

const mockSchedules = [
  {
    id: 1,
    client: "Jane Doe",
    type: "Visit",
    service: "IHCS Level 1",
    scheduledIn: "9:00 AM",
    scheduledOut: "11:00 AM",
    date: "2025-07-01",
  },
  {
    id: 2,
    client: "",
    type: "Office",
    service: "Team Meeting",
    scheduledIn: "1:00 PM",
    scheduledOut: "2:00 PM",
    date: "2025-07-05",
  },
];

export default function ScheduleTab({ employee }: { employee: any }) {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    client: "",
  });

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="date"
          placeholder="From Date"
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <Input
          type="date"
          placeholder="To Date"
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
        <Input
          placeholder="Client Name"
          onChange={(e) => setFilters({ ...filters, client: e.target.value })}
        />
      </div>

      <ScrollArea className="rounded border h-[300px]">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Client</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Service</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Scheduled In</th>
              <th className="p-2 text-left">Scheduled Out</th>
            </tr>
          </thead>
          <tbody>
            {mockSchedules.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.client}</td>
                <td className="p-2">{s.type}</td>
                <td className="p-2">{s.service}</td>
                <td className="p-2">{s.date}</td>
                <td className="p-2">{s.scheduledIn}</td>
                <td className="p-2">{s.scheduledOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      {/* Save Button */}
      <SaveChangesButton />
    </div>
  );
}
