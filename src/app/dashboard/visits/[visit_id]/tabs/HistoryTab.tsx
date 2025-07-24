"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import Section from "@/components/custom/Section";

const historyLog = [
  {
    item: "Visit Status",
    reason: "Corrected by QA",
    date: "2024-11-15 10:45 AM",
    updatedBy: "John Smith",
  },
  {
    item: "Adjusted Out Time",
    reason: "Late clock-out",
    date: "2024-11-15 11:00 AM",
    updatedBy: "Jane Doe",
  },
  {
    item: "Service",
    reason: "Authorization updated",
    date: "2024-11-16 09:10 AM",
    updatedBy: "Supervisor Kelly",
  },
];

interface HistoryTabProps {
  visit: any;
}

export default function HistoryTab({ visit }: HistoryTabProps) {
  return (
    <div className="p-4 space-y-6">
      <Section title="Visit Change History">
        <div className="grid grid-cols-4 font-semibold text-sm border-b pb-2">
          <div>Item</div>
          <div>Reason Code</div>
          <div>Date</div>
          <div>Updated By</div>
        </div>

        {historyLog.map((entry, index) => (
          <div key={index} className="grid grid-cols-4 text-sm py-2 border-b">
            <div>{entry.item}</div>
            <div>{entry.reason}</div>
            <div>{entry.date}</div>
            <div>{entry.updatedBy}</div>
          </div>
        ))}
      </Section>
    </div>
  );
}
