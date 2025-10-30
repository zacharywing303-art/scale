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
  const [marking, setMarking] = useState(false);

  const COLORS = ["#2563eb", "#16a34a", "#facc15", "#f97316", "#dc2626"];

  useEffect(() => {
    if (!auditId) return;
    fetchAudit();
  }, [auditId]);

  async function fetchAudit() {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}`
      );
      if (!res.ok) throw new Error("Failed to fetch audit");
      const data = await res.json();
      setAudit(data);

      // fetch visits for audit range
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

  async function handleToggleComplete() {
    if (!audit) return;
    setMarking(true);
    try {
      const updatedAuditRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${audit.id}/complete`,
        { method: "PATCH" }
      );
      if (!updatedAuditRes.ok)
        throw new Error("Failed to toggle audit completion");
      const updatedAudit = await updatedAuditRes.json();

      // If linked to a Unity Task, toggle that too
      if (audit.unityTaskId) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${audit.unityTaskId}/complete`,
          { method: "PATCH" }
        );
      }

      toast.success(
        updatedAudit.completed
          ? "✅ Audit marked complete"
          : "⏳ Audit marked incomplete"
      );
      setAudit(updatedAudit);
    } catch (err: any) {
      toast.error(err.message || "Error toggling completion");
    } finally {
      setMarking(false);
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

  // --- UI ---
  const isUnityTask = !!audit.unityTaskId;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      {isUnityTask && (
        <div className="border p-4 rounded-md bg-white shadow-sm mb-4">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                Assigned Task: Conduct / Review Timely Audits
              </h2>
              <p className="text-sm text-muted-foreground">
                Assigned:{" "}
                {audit.unityTask?.assignedDate
                  ? new Date(audit.unityTask.assignedDate).toLocaleDateString()
                  : "N/A"}{" "}
                | Due:{" "}
                {audit.unityTask?.dueDate
                  ? new Date(audit.unityTask.dueDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}/export?format=xlsx`,
                    "_blank"
                  )
                }
              >
                Download Excel
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}/export?format=pdf`,
                    "_blank"
                  )
                }
              >
                Download PDF
              </Button>
              <Button
                disabled={marking}
                onClick={handleToggleComplete}
                className={`${
                  audit.completed
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {marking
                  ? "Processing..."
                  : audit.completed
                  ? "✅ Mark Incomplete"
                  : "Mark Complete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <GoBackButton />

      {!isUnityTask && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Timely Audit ({audit.frequency})
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
      )}

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

      {/* No visits message */}
      {(audit.totalVisits === 0 || visits.length === 0) && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-md text-yellow-800">
          🚫 No audit available — no visits found during this date range!
        </div>
      )}

      {/* Charts Section */}
      {visits.length > 0 && (
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
      )}

      {/* GPS Exceptions Table */}
      {gpsExceptions.length > 0 && (
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
                    <td className="p-2 border">
                      {v.gpsInMilesFromClient ?? 0}
                    </td>
                    <td className="p-2 border">
                      {v.gpsOutMilesFromClient ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Legend,
// } from "recharts";

// export default function TimelyAuditDetailPage() {
//   const params = useParams<{ auditId: string }>();
//   const auditId = params?.auditId;
//   const [audit, setAudit] = useState<any>(null);
//   const [visits, setVisits] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const COLORS = ["#2563eb", "#16a34a", "#facc15", "#f97316", "#dc2626"];

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

//       // fetch visits from backend (same date range)
//       const visitRes = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/visits?agencyId=${data.agencyId}&start=${data.startDate}&end=${data.endDate}`
//       );
//       if (visitRes.ok) {
//         const visitData = await visitRes.json();
//         setVisits(visitData);
//       }
//     } catch (err: any) {
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (loading) return <div className="p-6">Loading...</div>;
//   if (!audit) return <div className="p-6 text-red-600">Audit not found</div>;

//   // --- Derived Chart Data ---
//   const statusCounts = visits.reduce((acc: any, v: any) => {
//     acc[v.visitStatus] = (acc[v.visitStatus] || 0) + 1;
//     return acc;
//   }, {});
//   const statusData = Object.keys(statusCounts).map((key) => ({
//     name: key,
//     value: statusCounts[key],
//   }));

//   const serviceCounts = visits.reduce((acc: any, v: any) => {
//     if (!v.serviceName) return acc;
//     acc[v.serviceName] = (acc[v.serviceName] || 0) + 1;
//     return acc;
//   }, {});
//   const serviceData = Object.keys(serviceCounts).map((key) => ({
//     name: key,
//     count: serviceCounts[key],
//   }));

//   const gpsExceptions = visits.filter(
//     (v) =>
//       (v.gpsInMilesFromClient && v.gpsInMilesFromClient > 1) ||
//       (v.gpsOutMilesFromClient && v.gpsOutMilesFromClient > 1)
//   );

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">
//           Timely Audit (
//           {audit.frequency
//             ? audit.frequency
//                 .toString()
//                 .split(/\s+/)
//                 .map(
//                   (w: string) =>
//                     w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
//                 )
//                 .join(" ")
//             : ""}
//           )
//         </h2>
//         <div className="space-x-3">
//           <Button
//             onClick={() =>
//               window.open(
//                 `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}/export?format=xlsx`,
//                 "_blank"
//               )
//             }
//             variant="outline"
//           >
//             Download Excel
//           </Button>
//           <Button
//             onClick={() =>
//               window.open(
//                 `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/${auditId}/export?format=pdf`,
//                 "_blank"
//               )
//             }
//             variant="outline"
//           >
//             Download PDF
//           </Button>
//         </div>
//       </div>

//       <GoBackButton />

//       {/* Summary */}
//       <div className="space-y-3">
//         <p>
//           <strong>Date Range:</strong> {audit.startDate.split("T")[0]} –{" "}
//           {audit.endDate.split("T")[0]}
//         </p>
//         <p>
//           <strong>Total Visits:</strong> {audit.totalVisits ?? visits.length}
//         </p>
//         <p>
//           <strong>EVV Compliance:</strong> {audit.evvCompliance?.toFixed(2)}%
//         </p>
//         <Progress value={audit.evvCompliance} className="w-64" />
//       </div>

//       {/* Charts Section */}
//       <div className="grid md:grid-cols-2 gap-8">
//         {/* Visit Status Breakdown */}
//         <div className="p-4 border rounded-md bg-white shadow-sm">
//           <h3 className="font-semibold mb-2">Visit Status Breakdown</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 dataKey="value"
//                 data={statusData}
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={80}
//                 label
//               >
//                 {statusData.map((_, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={COLORS[index % COLORS.length]}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Service Breakdown */}
//         <div className="p-4 border rounded-md bg-white shadow-sm">
//           <h3 className="font-semibold mb-2">Service Breakdown</h3>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={serviceData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" hide />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="count" fill="#2563eb" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* GPS Exceptions Table */}
//       <div className="p-4 border rounded-md bg-white shadow-sm">
//         <h3 className="font-semibold mb-3">
//           GPS Exceptions ({gpsExceptions.length})
//         </h3>
//         <div className="overflow-auto max-h-80">
//           <table className="w-full text-sm border-collapse">
//             <thead className="bg-gray-100 sticky top-0">
//               <tr>
//                 <th className="p-2 border">Client</th>
//                 <th className="p-2 border">Employee</th>
//                 <th className="p-2 border">Service</th>
//                 <th className="p-2 border">GPS In</th>
//                 <th className="p-2 border">GPS Out</th>
//               </tr>
//             </thead>
//             <tbody>
//               {gpsExceptions.map((v, i) => (
//                 <tr key={i} className="border-b hover:bg-gray-50">
//                   <td className="p-2 border">{v.clientName}</td>
//                   <td className="p-2 border">{v.employeeName}</td>
//                   <td className="p-2 border">{v.serviceName}</td>
//                   <td className="p-2 border">{v.gpsInMilesFromClient ?? 0}</td>
//                   <td className="p-2 border">{v.gpsOutMilesFromClient ?? 0}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
