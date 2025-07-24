"use client";

import React, { useState, useRef } from "react";
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

import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SystemAutoHRReports from "./SystemAutoHRReports";
import SavedReportsModal from "./SavedReportsModal";
import { useRouter } from "next/navigation";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const years = Array.from(
  { length: 20 },
  (_, i) => new Date().getFullYear() - i
);
const months = Array.from({ length: 12 }, (_, i) =>
  format(new Date(0, i), "MMMM")
);

const reportTypes = {
  review: ["Employee Review", "Client Review"],
  EVV: [
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
  Employee: [
    "Hours Worked Summary",
    "Visit Log",
    "Office Hours",
    "Mileage",
    "Schedules",
    "Attributes",
  ],
  FVV: ["Assignment", "Call Listing", "Active Employees"],
  Client: [
    "Schedules",
    "Visit Log",
    "Hours Worked",
    "Visit Summary",
    "Active Client Contacts",
    "Active Clients",
    "Client Address Listing",
  ],
  Billing: ["Visit Verification Status"],
  Authorization: [
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
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const calendarRef = useRef<any>(null);

  const openCalendar = () => {
    if (calendarRef.current) {
      calendarRef.current.setOpen(true);
    }
  };

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
          <Button variant="outline" onClick={() => setShowModal(true)}>
            View Saved Reports
          </Button>

          <SavedReportsModal
            open={showModal}
            onClose={() => setShowModal(false)}
            reports={[
              {
                id: "1",
                fileName: "Client_Visit_Summary.pdf",
                reportType: "Client",
                savedDate: "07/21/2025",
              },
              {
                id: "2",
                fileName: "EVV_Status_Export.csv",
                reportType: "EVV",
                savedDate: "07/19/2025",
              },
            ]}
            onView={(id) => console.log("View", id)}
            onDownload={(id) => console.log("Download", id)}
            onDelete={(id) => console.log("Delete", id)}
          />

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

          {/* Dynamic Date Filters */}
          {reportDateType === "daily" && (
            <div>
              <label className="block text-sm font-medium">Date</label>
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  customInput={<Input readOnly />}
                  dateFormat="MM/dd/yyyy"
                />
                <Button variant="ghost" type="button" onClick={openCalendar}>
                  <CalendarIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {reportDateType === "weekly" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  customInput={<Input readOnly />}
                  dateFormat="MM/dd/yyyy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Date</label>
                <Input
                  readOnly
                  value={
                    startDate
                      ? format(
                          new Date(startDate.getTime() + 6 * 86400000),
                          "MM/dd/yyyy"
                        )
                      : ""
                  }
                />
              </div>
            </div>
          )}

          {reportDateType === "monthly" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Month</label>
                <Select
                  onValueChange={(month) =>
                    setStartDate(
                      new Date(new Date().getFullYear(), months.indexOf(month))
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium">Year</label>
                <Select
                  onValueChange={(year) =>
                    setStartDate(
                      new Date(Number(year), startDate?.getMonth() ?? 0)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {reportDateType === "quarterly" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Quarter</label>
                <Select onValueChange={(q) => setReportName(q)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    {quarters.map((q) => (
                      <SelectItem key={q} value={q}>
                        {q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium">Year</label>
                <Select
                  onValueChange={(year) =>
                    setStartDate(new Date(Number(year), 0))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {reportDateType === "yearly" && (
            <div>
              <label className="block text-sm font-medium">Year</label>
              <Select
                onValueChange={(year) =>
                  setStartDate(new Date(Number(year), 0))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {reportDateType === "specific date range" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">From</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  customInput={<Input readOnly />}
                  dateFormat="MM/dd/yyyy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">To</label>
                <DatePicker
                  selected={date}
                  onChange={(date) => setDate(date!)}
                  customInput={<Input readOnly />}
                  dateFormat="MM/dd/yyyy"
                />
              </div>
            </div>
          )}

          {/* Additional Filters Based on Report Type */}
          {(reportType === "Employee" ||
            reportType === "Client" ||
            reportType === "EVV") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {(reportType === "Employee" || reportType === "EVV") && (
                <Input placeholder="Search Employee Name or ID" />
              )}
              {(reportType === "Client" || reportType === "EVV") && (
                <Input placeholder="Search Client Name or ID" />
              )}
            </div>
          )}

          {(reportType === "Client" ||
            reportType === "FVV" ||
            reportType === "Authorization" ||
            reportType === "EVV") && (
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
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => router.push("/dashboard/reports/generated_report")}
            >
              Run Report
            </Button>
          </div>
        </CardContent>
      </Card>
      <SystemAutoHRReports />
    </div>
  );
}
