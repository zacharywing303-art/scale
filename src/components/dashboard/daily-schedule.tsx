"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

interface ScheduleItem {
  id: string;
  scheduleType: "Office" | "Visit";
  title: string;
  time: string;
  employeeName: string;
  clientName?: string;
  detail: string;
}
export default function DailySchedule() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const fetchSchedules = async (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const user = await getLoggedInUser();
    const agencyId = user?.agency?.code; // Replace with actual agency ID logic
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/daily-schedules?agencyID=${agencyId}&date=${dateStr}`
    );
    const data = await res.json();
    setSchedules(data);
  };

  useEffect(() => {
    fetchSchedules(currentDate);
  }, [currentDate]);

  const changeDate = (days: number) => {
    setCurrentDate((prev) => new Date(prev.getTime() + days * 86400000));
  };

  const officeSchedules = schedules.filter((s) => s.scheduleType === "Office");
  const visitSchedules = schedules.filter((s) => s.scheduleType === "Visit");

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

      {schedules.length > 0 ? (
        <div className="space-y-4 text-sm">
          {/* Office Schedules */}
          {officeSchedules.length > 0 && (
            <div>
              <h4 className="font-semibold text-muted-foreground mb-2">
                Office
              </h4>
              <ul className="space-y-1">
                {officeSchedules.map((item) => (
                  <li key={item.id}>
                    <span className="font-medium">{item.time}:</span>{" "}
                    {item.employeeName} ({item.detail})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Visit Schedules */}
          {visitSchedules.length > 0 && (
            <div>
              <h4 className="font-semibold text-muted-foreground mb-2">
                Visits
              </h4>
              <ul className="space-y-1">
                {visitSchedules.map((item) => (
                  <li key={item.id}>
                    <span className="font-medium">{item.time}:</span>{" "}
                    {item.employeeName} Visit w/ {item.clientName} (
                    {item.detail})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No schedules for this day
        </p>
      )}

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

  // return (
  //   <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md">
  //     <div className="flex justify-between items-center mb-4">
  //       <button
  //         onClick={() => changeDate(-1)}
  //         className="text-sm text-secondary hover:underline"
  //       >
  //         ← Previous
  //       </button>
  //       <h3 className="text-lg font-semibold text-primary">
  //         {currentDate.toLocaleDateString(undefined, {
  //           weekday: "long",
  //           month: "short",
  //           day: "numeric",
  //           year: "numeric",
  //         })}
  //       </h3>
  //       <button
  //         onClick={() => changeDate(1)}
  //         className="text-sm text-secondary hover:underline"
  //       >
  //         Next →
  //       </button>
  //     </div>

  //     {schedules.length > 0 ? (
  //       <ul className="space-y-1 text-sm">
  //         {schedules.map((item) => (
  //           <li key={item.id}>
  //             <span className="font-medium">{item.time}:</span> {item.title} (
  //             {item.detail})
  //           </li>
  //         ))}
  //       </ul>
  //     ) : (
  //       <p className="text-muted-foreground text-sm">
  //         No schedules for this day
  //       </p>
  //     )}

  //     <div className="flex items-center p-4">
  //       <button
  //         onClick={() => router.push("/dashboard/scheduling/schedule-view")}
  //         className="flex items-center text-sm text-muted-foreground hover:text-primary"
  //       >
  //         View Full Schedule
  //       </button>
  //     </div>
  //   </div>
  // );
}
