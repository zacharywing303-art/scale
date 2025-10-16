"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface PayrollFiltersProps {
  payFrequency: string;
  setPayFrequency: (value: string) => void;
  mileageRate: number;
  setMileageRate: (value: number) => void;
  mileageCap: number;
  setMileageCap: (value: number) => void;
  includeVisits: boolean;
  setIncludeVisits: (value: boolean) => void;
  includeFacility: boolean;
  setIncludeFacility: (value: boolean) => void;
  includeOffice: boolean;
  setIncludeOffice: (value: boolean) => void;
  includeMileage: boolean;
  setIncludeMileage: (value: boolean) => void;
}

export default function PayrollFilters({
  payFrequency,
  setPayFrequency,
  mileageRate,
  setMileageRate,
  mileageCap,
  setMileageCap,
  includeVisits,
  setIncludeVisits,
  includeFacility,
  setIncludeFacility,
  includeOffice,
  setIncludeOffice,
  includeMileage,
  setIncludeMileage,
}: PayrollFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      {/* Pay Frequency */}
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300">
          Pay Frequency
        </label>
        <Select onValueChange={setPayFrequency} defaultValue={payFrequency}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Weekly">Weekly</SelectItem>
            <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
            <SelectItem value="First Half">First Half of Month</SelectItem>
            <SelectItem value="Last Half">Last Half of Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mileage Rate */}
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300">
          Mileage Rate ($)
        </label>
        <Input
          type="number"
          value={mileageRate}
          step="0.01"
          onChange={(e) => setMileageRate(parseFloat(e.target.value))}
          className="mt-1"
        />
      </div>

      {/* Mileage Cap */}
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300">
          Mileage Cap (miles)
        </label>
        <Input
          type="number"
          value={mileageCap}
          onChange={(e) => setMileageCap(parseInt(e.target.value))}
          className="mt-1"
        />
      </div>

      {/* Inclusions */}
      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300">
          Include:
        </label>
        <div className="flex flex-col mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span>Visits</span>
            <Switch
              checked={includeVisits}
              onCheckedChange={setIncludeVisits}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Facility</span>
            <Switch
              checked={includeFacility}
              onCheckedChange={setIncludeFacility}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Office</span>
            <Switch
              checked={includeOffice}
              onCheckedChange={setIncludeOffice}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Mileage</span>
            <Switch
              checked={includeMileage}
              onCheckedChange={setIncludeMileage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
