"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import GoBackButton from "@/components/custom/GoBackButton";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function TimelyAuditDetailPage() {
  const params = useParams<{ auditId: string }>();
  const auditId = params?.auditId;
  const [audit, setAudit] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#2563eb", "#16a34a", "#facc15", "#f97316", "#dc2626"];

  useEffect(() => {
    if (!auditId) return;
    fetchAudit();
  }, [auditId]);

  async function fetchAudit() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}`
      );
      if (!res.ok) throw new Error("Failed to fetch audit");
      const data = await res.json();
      setAudit(data);

      // fetch visits from backend (same date range)
      const visitRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/visits?agencyId=${data.agencyId}&start=${data.startDate}&end=${data.endDate}`
      );
      if (visitRes.ok) {
        const visitData = await visitRes.json();
        setVisits(visitData);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!audit) return <div className="p-6 text-red-600">Audit not found</div>;

  // --- Derived Chart Data ---
  const statusCounts = visits.reduce((acc: any, v: any) => {
    acc[v.visitStatus] = (acc[v.visitStatus] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.keys(statusCounts).map((key) => ({
    name: key,
    value: statusCounts[key],
  }));

  const serviceCounts = visits.reduce((acc: any, v: any) => {
    if (!v.serviceName) return acc;
    acc[v.serviceName] = (acc[v.serviceName] || 0) + 1;
    return acc;
  }, {});
  const serviceData = Object.keys(serviceCounts).map((key) => ({
    name: key,
    count: serviceCounts[key],
  }));

  const gpsExceptions = visits.filter(
    (v) =>
      (v.gpsInMilesFromClient && v.gpsInMilesFromClient > 1) ||
      (v.gpsOutMilesFromClient && v.gpsOutMilesFromClient > 1)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Timely Audit (
          {audit.frequency
            ? audit.frequency
                .toString()
                .split(/\s+/)
                .map(
                  (w: string) =>
                    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                )
                .join(" ")
            : ""}
          )
        </h2>
        <div className="space-x-3">
          <Button
            onClick={() =>
              window.open(
                `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}/export?format=xlsx`,
                "_blank"
              )
            }
            variant="outline"
          >
            Download Excel
          </Button>
          <Button
            onClick={() =>
              window.open(
                `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}/export?format=pdf`,
                "_blank"
              )
            }
            variant="outline"
          >
            Download PDF
          </Button>
        </div>
      </div>

      <GoBackButton />

      {/* Summary */}
      <div className="space-y-3">
        <p>
          <strong>Date Range:</strong> {audit.startDate.split("T")[0]} –{" "}
          {audit.endDate.split("T")[0]}
        </p>
        <p>
          <strong>Total Visits:</strong> {audit.totalVisits ?? visits.length}
        </p>
        <p>
          <strong>EVV Compliance:</strong> {audit.evvCompliance?.toFixed(2)}%
        </p>
        <Progress value={audit.evvCompliance} className="w-64" />
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Visit Status Breakdown */}
        <div className="p-4 border rounded-md bg-white shadow-sm">
          <h3 className="font-semibold mb-2">Visit Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                dataKey="value"
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Service Breakdown */}
        <div className="p-4 border rounded-md bg-white shadow-sm">
          <h3 className="font-semibold mb-2">Service Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={serviceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GPS Exceptions Table */}
      <div className="p-4 border rounded-md bg-white shadow-sm">
        <h3 className="font-semibold mb-3">
          GPS Exceptions ({gpsExceptions.length})
        </h3>
        <div className="overflow-auto max-h-80">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2 border">Client</th>
                <th className="p-2 border">Employee</th>
                <th className="p-2 border">Service</th>
                <th className="p-2 border">GPS In</th>
                <th className="p-2 border">GPS Out</th>
              </tr>
            </thead>
            <tbody>
              {gpsExceptions.map((v, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{v.clientName}</td>
                  <td className="p-2 border">{v.employeeName}</td>
                  <td className="p-2 border">{v.serviceName}</td>
                  <td className="p-2 border">{v.gpsInMilesFromClient ?? 0}</td>
                  <td className="p-2 border">{v.gpsOutMilesFromClient ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { toast } from "sonner";
// import GoBackButton from "@/components/custom/GoBackButton";

// type Task = {
//   id: string;
//   name: string;
//   dueDate?: string;
//   frequency?: string;
// };

// export default function TimelyAuditDetailPage() {
//   const params = useParams<{ auditId: string }>();
//   const auditId = params?.auditId;
//   const [audit, setAudit] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(false);

//   useEffect(() => {
//     if (!auditId) return;
//     fetchAudit();
//   }, [auditId]);

//   async function fetchAudit() {
//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}`
//       );
//       if (!res.ok) throw new Error("Failed to fetch audit");
//       const data = await res.json();
//       setAudit(data);
//     } catch (err: any) {
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handleDownload = (format: "xlsx" | "pdf") => {
//     window.open(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}/export?format=${format}`,
//       "_blank"
//     );
//   };

//   const handleToggleComplete = async () => {
//     if (!auditId) return;
//     try {
//       setUpdating(true);
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}/complete`,
//         { method: "PATCH" }
//       );
//       if (!res.ok) throw new Error("Failed to update audit");
//       toast.success(
//         audit.completed ? "Audit marked as incomplete" : "Audit marked complete"
//       );
//       await fetchAudit();
//     } catch (err: any) {
//       toast.error(err.message);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   if (loading) return <div className="p-6">Loading...</div>;
//   if (!audit) return <div className="p-6 text-red-600">Audit not found</div>;

//   const unityTask: Task | null = audit.unityTask ?? null;

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header Section */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">
//           Timely Audit{" "}
//           {`(${audit.frequency
//             ?.toString()
//             .split(/\s+/)
//             .map(
//               (w: string) =>
//                 w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
//             )
//             .join(" ")})`}
//         </h2>

//         <div className="space-x-3">
//           <Button onClick={() => handleDownload("xlsx")} variant="outline">
//             Download Excel
//           </Button>
//           <Button onClick={() => handleDownload("pdf")} variant="outline">
//             Download PDF
//           </Button>
//         </div>
//       </div>

//       <GoBackButton />

//       {/* 🧭 Unity Task Header */}
//       {unityTask && (
//         <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
//           <div className="flex justify-between items-center">
//             <div>
//               <h3 className="font-semibold text-lg">{unityTask.name}</h3>
//               {unityTask.dueDate && (
//                 <p className="text-sm text-gray-600">
//                   Due: {new Date(unityTask.dueDate).toLocaleDateString()}
//                 </p>
//               )}
//               {unityTask.frequency && (
//                 <p className="text-sm text-gray-600">
//                   Frequency: {unityTask.frequency}
//                 </p>
//               )}
//             </div>

//             <Button
//               onClick={handleToggleComplete}
//               disabled={updating}
//               className={`${
//                 audit.completed
//                   ? "bg-green-600 hover:bg-green-700 text-white"
//                   : "bg-blue-600 hover:bg-blue-700 text-white"
//               }`}
//             >
//               {updating
//                 ? "Updating..."
//                 : audit.completed
//                 ? "✅ Completed (Unmark)"
//                 : "Mark as Complete"}
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* --- Summary Section --- */}
//       <div className="space-y-3">
//         <p>
//           <strong>Date Range:</strong> {audit.startDate.split("T")[0]} –{" "}
//           {audit.endDate.split("T")[0]}
//         </p>
//         <p>
//           <strong>Total Visits:</strong> {audit.totalVisits ?? 0}
//         </p>
//         <div className="space-y-1">
//           <p>
//             <strong>EVV Compliance:</strong> {audit.evvCompliance?.toFixed(2)}%
//           </p>
//           <Progress value={audit.evvCompliance} className="w-64" />
//         </div>
//         <p>
//           <strong>GPS Exceptions:</strong> {audit.gpsExceptions ?? 0}
//         </p>
//         <p>
//           <strong>Total Exceptions:</strong> {audit.exceptionCount ?? 0}
//         </p>
//       </div>

//       {/* --- Completion Button for non-Unity Tasks --- */}
//       {!unityTask && (
//         <div className="pt-6">
//           <Button
//             onClick={handleToggleComplete}
//             disabled={updating}
//             className={`${
//               audit.completed
//                 ? "bg-green-600 hover:bg-green-700 text-white"
//                 : "bg-blue-600 hover:bg-blue-700 text-white"
//             }`}
//           >
//             {updating
//               ? "Updating..."
//               : audit.completed
//               ? "✅ Completed (Unmark)"
//               : "Mark as Complete"}
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }
