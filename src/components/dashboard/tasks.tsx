"use client";

import React from "react";
import { useRouter } from "next/navigation";

const tasks = [
  "Review Exceptions",
  "Complete Weekly Audit",
  "Submit Hours & Mileage to Payroll",
  "Schedule Quarterly Review",
  "Billing Report Verification",
];

export default function TaskList() {
  const router = useRouter();

  const handleViewAll = () => {
    router.push("/tasks"); // or your actual route
  };

  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">Task List</h3>
        <button
          onClick={handleViewAll}
          className="text-sm text-secondary hover:underline"
        >
          View All
        </button>
      </div>

      <ul className="space-y-2 text-sm">
        {tasks.slice(0, 4).map((task, i) => (
          <li key={i} className="flex items-start leading-tight">
            • {task}
          </li>
        ))}
      </ul>
    </div>
  );
}
