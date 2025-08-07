// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";
// import ProtectedRoute from "@/components/auth/ProtectedRoute";

// const pieColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"];

// const dummyAgencyStats = {
//   totalAgencies: 128,
//   activeAgencies: 102,
//   inactiveAgencies: 26,
//   totalUsers: 2450,
//   totalVisits: 17230,
//   totalHours: 98456,
//   averageHoursPerAgency: 769,
//   subscriptionBreakdown: [
//     { name: "Basic", value: 34 },
//     { name: "Standard", value: 61 },
//     { name: "Premium", value: 33 },
//   ],
//   agenciesPerState: [
//     { state: "NY", count: 28 },
//     { state: "CA", count: 19 },
//     { state: "TX", count: 22 },
//     { state: "FL", count: 15 },
//     { state: "PA", count: 10 },
//   ],
// };

// export default function AgencyStatisticsPage() {
//   const [stats, setStats] = useState(dummyAgencyStats);

//   // Future: Replace with API call
//   useEffect(() => {
//     // fetch("/api/system/stats").then(...);
//   }, []);

//   return (
//     <ProtectedRoute allowedRoles={["MAIN_ADMIN", "SYSTEM_ADMIN"]}>
//       <div className="p-6 space-y-6 max-w-6xl mx-auto">
//         <h1 className="text-2xl font-semibold">Agency Statistics</h1>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           <StatCard label="Total Agencies" value={stats.totalAgencies} />
//           <StatCard label="Active Agencies" value={stats.activeAgencies} />
//           <StatCard label="Inactive Agencies" value={stats.inactiveAgencies} />
//           <StatCard label="Total Users" value={stats.totalUsers} />
//           <StatCard label="Total Visits" value={stats.totalVisits} />
//           <StatCard label="Total Hours Logged" value={stats.totalHours} />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <Card>
//             <CardContent className="p-6">
//               <h2 className="text-lg font-medium mb-4">Agencies per State</h2>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={stats.agenciesPerState}>
//                   <XAxis dataKey="state" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="count" fill="#2563eb" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-6">
//               <h2 className="text-lg font-medium mb-4">
//                 Subscription Plan Breakdown
//               </h2>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={stats.subscriptionBreakdown}
//                     dataKey="value"
//                     nameKey="name"
//                     outerRadius={100}
//                     label
//                   >
//                     {stats.subscriptionBreakdown.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={pieColors[index % pieColors.length]}
//                       />
//                     ))}
//                   </Pie>
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

// function StatCard({ label, value }: { label: string; value: number | string }) {
//   return (
//     <Card>
//       <CardContent className="p-4">
//         <div className="text-sm text-gray-500">{label}</div>
//         <div className="text-xl font-semibold">{value}</div>
//       </CardContent>
//     </Card>
//   );
// }
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [fakeStats, setFakeStats] = useState(dummyAgencyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("http://localhost:5000/api/system/stats");
        if (!res.ok) throw new Error("Failed to fetch agency statistics");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching agency statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <ProtectedRoute allowedRoles={["MAIN_ADMIN", "SYSTEM_ADMIN"]}>
        <div className="p-6 text-center text-gray-500">
          Loading statistics...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["MAIN_ADMIN", "SYSTEM_ADMIN"]}>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold">Agency Statistics</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total Agencies"
            value={stats ? stats.totalAgencies : "-"}
          />
          <StatCard
            label="Active Agencies"
            value={stats ? stats.activeAgencies : "-"}
          />
          <StatCard
            label="Inactive Agencies"
            value={stats ? stats.inactiveAgencies : "-"}
          />
          <StatCard
            label="Total Users"
            value={stats ? stats.totalUsers : "-"}
          />
          <StatCard
            label="Total Visits"
            value={stats ? stats.totalVisits : "-"}
          />
          <StatCard
            label="Total Hours Logged"
            value={stats ? stats.totalHours : "-"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Agencies per State</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={
                    stats ? stats.agenciesPerState : fakeStats.agenciesPerState
                  }
                >
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
                    data={
                      stats
                        ? stats.subscriptionBreakdown
                        : fakeStats.subscriptionBreakdown
                    }
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {stats
                      ? stats.subscriptionBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={pieColors[index % pieColors.length]}
                          />
                        ))
                      : fakeStats.subscriptionBreakdown.map((entry, index) => (
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
    </ProtectedRoute>
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

type AgencyStats = {
  totalAgencies: number;
  activeAgencies: number;
  inactiveAgencies: number;
  totalUsers: number;
  totalVisits: number;
  totalHours: number;
  averageHoursPerAgency: number;
  subscriptionBreakdown: { name: string; value: number }[];
  agenciesPerState: { state: string; count: number }[];
};
