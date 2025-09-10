"use client";

import React, { useState, useEffect } from "react";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import ScheduleFilters from "@/components/schedule/ScheduleFilters";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ViewSchedulePage() {
  const [filters, setFilters] = useState({
    type: "all",
    service: "all",
    employee: "all",
    client: "all",
    role: "all",
  });
  const [viewMode, setViewMode] = useState<"day" | "week" | "agenda">("day");
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
  }, []);

  const [schedules, setSchedules] = useState<any[]>([]);

  const fetchSchedules = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedules`
      );
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["AGENCY_USER", "AGENCY_ADMIN"]}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-unity-green">
          Schedule View
        </h1>

        <ScheduleFilters
          filters={filters}
          setFilters={setFilters}
          employees={[
            ...new Set(schedules.map((s) => s.employee?.name).filter(Boolean)),
          ]}
          clients={[
            ...new Set(schedules.map((s) => s.client?.name).filter(Boolean)),
          ]}
          services={[
            ...new Set(schedules.map((s) => s.service?.name).filter(Boolean)),
          ]}
          roles={[
            ...new Set(
              schedules.map((s) => s.employee?.position).filter(Boolean)
            ),
          ]}
        />

        <ScheduleCalendar
          date={date ?? new Date()}
          viewMode={viewMode}
          filters={filters}
          schedules={schedules}
          onDateChange={setDate}
          onViewChange={setViewMode}
          colorBy="employee"
        />
      </div>
    </ProtectedRoute>
  );
}
