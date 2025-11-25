"use client";

import { useEffect, useState } from "react";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

interface HRAlert {
  id: string;
  alertType: string;
  message: string;
  severity: "warning" | "error" | "info";
  link?: string | null;
}

export default function HRAlertsPage() {
  const [alerts, setAlerts] = useState<HRAlert[]>([]);

  useEffect(() => {
    async function load() {
      const user = await getLoggedInUser();
      if (!user?.agency?.id) return;

      const res = await fetch(`/api/hr-alerts/${user.agency.id}`);
      setAlerts(await res.json());
    }
    load();
  }, []);

  const dismissAlert = async (alert: HRAlert) => {
    const user = await getLoggedInUser();
    await fetch(`/api/hr-alerts/${user?.agency?.id}/dismiss`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertType: alert.alertType }),
    });
    setAlerts((prev) => prev.filter((a) => a.alertType !== alert.alertType));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">HR Alerts</h1>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.alertType}
            className="p-4 border rounded bg-white shadow-md"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{alert.message}</p>
                {alert.link && (
                  <a
                    href={alert.link}
                    className="text-blue-600 underline text-sm"
                  >
                    View Details
                  </a>
                )}
              </div>

              <button
                className="text-sm text-gray-600 hover:text-red-600"
                onClick={() => dismissAlert(alert)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
