"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RequestActionButtons from "./RequestActionButtons";

const mockClockRequests = [
  {
    id: 1,
    employee: "Sarah Johnson",
    service: "Personal Care",
    oldTime: "8:05 AM",
    newTime: "8:00 AM",
  },
  {
    id: 2,
    employee: "James Park",
    service: "Homemaking",
    oldTime: "4:55 PM",
    newTime: "5:00 PM",
  },
];

export default function ClockAdjustRequests() {
  const [requests, setRequests] = useState(mockClockRequests);

  const handleInputChange = (id: number, field: string, value: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        Clock In/Out Adjustment Requests
      </h3>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="p-2">Employee</th>
            <th className="p-2">Service</th>
            <th className="p-2">Old Time</th>
            <th className="p-2">New Time</th>
            <th className="p-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b last:border-0">
              <td className="p-2">
                <Input
                  value={req.employee}
                  onChange={(e) =>
                    handleInputChange(req.id, "employee", e.target.value)
                  }
                />
              </td>
              <td className="p-2">
                <Input
                  value={req.service}
                  onChange={(e) =>
                    handleInputChange(req.id, "service", e.target.value)
                  }
                />
              </td>
              <td className="p-2">{req.oldTime}</td>
              <td className="p-2">{req.newTime}</td>
              <td className="p-2 text-right">
                <RequestActionButtons
                  onApprove={() =>
                    alert(`Approved clock adjustment for ${req.employee}`)
                  }
                  onDecline={() =>
                    alert(`Declined clock adjustment for ${req.employee}`)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
