"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Maximize2, Minimize2, Printer } from "lucide-react";
import { format } from "date-fns";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

type EvvRow = {
  id: number;
  callType: string | null;
  scheduledTimeIn: string | null;
  scheduledTimeOut: string | null;
  callIn: string | null;
  callOut: string | null;
  clientName: string | null;
  clientMedicaidID: string | null;
  clientID: string | null;
  employeeName: string | null;
  employeeID: string | null;
};

type EvvReport = {
  agency: { id: string; name: string; code: string };
  meta: { from: string; to: string; generatedAt: string };
  summary: {
    totalVisits: number;
    autoCount: number;
    autoPct: number;
    manualCount: number;
    manualPct: number;
    compliancePct: number;
  };
  rows: EvvRow[];
};

export default function GeneratedReportPage() {
  const [isMaximized, setIsMaximized] = useState(true);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<EvvReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    async function load() {
      const type = searchParams.get("type");
      if (type !== "EVV_COMPLIANCE") {
        setError("Unsupported report type");
        setLoading(false);
        return;
      }

      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const employeeId = searchParams.get("employeeId") || undefined;
      const clientId = searchParams.get("clientId") || undefined;
      const medicaidId = searchParams.get("medicaidId") || undefined;

      if (!from || !to) {
        setError("Missing from/to dates");
        setLoading(false);
        return;
      }

      try {
        const user = await getLoggedInUser();
        if (!user?.agency?.id) {
          setError("No agency context");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reports/${user.agency.id}/evv-compliance`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              from,
              to,
              employeeId,
              clientId,
              medicaidId,
            }),
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to fetch report");
        }

        const data = await res.json();
        setReport(data);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [searchParams]);

  const handleExportExcel = () => {
    // TODO: implement CSV/Excel export if you want
    console.log("Export to Excel");
  };

  const handleExportPDF = () => {
    // For now, you can use browser "Print → Save as PDF"
    // If you later add jsPDF/html2canvas, hook it here.
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isMaximized ? "w-full h-screen p-6" : "w-full h-[60vh] p-4"
      }`}
    >
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-semibold">Generated Report</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsMaximized((prev) => !prev)}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-auto bg-white shadow rounded-lg p-4 h-full border print:border-0 print:shadow-none">
        {loading && <p className="text-sm text-gray-500">Loading report…</p>}
        {error && (
          <p className="text-sm text-red-600 font-medium">Error: {error}</p>
        )}

        {report && !loading && !error && (
          <div className="space-y-4">
            {/* Header: agency + date range */}
            <div className="border-b pb-3">
              <h3 className="text-lg font-semibold">
                EVV Compliance – Compliance Statistics
              </h3>
              <p className="text-sm text-gray-700">
                {report.agency.name} &mdash; Agency Code: {report.agency.code}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Period: {format(new Date(report.meta.from), "MM/dd/yyyy HH:mm")}{" "}
                – {format(new Date(report.meta.to), "MM/dd/yyyy HH:mm")} |
                Generated:{" "}
                {format(new Date(report.meta.generatedAt), "MM/dd/yyyy HH:mm")}
              </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="border rounded p-2 bg-gray-50">
                <div className="font-semibold text-gray-700">Total Visits</div>
                <div className="text-xl font-bold">
                  {report.summary.totalVisits}
                </div>
              </div>
              <div className="border rounded p-2 bg-green-50">
                <div className="font-semibold text-gray-700">
                  Auto Visits (%)
                </div>
                <div className="text-lg font-bold">
                  {report.summary.autoCount} (
                  {report.summary.autoPct.toFixed(1)}%)
                </div>
              </div>
              <div className="border rounded p-2 bg-yellow-50">
                <div className="font-semibold text-gray-700">
                  Manual Visits (%)
                </div>
                <div className="text-lg font-bold">
                  {report.summary.manualCount} (
                  {report.summary.manualPct.toFixed(1)}%)
                </div>
              </div>
              <div className="border rounded p-2 bg-blue-50">
                <div className="font-semibold text-gray-700">
                  Compliance (% Auto)
                </div>
                <div className="text-lg font-bold">
                  {report.summary.compliancePct.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Detail table */}
            <table className="w-full text-xs md:text-sm border-collapse mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Visit ID</th>
                  <th className="border p-2 text-left">Call Type</th>
                  <th className="border p-2 text-left">Scheduled In</th>
                  <th className="border p-2 text-left">Scheduled Out</th>
                  <th className="border p-2 text-left">Call In</th>
                  <th className="border p-2 text-left">Call Out</th>
                  <th className="border p-2 text-left">Client (Medicaid ID)</th>
                  <th className="border p-2 text-left">
                    Employee (Employee ID)
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="border p-3 text-center text-gray-500"
                    >
                      No visits found for the selected filters.
                    </td>
                  </tr>
                )}

                {report.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="border p-2">{row.id}</td>
                    <td className="border p-2">{row.callType ?? "-"}</td>
                    <td className="border p-2">
                      {row.scheduledTimeIn
                        ? format(
                            new Date(row.scheduledTimeIn),
                            "MM/dd/yyyy HH:mm"
                          )
                        : "-"}
                    </td>
                    <td className="border p-2">
                      {row.scheduledTimeOut
                        ? format(
                            new Date(row.scheduledTimeOut),
                            "MM/dd/yyyy HH:mm"
                          )
                        : "-"}
                    </td>
                    <td className="border p-2">
                      {row.callIn
                        ? format(new Date(row.callIn), "MM/dd/yyyy HH:mm")
                        : "-"}
                    </td>
                    <td className="border p-2">
                      {row.callOut
                        ? format(new Date(row.callOut), "MM/dd/yyyy HH:mm")
                        : "-"}
                    </td>
                    <td className="border p-2">
                      {row.clientName ?? "-"}{" "}
                      {row.clientMedicaidID ? `(${row.clientMedicaidID})` : ""}
                    </td>
                    <td className="border p-2">
                      {row.employeeName ?? "-"}{" "}
                      {row.employeeID ? `(${row.employeeID})` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer summary text */}
            <div className="pt-3 border-t text-xs text-gray-600">
              <p>
                Total visits: <strong>{report.summary.totalVisits}</strong> |
                Auto: <strong>{report.summary.autoCount}</strong> (
                {report.summary.autoPct.toFixed(1)}%) | Manual:{" "}
                <strong>{report.summary.manualCount}</strong> (
                {report.summary.manualPct.toFixed(1)}%) | Compliance:{" "}
                <strong>{report.summary.compliancePct.toFixed(1)}%</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Download, Maximize2, Minimize2, Printer } from "lucide-react";

// export default function GeneratedReportPage() {
//   const [isMaximized, setIsMaximized] = useState(true);

//   const handleExportExcel = () => {
//     // Trigger export to Excel logic
//     console.log("Export to Excel");
//   };

//   const handleExportPDF = () => {
//     // Trigger export to PDF logic
//     console.log("Export to PDF");
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <div
//       className={`transition-all duration-300 ${
//         isMaximized ? "w-full h-screen p-6" : "w-full h-[60vh] p-4"
//       }`}
//     >
//       <div className="flex justify-between items-center mb-4 border-b pb-2">
//         <h2 className="text-xl font-semibold">Generated Report</h2>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleExportExcel}>
//             <Download className="w-4 h-4 mr-2" />
//             Excel
//           </Button>
//           <Button variant="outline" onClick={handleExportPDF}>
//             <Download className="w-4 h-4 mr-2" />
//             PDF
//           </Button>
//           <Button variant="outline" onClick={handlePrint}>
//             <Printer className="w-4 h-4 mr-2" />
//             Print
//           </Button>
//           <Button
//             variant="outline"
//             onClick={() => setIsMaximized((prev) => !prev)}
//           >
//             {isMaximized ? (
//               <Minimize2 className="w-4 h-4" />
//             ) : (
//               <Maximize2 className="w-4 h-4" />
//             )}
//           </Button>
//         </div>
//       </div>

//       <div className="overflow-auto bg-white shadow rounded-lg p-4 h-full border">
//         {/* Replace this table with your actual report rendering */}
//         <table className="w-full text-sm border-collapse">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border p-2 text-left">Date</th>
//               <th className="border p-2 text-left">Employee</th>
//               <th className="border p-2 text-left">Client</th>
//               <th className="border p-2 text-left">Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td className="border p-2">07/21/2025</td>
//               <td className="border p-2">John Doe</td>
//               <td className="border p-2">Jane Smith</td>
//               <td className="border p-2">6.5</td>
//             </tr>
//             <tr>
//               <td className="border p-2">07/20/2025</td>
//               <td className="border p-2">Emily Davis</td>
//               <td className="border p-2">Mark Johnson</td>
//               <td className="border p-2">8.0</td>
//             </tr>
//             {/* More rows */}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
