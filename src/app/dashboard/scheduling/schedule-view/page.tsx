"use client";

import React, { useState } from "react";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import ScheduleFilters from "@/components/schedule/ScheduleFilters";

export default function ViewSchedulePage() {
  const [filters, setFilters] = useState({
    type: "home",
    service: "",
    employee: "",
    client: "",
    role: "",
  });
  const [viewMode, setViewMode] = useState<"day" | "week" | "agenda">("day");
  const [date, setDate] = useState(new Date());

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-unity-green">Schedule View</h1>

      <ScheduleFilters
        filters={filters}
        onChange={(updatedFilters) =>
          setFilters((prev) => ({ ...prev, ...updatedFilters }))
        }
      />

      <ScheduleCalendar
        date={date}
        viewMode={viewMode}
        filters={filters}
        onDateChange={setDate}
        onViewChange={setViewMode}
      />
    </div>
  );
}
