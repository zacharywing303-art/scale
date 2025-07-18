"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

const reportTypes = {
  review: ["Employee Review", "Client Review"],
  evv: [
    "Auto Verification Report Detail",
    "Auto Verification Report Summary",
    "Detail Visit Status",
    "Compliance Statistics",
    "Full Visit Export",
    "Mileage",
    "Summary Visit Status",
    "Exceptions",
    "Unresolved Late & Missed Visits",
    "Visit Capture Statistics",
    "Visit Verification Activity Summary",
    "Call Summary",
    "GPS Exceptions",
    "Visit Listing",
  ],
  employee: [
    "Hours Worked Summary",
    "Visit Log",
    "Office Hours",
    "Mileage",
    "Schedules",
    "Attributes",
  ],
  fvv: ["Assignment", "Call Listing", "Active Employees"],
  client: [
    "Schedules",
    "Visit Log",
    "Hours Worked",
    "Visit Summary",
    "Active Client Contacts",
    "Active Clients",
    "Client Address Listing",
  ],
  billing: ["Visit Verification Status"],
  authorization: [
    "Authorization vs Actual Used by Client",
    "Authorizations",
    "Clients without Authorizations",
    "Expiring Authorizations",
  ],
};

const reportDateTypes = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
  "Specific Date Range",
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportDateType, setReportDateType] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <p className="text-sm text-gray-600">
            Generate or view saved reports
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Saved Reports Button */}
          <Button variant="outline">View Saved Reports</Button>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Report Type</label>
              <Select onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(reportTypes).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Report Date</label>
              <Select onValueChange={setReportDateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report date type" />
                </SelectTrigger>
                <SelectContent>
                  {reportDateTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Report Name</label>
              <Select onValueChange={setReportName} disabled={!reportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report name" />
                </SelectTrigger>
                <SelectContent>
                  {reportType &&
                    reportTypes[reportType as keyof typeof reportTypes].map(
                      (name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      )
                    )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Picker */}
          {reportDateType === "daily" && (
            <div className="mt-4">
              <label className="block text-sm font-medium">Date</label>
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </div>
          )}

          {/* Additional Filters Based on Report Type */}
          {(reportType === "employee" ||
            reportType === "client" ||
            reportType === "evv") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {(reportType === "employee" || reportType === "evv") && (
                <Input placeholder="Search Employee Name or ID" />
              )}
              {(reportType === "client" || reportType === "evv") && (
                <Input placeholder="Search Client Name or ID" />
              )}
            </div>
          )}

          {(reportType === "client" ||
            reportType === "fvv" ||
            reportType === "authorization" ||
            reportType === "evv") && (
            <div className="mt-4">
              <Input placeholder="Enter Medicaid ID (if applicable)" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input placeholder="Select Payer" />
            <Input placeholder="Select Program" />
            <Input placeholder="Select Service" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Run Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
