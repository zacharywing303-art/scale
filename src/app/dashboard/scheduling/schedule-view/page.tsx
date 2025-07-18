"use client";

import React, { useState } from "react";
import ScheduleFilters from "@/components/schedule/ScheduleFilters";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ViewSchedulePage() {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [date, setDate] = useState(new Date());
  const [filters, setFilters] = useState<{
    type: string;
    service?: string;
    employee?: string;
    client?: string;
    role?: string;
  }>({
    type: "office", // or 'home'
    service: "",
    employee: "",
    client: "",
    role: "",
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between space-x-4">
        <DatePicker selected={date} onChange={(d) => setDate(d!)} />
        <div className="btn-group">
          <button
            className={`px-4 py-2 rounded-l ${
              viewMode === "day" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("day")}
          >
            Daily
          </button>
          <button
            className={`px-4 py-2 rounded-r ${
              viewMode === "week" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("week")}
          >
            Weekly
          </button>
        </div>
      </div>

      <ScheduleFilters filters={filters} onChange={setFilters} />
      <ScheduleCalendar date={date} viewMode={viewMode} filters={filters} />
    </div>
  );
}
