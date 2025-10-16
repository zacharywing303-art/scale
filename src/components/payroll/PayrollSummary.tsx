"use client";
import React from "react";
import { Button } from "@/components/ui/button";

interface PayrollSummaryProps {
  totalPayroll: string;
}

export default function PayrollSummary({ totalPayroll }: PayrollSummaryProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
      <p className="text-lg font-semibold text-gray-800 dark:text-white">
        Total Payroll: ${totalPayroll}
      </p>
      <div className="flex gap-3 mt-3 sm:mt-0">
        <Button variant="outline">Preview Payroll</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
