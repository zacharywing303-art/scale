"use client";

import React from "react";

interface Alert {
  id: string;
  message: string;
  type?: "warning" | "info" | "error"; // Optional for future styling
}

const sampleAlerts: Alert[] = [
  {
    id: "1",
    message: "Vehicle insurance expired for John Doe",
    type: "warning",
  },
  { id: "2", message: "Clearance due for renewal - Jane Smith", type: "info" },
  { id: "3", message: "Employee PTO request pending approval", type: "info" },
];

export default function HRAlerts() {
  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold text-primary mb-4">HR Alerts</h3>
      <ul className="space-y-2 text-sm text-destructive font-medium">
        {sampleAlerts.map((alert) => (
          <li key={alert.id} className="leading-snug">
            • {alert.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
