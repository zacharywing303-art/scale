"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";

export type PeriodType =
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY"
  | "CUSTOM"
  | "ALL_TIME";

export default function PeriodSelector({
  value,
  onChange,
}: {
  value: {
    type: PeriodType;
    from?: string;
    to?: string;
    month?: number;
    year?: number;
    quarter?: "Q1" | "Q2" | "Q3" | "Q4";
  };
  onChange: (v: any) => void;
}) {
  const [type, setType] = useState<PeriodType>(value.type);

  useEffect(() => onChange({ ...value, type }), [type]);

  const computeWeekly = (anyDate: string) => {
    const d = new Date(anyDate);
    return {
      from: startOfWeek(d, { weekStartsOn: 0 }).toISOString().split("T")[0],
      to: endOfWeek(d, { weekStartsOn: 0 }).toISOString().split("T")[0],
    };
  };

  const computeQuarter = (q: string, year: number) => {
    const baseMonth = q === "Q1" ? 0 : q === "Q2" ? 3 : q === "Q3" ? 6 : 9;

    const start = startOfQuarter(new Date(year, baseMonth, 1));
    const end = endOfQuarter(start);
    return {
      from: start.toISOString().split("T")[0],
      to: end.toISOString().split("T")[0],
    };
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Review Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as PeriodType)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="QUARTERLY">Quarterly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
            <SelectItem value="CUSTOM">Custom Range</SelectItem>
            <SelectItem value="ALL_TIME">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "WEEKLY" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Select any date in week</Label>
            <Input
              type="date"
              value={value.from ?? ""}
              onChange={(e) => {
                const wk = computeWeekly(e.target.value);
                onChange({ type, ...wk });
              }}
            />
          </div>
          <div>
            <Label>Week End</Label>
            <Input type="date" value={value.to ?? ""} disabled />
          </div>
        </div>
      )}

      {type === "MONTHLY" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Month</Label>
            <Select
              value={String(value.month ?? new Date().getMonth())}
              onValueChange={(m) => {
                const month = Number(m);
                const year = value.year ?? new Date().getFullYear();
                const start = startOfMonth(new Date(year, month, 1));
                const end = endOfMonth(start);
                onChange({
                  type,
                  month,
                  year,
                  from: start.toISOString().split("T")[0],
                  to: end.toISOString().split("T")[0],
                });
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {new Date(2020, i, 1).toLocaleString("default", {
                      month: "long",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Year</Label>
            <Input
              type="number"
              value={value.year ?? new Date().getFullYear()}
              onChange={(e) => {
                const year = Number(e.target.value);
                const month = value.month ?? new Date().getMonth();
                const start = startOfMonth(new Date(year, month, 1));
                const end = endOfMonth(start);
                onChange({
                  type,
                  month,
                  year,
                  from: start.toISOString().split("T")[0],
                  to: end.toISOString().split("T")[0],
                });
              }}
            />
          </div>
        </div>
      )}

      {type === "QUARTERLY" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Quarter</Label>
            <Select
              value={value.quarter ?? "Q1"}
              onValueChange={(q) => {
                const year = value.year ?? new Date().getFullYear();
                const r = computeQuarter(q, year);
                onChange({ type, quarter: q as any, year, ...r });
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1 (Jan–Mar)</SelectItem>
                <SelectItem value="Q2">Q2 (Apr–Jun)</SelectItem>
                <SelectItem value="Q3">Q3 (Jul–Sep)</SelectItem>
                <SelectItem value="Q4">Q4 (Oct–Dec)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Year</Label>
            <Input
              type="number"
              value={value.year ?? new Date().getFullYear()}
              onChange={(e) => {
                const year = Number(e.target.value);
                const q = value.quarter ?? "Q1";
                const r = computeQuarter(q, year);
                onChange({ type, quarter: q, year, ...r });
              }}
            />
          </div>
        </div>
      )}

      {type === "YEARLY" && (
        <div>
          <Label>Year</Label>
          <Input
            type="number"
            value={value.year ?? new Date().getFullYear()}
            onChange={(e) => {
              const year = Number(e.target.value);
              const start = startOfYear(new Date(year, 0, 1));
              const end = endOfYear(start);
              onChange({
                type,
                year,
                from: start.toISOString().split("T")[0],
                to: end.toISOString().split("T")[0],
              });
            }}
          />
        </div>
      )}

      {type === "CUSTOM" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>From</Label>
            <Input
              type="date"
              value={value.from ?? ""}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
            />
          </div>
          <div>
            <Label>To</Label>
            <Input
              type="date"
              value={value.to ?? ""}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
