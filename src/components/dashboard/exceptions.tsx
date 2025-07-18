"use client";

import React from "react";
import { useRouter } from "next/navigation";

const exceptions = {
  "Unknown Client": 3,
  "Unknown Employee": 2,
  "Missing Service": 4,
  "Missing Call In": 5,
  "Missing Call Out": 4,
  "No Call At All": 1,
  "No Show": 2,
  "Unknown ID/Phone": 3,
};

const totalExceptions = Object.values(exceptions).reduce((a, b) => a + b, 0);

const exceptionColors: Record<string, string> = {
  "Unknown Client": "#FF6384",
  "Unknown Employee": "#36A2EB",
  "Missing Service": "#FFCE56",
  "Missing Call In": "#4BC0C0",
  "Missing Call Out": "#9966FF",
  "No Call At All": "#FF9F40",
  "No Show": "#00C49F",
  "Unknown ID/Phone": "#FF6F91",
};

export default function ExceptionsSummary() {
  const router = useRouter();

  // Create ring slices for the conic-gradient
  const slices = Object.entries(exceptions).reduce(
    (acc, [type, count], index, arr) => {
      const start = acc.length ? acc[acc.length - 1].end : 0;
      const percent = (count / totalExceptions) * 100;
      acc.push({
        color: exceptionColors[type],
        start,
        end: start + percent,
      });
      return acc;
    },
    [] as { color: string; start: number; end: number }[]
  );

  const gradient = slices
    .map(({ color, start, end }) => `${color} ${start}% ${end}%`)
    .join(", ");

  return (
    <div
      onClick={() => router.push("/dashboard/visits?exceptionOnly=true")}
      className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow"
    >
      <h3 className="text-lg font-semibold text-primary mb-4">
        Visit Exceptions
      </h3>

      <div
        className="relative w-40 h-40 rounded-full flex items-center justify-center mb-6"
        style={{
          background: `conic-gradient(${gradient})`,
          borderRadius: "50%",
        }}
      >
        <div className="w-28 h-28 rounded-full bg-white dark:bg-card flex flex-col items-center justify-center shadow-inner text-primary text-xl font-bold">
          <span>{totalExceptions}</span>
          <div className="text-sm font-medium text-muted-foreground">Total</div>
        </div>
      </div>

      <ul className="text-sm space-y-2 w-full">
        {Object.entries(exceptions).map(([type, count]) => (
          <li key={type} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: exceptionColors[type] }}
              ></span>
              <span>{type}</span>
            </div>
            <span className="font-medium">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
