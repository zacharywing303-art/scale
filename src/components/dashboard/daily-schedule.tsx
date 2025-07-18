"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  location?: string;
}

const fakeOfficeSchedule: ScheduleItem[] = [
  { id: "1", title: "Staff Huddle", time: "9:00 AM" },
  { id: "2", title: "QA Meeting", time: "1:30 PM" },
];

const fakeVisits: ScheduleItem[] = [
  {
    id: "v1",
    title: "Visit - John Doe",
    time: "10:00 AM",
    location: "123 Main St",
  },
  {
    id: "v2",
    title: "Visit - Sarah Lin",
    time: "2:00 PM",
    location: "456 Elm Ave",
  },
];

export default function DailySchedule() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeDate = (days: number) => {
    setCurrentDate((prev) => new Date(prev.getTime() + days * 86400000));
  };

  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeDate(-1)}
          className="text-sm text-secondary hover:underline"
        >
          ← Previous
        </button>
        <h3 className="text-lg font-semibold text-primary">
          {currentDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </h3>
        <button
          onClick={() => changeDate(1)}
          className="text-sm text-secondary hover:underline"
        >
          Next →
        </button>
      </div>

      <div>
        <h4 className="font-semibold text-muted-foreground mb-2">
          Office Schedule
        </h4>
        <ul className="mb-4 space-y-1 text-sm">
          {fakeOfficeSchedule.map((item) => (
            <li key={item.id}>
              <span className="font-medium">{item.time}:</span> {item.title}
            </li>
          ))}
        </ul>

        <h4 className="font-semibold text-muted-foreground mb-2">
          Scheduled Visits
        </h4>
        <ul className="space-y-1 text-sm">
          {fakeVisits.map((visit) => (
            <li key={visit.id}>
              <span className="font-medium">{visit.time}:</span> {visit.title} (
              {visit.location})
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center p-4">
        <button
          onClick={() => router.push("/dashboard/scheduling/schedule-view")}
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          View Full Schedule
        </button>
      </div>
    </div>
  );
}
