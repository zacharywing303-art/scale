"use client";

import React, { useState } from "react";
import HRAlertModal from "@/app/dashboard/home/hr-alerts/HRAlertModal";

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
  const [showAlerts, setAlerts] = useState(false);

  const handleViewAll = () => {
    setAlerts(true); // or your actual route
  };
  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">HR Alerts</h3>
        <button
          onClick={handleViewAll}
          className="text-sm text-secondary hover:underline"
        >
          View All
        </button>
      </div>
      <HRAlertModal isOpen={showAlerts} onClose={() => setAlerts(false)} />
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
