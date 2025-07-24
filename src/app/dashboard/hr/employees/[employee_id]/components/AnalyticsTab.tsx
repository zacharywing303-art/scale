"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import SaveChangesButton from "./SaveChangesButton";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF6347",
  "#6A5ACD",
];

const kpiData = {
  hoursWorked: 162,
  totalVisits: 42,
  manualVisits: 27,
  phoneVisits: 73,
  exceptions: 3,
};

const clientTimeData = [
  { name: "Client A", value: 40 },
  { name: "Client B", value: 30 },
  { name: "Client C", value: 20 },
];

const serviceTimeData = [
  { name: "Service A", value: 50 },
  { name: "Service B", value: 30 },
  { name: "Service C", value: 20 },
];

const workSplitData = [
  { name: "Office", value: 60 },
  { name: "Visits", value: 40 },
];

export default function AnalyticsTab() {
  const [filter, setFilter] = useState("monthly");

  // Placeholder data — replace with real data logic
  const summaryData = {
    hoursWorked: 162,
    visits: 42,
    manualPercentage: 27,
    phonePercentage: 73,
    exceptions: 3,
  };

  return (
    <div className="p-4 space-y-6">
      {/* Assigned Clients */}
      <div>
        <Label className="mb-1">Assigned Clients</Label>
        <ScrollArea className="border rounded p-2 h-24">
          <div>Client A</div>
          <div>Client B</div>
          <div>Client C</div>
        </ScrollArea>
      </div>

      {/* Time with Company */}
      <div>
        <Label className="mb-1">Time with Company</Label>
        <Input value="2 years 4 months" disabled />
      </div>
      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>View Range</Label>
        <Select onValueChange={setFilter} defaultValue="monthly">
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label>Hours Worked</Label>
          <p className="text-xl font-bold">{kpiData.hoursWorked}</p>
        </div>
        <div>
          <Label>Total Visits</Label>
          <p className="text-xl font-bold">{kpiData.totalVisits}</p>
        </div>
        <div>
          <Label>Manual Visits</Label>
          <p className="text-xl font-bold">
            {kpiData.manualVisits} (
            {Math.round((kpiData.manualVisits / kpiData.totalVisits) * 100)}
            %)
          </p>
        </div>
        <div>
          <Label>Phone Visits</Label>
          <p className="text-xl font-bold">
            {kpiData.phoneVisits} (
            {Math.round((kpiData.phoneVisits / kpiData.totalVisits) * 100)}
            %)
          </p>
        </div>
        <div>
          <Label>Exceptions</Label>
          <p className="text-xl font-bold text-red-500">{kpiData.exceptions}</p>
        </div>
      </div>
      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time by Client */}
        <div className="w-full h-72">
          <Label className="mb-2 block">Time by Client</Label>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={clientTimeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {clientTimeData.map((entry, index) => (
                  <Cell
                    key={`client-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Time by Service */}
        <div className="w-full h-72">
          <Label className="mb-2 block">Time by Service</Label>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={serviceTimeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {serviceTimeData.map((entry, index) => (
                  <Cell
                    key={`service-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Office vs Visit Time */}
        <div className="w-full h-72">
          <Label className="mb-2 block">Visit vs Office Time</Label>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={workSplitData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {workSplitData.map((entry, index) => (
                  <Cell
                    key={`work-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Save Changes Button (optional) */}
      <SaveChangesButton />
    </div>
  );
}
