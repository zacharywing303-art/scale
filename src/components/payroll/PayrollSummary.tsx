"use client";
import React from "react";
import { Button } from "@/components/ui/button";

interface PayrollSummaryProps {
  totalPayroll: string;
  hasRun?: boolean;
  running?: boolean;
  onRunPayroll?: () => void;
  onExport?: () => void;
}

export default function PayrollSummary({
  totalPayroll,
  hasRun = false,
  running = false,
  onRunPayroll,
  onExport,
}: PayrollSummaryProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
      <p className="text-lg font-semibold text-gray-800 dark:text-white">
        Total Payroll: ${totalPayroll}
        {hasRun && (
          <span className="ml-2 text-sm text-emerald-600 dark:text-emerald-400">
            (Already Run)
          </span>
        )}
      </p>
      <div className="flex gap-3 mt-3 sm:mt-0">
        <Button variant="outline" onClick={onExport}>
          Export CSV
        </Button>
        <Button
          disabled={hasRun || running}
          onClick={onRunPayroll}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {hasRun ? "Payroll Complete" : running ? "Running..." : "Run Payroll"}
        </Button>
      </div>
    </div>
  );
}
// "use client";
// import React from "react";
// import { Button } from "@/components/ui/button";

// interface PayrollSummaryProps {
//   totalPayroll: string;
// }

// export default function PayrollSummary({ totalPayroll }: PayrollSummaryProps) {
//   return (
//     <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
//       <p className="text-lg font-semibold text-gray-800 dark:text-white">
//         Total Payroll: ${totalPayroll}
//       </p>
//       <div className="flex gap-3 mt-3 sm:mt-0">
//         <Button variant="outline">Preview Payroll</Button>
//         <Button>Save Changes</Button>
//       </div>
//     </div>
//   );
// }
