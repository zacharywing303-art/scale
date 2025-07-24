"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Section from "@/components/custom/Section";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockExceptions = [
  {
    type: "Late Clock In",
    reasonCode: "LC01",
    description: "Clock-in was 15 minutes late",
    date: "2025-07-20",
    addedBy: "Jane Doe",
  },
  {
    type: "Manual Visit",
    reasonCode: "MV02",
    description: "Visit was entered manually by admin",
    date: "2025-07-20",
    addedBy: "John Smith",
  },
];

interface ExceptionsTabProps {
  visit: any;
}

export default function ExceptionsTab({ visit }: ExceptionsTabProps) {
  return (
    <div className="p-4 space-y-4">
      <Section
        title="Visit Exceptions"
        actionSlot={<Button variant="outline">Add Reason Code</Button>}
      >
        <ScrollArea className="max-h-96 border rounded p-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-left py-2 px-2">Reason Code</th>
                <th className="text-left py-2 px-2">Description</th>
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-left py-2 px-2">Added By</th>
              </tr>
            </thead>
            <tbody>
              {mockExceptions.map((exception, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-2">{exception.type}</td>
                  <td className="py-2 px-2">{exception.reasonCode}</td>
                  <td className="py-2 px-2">{exception.description}</td>
                  <td className="py-2 px-2">{exception.date}</td>
                  <td className="py-2 px-2">{exception.addedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </Section>
    </div>
  );
}
