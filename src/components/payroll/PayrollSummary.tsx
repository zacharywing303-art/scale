"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PayrollSummaryProps {
  totalPayroll: string;
  onPreview: () => void;
  onRunPayroll: () => void;
}

export default function PayrollSummary({
  totalPayroll,
  onPreview,
  onRunPayroll,
}: PayrollSummaryProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
      <p className="text-lg font-semibold text-gray-800 dark:text-white">
        Total Payroll (Estimated): ${totalPayroll}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onPreview}>
          Refresh Preview
        </Button>
        <Button onClick={onRunPayroll}>Run Payroll</Button>
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
