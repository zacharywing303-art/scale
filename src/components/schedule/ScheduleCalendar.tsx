"use client";
import React from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

// Mock schedule entries
const mockEvents = [
  {
    title: "Office Meeting",
    start: new Date(),
    end: new Date(moment().add(1, "hours").toDate()),
    type: "office",
    service: "",
    employee: "Alice",
  },
  {
    title: "Home Visit - John Doe",
    start: new Date(moment().add(2, "hours").toDate()),
    end: new Date(moment().add(3, "hours").toDate()),
    type: "home",
    service: "Nursing",
    employee: "Bob",
  },
];

// Color mapping
const serviceColors: Record<string, string> = {
  Nursing: "#34C759",
  Therapy: "#FF9500",
  "Daily Living": "#AF52DE",
};
const officeColor = "#007AFF";

type ScheduleCalendarProps = {
  date: Date;
  viewMode: View;
  filters: {
    type?: string;
    service?: string;
    employee?: string;
    client?: string;
  };
};

export default function ScheduleCalendar({
  date,
  viewMode,
  filters,
}: ScheduleCalendarProps) {
  const filtered = mockEvents.filter((ev) => {
    if (filters.type && ev.type !== filters.type) return false;
    if (filters.service && ev.service !== filters.service) return false;
    if (filters.employee && ev.employee !== filters.employee) return false;
    if (filters.client && !ev.title.includes(filters.client)) return false;
    return true;
  });

  const eventStyleGetter = (event: (typeof mockEvents)[number]) => {
    const bgColor =
      event.type === "office"
        ? officeColor
        : serviceColors[event.service] || "#ccc";
    return {
      style: { backgroundColor: bgColor, borderColor: "#000", color: "#fff" },
    };
  };

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={filtered}
        defaultDate={date}
        date={date}
        views={["day", "week"]}
        view={viewMode as View}
        onView={() => {}}
        onNavigate={() => {}}
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
}
