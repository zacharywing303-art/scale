"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import Section from "@/components/custom/Section";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockCallLog = [
  {
    type: "Mobile",
    date: "2025-07-20",
    time: "08:00 AM",
    service: "Bathing",
    user: "Jane Doe",
    latitude: "40.7128",
    longitude: "-74.0060",
    source: "MyAgency App",
    timezone: "EST",
    location: "Home",
  },
  {
    type: "Manual",
    date: "2025-07-20",
    time: "12:00 PM",
    service: "Feeding",
    user: "John Smith",
    latitude: "",
    longitude: "",
    source: "Admin Entry",
    timezone: "EST",
    location: "Community",
  },
];

interface CallLogTabProps {
  visit: any;
}

export default function CallLogTab({ visit }: CallLogTabProps) {
  return (
    <div className="p-4 space-y-4">
      <Section title="Call In / Out Log">
        <ScrollArea className="max-h-96 border rounded p-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-left py-2 px-2">Time</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-left py-2 px-2">Service</th>
                <th className="text-left py-2 px-2">User</th>
                <th className="text-left py-2 px-2">Source</th>
                <th className="text-left py-2 px-2">Time Zone</th>
                <th className="text-left py-2 px-2">Location</th>
                <th className="text-left py-2 px-2">Lat / Lng</th>
              </tr>
            </thead>
            <tbody>
              {mockCallLog.map((log, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-2">{log.date}</td>
                  <td className="py-2 px-2">{log.time}</td>
                  <td className="py-2 px-2">{log.type}</td>
                  <td className="py-2 px-2">{log.service}</td>
                  <td className="py-2 px-2">{log.user}</td>
                  <td className="py-2 px-2">{log.source}</td>
                  <td className="py-2 px-2">{log.timezone}</td>
                  <td className="py-2 px-2">{log.location}</td>
                  <td className="py-2 px-2">
                    {log.latitude && log.longitude
                      ? `${log.latitude}, ${log.longitude}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </Section>
    </div>
  );
}
