"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Maximize2, Minimize2, Printer } from "lucide-react";

export default function GeneratedReportPage() {
  const [isMaximized, setIsMaximized] = useState(true);

  const handleExportExcel = () => {
    // Trigger export to Excel logic
    console.log("Export to Excel");
  };

  const handleExportPDF = () => {
    // Trigger export to PDF logic
    console.log("Export to PDF");
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

      <div className="overflow-auto bg-white shadow rounded-lg p-4 h-full border">
        {/* Replace this table with your actual report rendering */}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Employee</th>
              <th className="border p-2 text-left">Client</th>
              <th className="border p-2 text-left">Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">07/21/2025</td>
              <td className="border p-2">John Doe</td>
              <td className="border p-2">Jane Smith</td>
              <td className="border p-2">6.5</td>
            </tr>
            <tr>
              <td className="border p-2">07/20/2025</td>
              <td className="border p-2">Emily Davis</td>
              <td className="border p-2">Mark Johnson</td>
              <td className="border p-2">8.0</td>
            </tr>
            {/* More rows */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
