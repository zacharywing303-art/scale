"use client";

import React, { useMemo } from "react";
import { Calendar, momentLocalizer, Views, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface ScheduleCalendarProps {
  date: Date;
  viewMode: "day" | "week" | "agenda";
  filters: {
    type: string;
    service: string;
    employee: string;
    client: string;
    role: string;
  };
  schedules: any[];
  onDateChange: (date: Date) => void;
  onViewChange: (view: "day" | "week" | "agenda") => void;
  colorBy?: "employee" | "service"; // 🔹 New prop
}

// 🔹 Utility: Assign consistent colors
const getColorMap = (() => {
  const colorMap = new Map<string, string>();
  const colors = [
    "#E57373",
    "#64B5F6",
    "#81C784",
    "#FFD54F",
    "#BA68C8",
    "#4DB6AC",
    "#A1887F",
    "#90A4AE",
    "#F06292",
    "#7986CB",
  ];
  let index = 0;
  return (key: string) => {
    if (!colorMap.has(key)) {
      colorMap.set(key, colors[index % colors.length]);
      index++;
    }
    return colorMap.get(key)!;
  };
})();

export default function ScheduleCalendar({
  date,
  viewMode,
  filters,
  schedules,
  onDateChange,
  onViewChange,
  colorBy = "employee", // default to employee
}: ScheduleCalendarProps) {
  // 🔹 Convert schedules -> events
  const events: Event[] = useMemo(() => {
    return schedules
      .filter((s) => {
        if (filters.type !== "all" && s.scheduleType !== filters.type)
          return false;
        if (filters.service !== "all") {
          if (!s.service && filters.service === "unknown") return true; // allow unassigned
          if (s.service?.name !== filters.service) return false;
        }
        if (filters.employee !== "all" && s.employee?.name !== filters.employee)
          return false;
        if (filters.client !== "all" && s.client?.name !== filters.client)
          return false;
        if (filters.role !== "all" && s.employee?.position !== filters.role)
          return false;
        return true;
      })
      .map((s) => ({
        id: s.id,
        title: `${s.service?.name || "Service"} - ${
          s.employee?.name || "Employee"
        } (${s.client?.name || "Client"})`,
        start: new Date(s.startTime),
        end: new Date(s.endTime),
        resource: s,
        employee: s.employee?.name,
        service: s.service?.name,
      }));
  }, [schedules, filters]);

  // 🔹 Event color (switchable)
  const eventStyleGetter = (event: any) => {
    const key =
      colorBy === "employee"
        ? event.employee || "unknown"
        : event.service || "unknown";
    const backgroundColor = getColorMap(key);
    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "4px",
        border: "none",
      },
    };
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        date={date}
        view={viewMode}
        onNavigate={onDateChange}
        onView={(view) => onViewChange(view as "day" | "week" | "agenda")}
        views={[Views.DAY, Views.WEEK, Views.AGENDA]}
        eventPropGetter={eventStyleGetter}
        style={{ height: "75vh" }}
      />
    </div>
  );
}
