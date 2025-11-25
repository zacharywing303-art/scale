"use client";

import { useEffect, useState } from "react";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

export default function HRAlertsPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function load() {
      const user = await getLoggedInUser();
      const res = await fetch(`/api/hr-alerts/${user?.agency?.id}`);
      setAlerts(await res.json());
    }
    load();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">HR Alerts</h1>

      <div className="space-y-4">
        {alerts.map((a) => (
          <div
            key={a.alertType}
            className="p-4 border rounded bg-white shadow-md"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{a.message}</p>
                {a.link && (
                  <a href={a.link} className="text-blue-600 underline text-sm">
                    View Details
                  </a>
                )}
              </div>
              <button
                className="text-sm text-gray-600 hover:text-red-600"
                onClick={async () => {
                  const user = await getLoggedInUser();
                  await fetch(`/api/hr-alerts/${user?.agency?.id}/dismiss`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ alertType: a.alertType }),
                  });
                  setAlerts((prev) =>
                    prev.filter((x) => x.alertType !== a.alertType)
                  );
                }}
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
