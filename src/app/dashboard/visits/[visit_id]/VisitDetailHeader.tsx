"use client";
import { Button } from "@/components/ui/button";
import GoBackButton from "@/components/custom/GoBackButton";

interface Visit {
  date?: string;
  clientName?: string;
  clientId?: string | number;
  medicaidId?: string | number;
  employeeName?: string;
  employeeId?: string | number;
}

interface VisitDetailHeaderProps {
  visit?: Visit;
}

export default function VisitDetailHeader({ visit }: VisitDetailHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div className="mb-4">
        <GoBackButton />
        <h2 className="text-lg font-semibold mt-4">Visit Detail</h2>
        <div className="text-sm text-muted-foreground space-y-1 mt-1">
          <p>
            <strong>Date:</strong> {visit?.date || "—"}
          </p>
          <p>
            <strong>Client:</strong> {visit?.clientName} (ID: {visit?.clientId},
            Medicaid: {visit?.medicaidId})
          </p>
          <p>
            <strong>Employee:</strong> {visit?.employeeName} (ID:{" "}
            {visit?.employeeId})
          </p>
        </div>
      </div>
    </div>
  );
}
