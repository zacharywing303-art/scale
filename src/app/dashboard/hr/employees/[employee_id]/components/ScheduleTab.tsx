"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Availability = {
  weekday: number; // 0–6
  startTime: string; // "09:00"
  endTime: string; // "17:00"
};

type TimeOff = {
  id: string;
  startDate: string;
  endDate: string;
  type: string; // e.g., "PTO", "Sick", "Vacation"
};

type SchedulingConstraintsResponse = {
  availability: Availability[];
  timeOff: TimeOff[];
  canSchedule: boolean;
  hardBlocks: string[];
  softWarnings: string[];
};

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScheduleTab({ employee }: { employee: any }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SchedulingConstraintsResponse | null>(null);

  useEffect(() => {
    const fetchConstraints = async () => {
      try {
        const now = new Date();
        const from = new Date(now);
        const to = new Date(now);
        to.setMonth(to.getMonth() + 1);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${
            employee.id
          }/scheduling/constraints?from=${from.toISOString()}&to=${to.toISOString()}`
        );
        if (!res.ok) throw new Error("Failed to load constraints");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Error loading schedule summary", e);
      } finally {
        setLoading(false);
      }
    };

    fetchConstraints();
  }, [employee.id]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Availability & Time Off</h2>
        {data && (
          <Badge
            className={cn(data.canSchedule ? "bg-emerald-600" : "bg-rose-600")}
          >
            {data.canSchedule ? "Schedulable" : "Conflicts"}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading availability...
        </div>
      ) : !data ? (
        <div className="text-sm text-muted-foreground">
          No availability / time-off info found.
        </div>
      ) : (
        <>
          {/* Availability grid */}
          <div>
            <div className="text-xs font-medium mb-1 text-muted-foreground">
              Weekly Availability
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {weekdayNames.map((name, idx) => {
                const entries = data.availability.filter(
                  (a) => a.weekday === idx
                );
                return (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-md border px-1.5 py-1 min-h-[40px]",
                      entries.length ? "bg-emerald-50" : "bg-muted"
                    )}
                  >
                    <div className="font-semibold mb-0.5">{name}</div>
                    {entries.length ? (
                      entries.map((e, i) => (
                        <div key={i}>
                          {e.startTime}–{e.endTime}
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-muted-foreground">
                        No availability
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming time off */}
          <div>
            <div className="text-xs font-medium mb-1 text-muted-foreground">
              Upcoming Time Off (next 30 days)
            </div>
            {data.timeOff.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                No upcoming time off.
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                {data.timeOff.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-md border px-2 py-1 bg-amber-50"
                  >
                    <div>
                      <div className="font-medium">{t.type}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {format(new Date(t.startDate), "MM/dd/yyyy")} →{" "}
                        {format(new Date(t.endDate), "MM/dd/yyyy")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current warnings / blocks */}
          {(data.hardBlocks.length || data.softWarnings.length) && (
            <div className="space-y-1">
              {data.hardBlocks.length > 0 && (
                <div className="text-xs text-rose-600">
                  <div className="font-medium mb-0.5">Blocking Issues</div>
                  <ul className="list-disc ml-4">
                    {data.hardBlocks.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.softWarnings.length > 0 && (
                <div className="text-xs text-amber-600">
                  <div className="font-medium mb-0.5">Warnings</div>
                  <ul className="list-disc ml-4">
                    {data.softWarnings.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
// "use client";

// import React, { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Calendar } from "@/components/ui/calendar"; // Optional: if you use calendar pickers
// import SaveChangesButton from "./SaveChangesButton";

// const mockSchedules = [
//   {
//     id: 1,
//     client: "Jane Doe",
//     type: "Visit",
//     service: "IHCS Level 1",
//     scheduledIn: "9:00 AM",
//     scheduledOut: "11:00 AM",
//     date: "2025-07-01",
//   },
//   {
//     id: 2,
//     client: "",
//     type: "Office",
//     service: "Team Meeting",
//     scheduledIn: "1:00 PM",
//     scheduledOut: "2:00 PM",
//     date: "2025-07-05",
//   },
// ];

// export default function ScheduleTab({ employee }: { employee: any }) {
//   const [filters, setFilters] = useState({
//     from: "",
//     to: "",
//     client: "",
//   });

//   return (
//     <div className="space-y-4 p-4">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Input
//           type="date"
//           placeholder="From Date"
//           onChange={(e) => setFilters({ ...filters, from: e.target.value })}
//         />
//         <Input
//           type="date"
//           placeholder="To Date"
//           onChange={(e) => setFilters({ ...filters, to: e.target.value })}
//         />
//         <Input
//           placeholder="Client Name"
//           onChange={(e) => setFilters({ ...filters, client: e.target.value })}
//         />
//       </div>

//       <ScrollArea className="rounded border h-[300px]">
//         <table className="w-full text-sm">
//           <thead className="bg-muted">
//             <tr>
//               <th className="p-2 text-left">Client</th>
//               <th className="p-2 text-left">Type</th>
//               <th className="p-2 text-left">Service</th>
//               <th className="p-2 text-left">Date</th>
//               <th className="p-2 text-left">Scheduled In</th>
//               <th className="p-2 text-left">Scheduled Out</th>
//             </tr>
//           </thead>
//           <tbody>
//             {mockSchedules.map((s) => (
//               <tr key={s.id} className="border-t">
//                 <td className="p-2">{s.client}</td>
//                 <td className="p-2">{s.type}</td>
//                 <td className="p-2">{s.service}</td>
//                 <td className="p-2">{s.date}</td>
//                 <td className="p-2">{s.scheduledIn}</td>
//                 <td className="p-2">{s.scheduledOut}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </ScrollArea>
//       {/* Save Button */}
//       <SaveChangesButton />
//     </div>
//   );
// }
