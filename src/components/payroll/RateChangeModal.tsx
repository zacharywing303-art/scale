"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export type RatePending = {
  employeeId: string;
  employeeCode: string;
  field: "visitRate" | "facilityRate" | "officeRate" | "mileageRate";
  newValue: number;
};

interface Props {
  pending: RatePending;
  onChoice: (makePermanent: boolean) => void;
  onCancel: () => void;
}

export default function RateChangeModal({
  pending,
  onChoice,
  onCancel,
}: Props) {
  const fieldLabelMap: Record<RatePending["field"], string> = {
    visitRate: "Visit Rate",
    facilityRate: "Facility Rate",
    officeRate: "Office Rate",
    mileageRate: "Mileage Rate",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold mb-2">
          Update {fieldLabelMap[pending.field]}?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          You changed {fieldLabelMap[pending.field]} for{" "}
          <span className="font-semibold">{pending.employeeCode}</span> to{" "}
          <span className="font-semibold">${pending.newValue.toFixed(2)}</span>.
          <br />
          Do you want to make this the ongoing rate for future payrolls, or
          apply it only for this payroll run?
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => onChoice(false)}>
            This Run Only
          </Button>
          <Button onClick={() => onChoice(true)}>Ongoing Rate</Button>
        </div>
      </div>
    </div>
  );
}
