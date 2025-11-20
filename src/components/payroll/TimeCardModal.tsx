"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDays } from "date-fns";
import type { PayrollRow } from "./PayrollTable";

interface Props {
  employee: PayrollRow;
  periodFrom: string;
  periodTo: string;
  onClose: () => void;
  onSave: (facilityTotal: number, officeTotal: number) => void;
}

type DayRow = {
  date: string;
  facilityHours: number;
  officeHours: number;
};

export default function TimecardModal({
  employee,
  periodFrom,
  periodTo,
  onClose,
  onSave,
}: Props) {
  const [rows, setRows] = useState<DayRow[]>(() => {
    if (!periodFrom || !periodTo) return [];
    const start = new Date(periodFrom);
    const end = new Date(periodTo);
    const days: DayRow[] = [];
    let current = new Date(start);

    while (current <= end) {
      const iso = current.toISOString().split("T")[0];
      days.push({
        date: iso,
        facilityHours: 0,
        officeHours: 0,
      });
      current = addDays(current, 1);
    }
    return days;
  });

  const totals = useMemo(() => {
    let facility = 0;
    let office = 0;
    for (const r of rows) {
      facility += r.facilityHours;
      office += r.officeHours;
    }
    return {
      facility: Number(facility.toFixed(2)),
      office: Number(office.toFixed(2)),
    };
  }, [rows]);

  const handleChange = (
    index: number,
    field: "facilityHours" | "officeHours",
    value: number
  ) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-1">
          Timecard – {employee.name}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Facility and Office hours for {periodFrom} → {periodTo}
        </p>

        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Date</th>
              <th className="border px-2 py-1 text-right">Facility Hours</th>
              <th className="border px-2 py-1 text-right">Office Hours</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.date}>
                <td className="border px-2 py-1">{r.date}</td>
                <td className="border px-2 py-1 text-right">
                  <Input
                    type="number"
                    step="0.25"
                    value={r.facilityHours}
                    onChange={(e) =>
                      handleChange(
                        idx,
                        "facilityHours",
                        parseFloat(e.target.value || "0")
                      )
                    }
                    className="w-full text-right"
                  />
                </td>
                <td className="border px-2 py-1 text-right">
                  <Input
                    type="number"
                    step="0.25"
                    value={r.officeHours}
                    onChange={(e) =>
                      handleChange(
                        idx,
                        "officeHours",
                        parseFloat(e.target.value || "0")
                      )
                    }
                    className="w-full text-right"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4 text-sm">
          <div>
            <div>Facility Total: {totals.facility} hrs</div>
            <div>Office Total: {totals.office} hrs</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSave(totals.facility, totals.office)}>
              Apply to Employee
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
