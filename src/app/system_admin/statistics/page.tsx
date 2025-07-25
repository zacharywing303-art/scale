"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const pieColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"];

const dummyAgencyStats = {
  totalAgencies: 128,
  activeAgencies: 102,
  inactiveAgencies: 26,
  totalUsers: 2450,
  totalVisits: 17230,
  totalHours: 98456,
  averageHoursPerAgency: 769,
  subscriptionBreakdown: [
    { name: "Basic", value: 34 },
    { name: "Standard", value: 61 },
    { name: "Premium", value: 33 },
  ],
  agenciesPerState: [
    { state: "NY", count: 28 },
    { state: "CA", count: 19 },
    { state: "TX", count: 22 },
    { state: "FL", count: 15 },
    { state: "PA", count: 10 },
  ],
};

export default function AgencyStatisticsPage() {
  const [stats, setStats] = useState(dummyAgencyStats);

  // Future: Replace with API call
  useEffect(() => {
    // fetch("/api/system/stats").then(...);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold">Agency Statistics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Agencies" value={stats.totalAgencies} />
        <StatCard label="Active Agencies" value={stats.activeAgencies} />
        <StatCard label="Inactive Agencies" value={stats.inactiveAgencies} />
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Visits" value={stats.totalVisits} />
        <StatCard label="Total Hours Logged" value={stats.totalHours} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Agencies per State</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.agenciesPerState}>
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">
              Subscription Plan Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.subscriptionBreakdown}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {stats.subscriptionBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
