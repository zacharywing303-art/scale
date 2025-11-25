"use client";

import React, { useState, useEffect } from "react";
import HRAlertModal from "@/app/dashboard/home/hr-alerts/HRAlertModal";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

interface HRAlert {
  id: string;
  alertType: string;
  message: string;
  severity: "warning" | "info" | "error";
  link?: string | null;
}

export default function HRAlerts() {
  const [alerts, setAlerts] = useState<HRAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    async function load() {
      const user = await getLoggedInUser();
      if (!user?.agency?.id) return;

      const res = await fetch(`/api/hr-alerts/${user.agency.id}`);
      const data = await res.json();
      setAlerts(data);
    }
    load();
  }, []);

  const handleDismiss = async (alert: HRAlert) => {
    const user = await getLoggedInUser();
    await fetch(`/api/hr-alerts/${user?.agency?.id}/dismiss`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertType: alert.alertType }),
    });
    setAlerts((prev) => prev.filter((a) => a.alertType !== alert.alertType));
  };

  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">HR Alerts</h3>
        <button
          onClick={() => setShowAlerts(true)}
          className="text-sm text-secondary hover:underline"
        >
          View All
        </button>
      </div>

      <HRAlertModal isOpen={showAlerts} onClose={() => setShowAlerts(false)} />

      <ul className="space-y-2 text-sm font-medium">
        {alerts.length === 0 && (
          <li className="text-muted-foreground">No alerts 🎉</li>
        )}

        {alerts.slice(0, 3).map((alert) => (
          <li key={alert.id} className="flex justify-between items-center">
            <span
              className={
                alert.severity === "error"
                  ? "text-red-600"
                  : alert.severity === "warning"
                  ? "text-yellow-600"
                  : "text-blue-600"
              }
            >
              • {alert.message}
            </span>

            <button
              className="text-xs text-muted-foreground hover:underline ml-2"
              onClick={() => handleDismiss(alert)}
            >
              Dismiss
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
// "use client";

// import React, { useState } from "react";
// import HRAlertModal from "@/app/dashboard/home/hr-alerts/HRAlertModal";

// interface Alert {
//   id: string;
//   message: string;
//   type?: "warning" | "info" | "error"; // Optional for future styling
// }

// const sampleAlerts: Alert[] = [
//   {
//     id: "1",
//     message: "Vehicle insurance expired for John Doe",
//     type: "warning",
//   },
//   { id: "2", message: "Clearance due for renewal - Jane Smith", type: "info" },
//   { id: "3", message: "Employee PTO request pending approval", type: "info" },
// ];

// export default function HRAlerts() {
//   const [showAlerts, setAlerts] = useState(false);

//   const handleViewAll = () => {
//     setAlerts(true); // or your actual route
//   };
//   return (
//     <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg font-semibold text-primary">HR Alerts</h3>
//         <button
//           onClick={handleViewAll}
//           className="text-sm text-secondary hover:underline"
//         >
//           View All
//         </button>
//       </div>
//       <HRAlertModal isOpen={showAlerts} onClose={() => setAlerts(false)} />
//       <ul className="space-y-2 text-sm text-destructive font-medium">
//         {sampleAlerts.map((alert) => (
//           <li key={alert.id} className="leading-snug">
//             • {alert.message}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
