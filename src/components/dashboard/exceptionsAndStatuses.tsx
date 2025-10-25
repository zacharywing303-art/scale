"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// 🎨 Color map for human-readable labels
const exceptionColors: Record<string, string> = {
  "Unknown Client": "#FF6384",
  "Unknown Employee": "#36A2EB",
  "Missing Service": "#FFCE56",
  "Missing Call In": "#4BC0C0",
  "Missing Call Out": "#9966FF",
  "No Call At All": "#FF9F40",
  "No Show": "#00C49F",
  "Missing Location": "#FFB347",
  "Missing Payer": "#FF7F7F",
  "Short Visit": "#FFD700",
};

// 🔠 Map raw exception keys → human-readable labels
const exceptionKeyLabels: Record<string, string> = {
  unknownClientException: "Unknown Client",
  unknownEmployeeException: "Unknown Employee",
  visitWithoutInCallException: "Missing Call In",
  visitWithoutOutCallException: "Missing Call Out",
  visitWithoutAnyCallException: "No Call At All",
  missingServiceException: "Missing Service",
  missingLocationException: "Missing Location",
  missingPayerException: "Missing Payer",
  shortVisitException: "Short Visit",
  noShowException: "No Show",
};

// 🎨 Colors for each status
const statusColors: Record<string, string> = {
  Incomplete: "#FF6384",
  "In Process": "#36A2EB",
  Verified: "#4BC0C0",
  Scheduled: "#9966FF",
  Processed: "#FF9F40",
  Omitted: "#00C49F",
};

// 🏷️ Normalize backend → display labels
const statusKeyLabels: Record<string, string> = {
  Incomplete: "Incomplete",
  InProcess: "In Process", // backend version
  "In Process": "In Process", // normalized
  Verified: "Verified",
  Scheduled: "Scheduled",
  Processed: "Processed",
  Omitted: "Omitted",
};

type DataRecord = Record<string, number>;

export default function SummaryCard() {
  const router = useRouter();

  const [activeView, setActiveView] = useState<"exceptions" | "statuses">(
    "exceptions"
  );
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState<Date | null>(null);

  const [exceptionsData, setExceptionsData] = useState<DataRecord>({});
  const [statusesData, setStatusesData] = useState<DataRecord>({});
  const [loading, setLoading] = useState(false);

  // 🕒 Normalize start/end dates
  const getDateRange = () => {
    const today = new Date();
    let start: Date | undefined;
    let end: Date | undefined;

    switch (dateFilter) {
      case "today":
        start = new Date(today);
        end = new Date(today);
        break;
      case "yesterday":
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = new Date(start);
        break;
      case "last7":
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        end = new Date(today);
        break;
      case "custom":
        if (customDate) {
          start = new Date(customDate);
          end = new Date(customDate);
        }
        break;
    }

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  // 🧮 Fetch summary from backend
  useEffect(() => {
    const fetchSummary = async () => {
      const { start, end } = getDateRange();

      if (dateFilter === "custom" && !customDate) return;

      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (start) params.append("startDate", start.toISOString());
        if (end) params.append("endDate", end.toISOString());

        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/api/dashboard/summary?${params.toString()}`
        );
        const data = await res.json();

        // 🧭 Transform exception keys to friendly labels
        const exceptionRecords =
          data?.exceptions?.types?.reduce((acc: DataRecord, t: any) => {
            const label = exceptionKeyLabels[t.type] || t.type;
            acc[label] = t.count;
            return acc;
          }, {} as DataRecord) || {};

        setExceptionsData(exceptionRecords);

        // 🧭 Transform status keys to friendly labels
        const statusRecords =
          data?.statuses?.types?.reduce((acc: DataRecord, t: any) => {
            const label = statusKeyLabels[t.type] || t.type;
            acc[label] = t.count;
            return acc;
          }, {} as DataRecord) || {};

        // ✅ Keep statuses unchanged
        setStatusesData(
          (data?.statuses?.statuses || []).reduce((acc: DataRecord, s: any) => {
            const rawKey = s.status?.trim();
            const label = statusKeyLabels[rawKey] || rawKey || "Unknown";
            acc[label] = s.count;
            return acc;
          }, {} as DataRecord)
        );
      } catch (err) {
        console.error("Failed to fetch dashboard summary", err);
        setExceptionsData({});
        setStatusesData({});
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [dateFilter, customDate]);

  // 🎨 Pick current dataset
  const data = activeView === "exceptions" ? exceptionsData : statusesData;
  const colors = activeView === "exceptions" ? exceptionColors : statusColors;

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  // 🟣 Build chart gradient
  const slices = Object.entries(data).reduce((acc, [type, count]) => {
    const start = acc.length ? acc[acc.length - 1].end : 0;
    const percent = total > 0 ? (count / total) * 100 : 0;
    acc.push({ color: colors[type] || "#ccc", start, end: start + percent });
    return acc;
  }, [] as { color: string; start: number; end: number }[]);

  const gradient = slices
    .map(({ color, start, end }) => `${color} ${start}% ${end}%`)
    .join(", ");

  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md flex flex-col items-center">
      {/* Tabs */}
      <div className="flex justify-between w-full mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView("exceptions")}
            className={`px-3 py-1 rounded ${
              activeView === "exceptions"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Exceptions
          </button>
          <button
            onClick={() => setActiveView("statuses")}
            className={`px-3 py-1 rounded ${
              activeView === "statuses"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Statuses
          </button>
        </div>

        {/* Date Filter */}
        <div className="ml-4">
          <Select
            value={dateFilter}
            onValueChange={(value) => setDateFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7">Last 7 Days</SelectItem>
              <SelectItem value="custom">Custom Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {dateFilter === "custom" && (
        <div className="mt-2 mb-2 flex justify-start w-full">
          <DatePicker
            selected={customDate}
            onChange={(date) => setCustomDate(date)}
            className="border border-border rounded-lg p-2"
            placeholderText="Select a date"
          />
        </div>
      )}

      {/* Chart */}
      <div
        onClick={() =>
          router.push(`/dashboard/visits?${activeView}=true&date=${dateFilter}`)
        }
        className="relative w-40 h-40 rounded-full flex items-center justify-center mb-6 cursor-pointer"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="w-28 h-28 rounded-full bg-white dark:bg-card flex flex-col items-center justify-center shadow-inner text-primary text-xl font-bold">
          {loading ? <span>...</span> : <span>{total}</span>}
          <div className="text-sm font-medium text-muted-foreground">Total</div>
        </div>
      </div>

      {/* Legend */}
      <ul className="text-sm space-y-2 w-full">
        {Object.entries(data).map(([type, count]) => (
          <li key={type} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[type] || "#ccc" }}
              />
              <span>{type}</span>
            </div>
            <span className="font-medium">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
