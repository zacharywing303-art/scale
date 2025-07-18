"use client";

import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type HRAlert = {
  id: number;
  message: string;
  date: Date;
  link?: string; // optional route to navigate to
};

const sampleAlerts: HRAlert[] = [
  {
    id: 1,
    message: "Employee license expiring in 5 days",
    date: new Date(),
    link: "/dashboard/hr/employees",
  },
  {
    id: 2,
    message: "Incomplete onboarding documents",
    date: new Date(),
    link: "/dashboard/hr/onboarding",
  },
  {
    id: 3,
    message: "Background check pending for new hire",
    date: new Date(),
    link: "/dashboard/hr/background-checks",
  },
];

export default function HRAlertModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-card w-full max-w-xl rounded shadow-lg relative p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4">HR Alerts</h2>

        <div className="space-y-4">
          {sampleAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between p-3 border rounded bg-muted hover:bg-muted/60"
            >
              <div>
                <h3 className="font-medium">{alert.message}</h3>
                <p className="text-xs text-muted-foreground">
                  Date: {format(alert.date, "PPP")}
                </p>
              </div>
              {alert.link && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
