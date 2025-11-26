"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, subDays } from "date-fns";

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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon, AlertTriangle } from "lucide-react";

import SystemAutoHRReports from "./SystemAutoHRReports";
import SavedReportsModal from "./SavedReportsModal";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

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
    "Compliance Statistics", // <- our focus
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

type FiltersResponse = {
  agency: { id: string; name: string; code: string } | null;
  clients: { id: string; name: string; clientID: string; medicaidID: string }[];
  employees: {
    id: string;
    employeeID: string;
    firstName: string;
    lastName: string;
    name: string;
  }[];
  services: { id: string; name: string; code: string }[];
  payers: { id: string; payerName: string; medicaidID: string }[];
  programs: { id: string; name: string | null }[];
};

function combineDateAndTime(date: Date, time: string): Date {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  const combined = new Date(date);
  combined.setHours(h || 0, m || 0, 0, 0);
  return combined;
}

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reportType, setReportType] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportDateType, setReportDateType] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [showModal, setShowModal] = useState(false);

  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");

  const calendarRef = useRef<any>(null);

  const [filtersData, setFiltersData] = useState<FiltersResponse | null>(null);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [medicaidFilter, setMedicaidFilter] = useState<string>("");

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedPayerIds, setSelectedPayerIds] = useState<string[]>([]);
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);

  const [evvComplianceFromAlert, setEvvComplianceFromAlert] = useState(false);

  const openCalendar = () => {
    if (calendarRef.current) {
      calendarRef.current.setOpen(true);
    }
  };

  // Load filters from backend
  useEffect(() => {
    async function loadFilters() {
      setLoadingFilters(true);
      try {
        const user = await getLoggedInUser();
        if (!user?.agency?.id) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reports/${user.agency.id}/filters`
        );
        const data = await res.json();
        setFiltersData(data);
      } catch (e) {
        console.error("Failed to load report filters", e);
      } finally {
        setLoadingFilters(false);
      }
    }
    loadFilters();
  }, []);

  // If navigated from HR alert: pre-configure EVV Compliance report
  useEffect(() => {
    const r = searchParams.get("report");
    if (r === "evv-compliance") {
      const today = new Date();
      const from = subDays(today, 366);

      setReportType("EVV");
      setReportName("Compliance Statistics");
      setReportDateType("specific date range");
      setStartDate(from);
      setDate(today);
      setFromTime("00:00");
      setToTime("23:59");
      setEvvComplianceFromAlert(true);
    }
  }, [searchParams]);

  const isEvvCompliance =
    reportType === "EVV" && reportName === "Compliance Statistics";

  const handleMultiSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    setter: (ids: string[]) => void
  ) => {
    const values = Array.from(event.target.selectedOptions).map(
      (opt) => opt.value
    );
    setter(values);
  };

  const handleRunReport = async () => {
    const user = await getLoggedInUser();
    if (!user?.agency?.id) return;

    if (!startDate || !date) {
      alert("Please select a From and To date");
      return;
    }

    // For now we only fully implement EVV Compliance here
    if (isEvvCompliance) {
      const from = combineDateAndTime(startDate, fromTime);
      const to = combineDateAndTime(date, toTime);

      const params = new URLSearchParams({
        type: "EVV_COMPLIANCE",
        from: from.toISOString(),
        to: to.toISOString(),
      });

      if (selectedEmployeeId) params.set("employeeId", selectedEmployeeId);
      if (selectedClientId) params.set("clientId", selectedClientId);
      if (medicaidFilter) params.set("medicaidId", medicaidFilter);

      router.push(`/dashboard/reports/generated_report?${params.toString()}`);
    } else {
      // TODO: handle other report types later
      alert("Only EVV → Compliance Statistics is wired to backend right now.");
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
          {/* Banner if navigated from HR Alert */}
          {evvComplianceFromAlert && (
            <div className="flex items-start gap-2 border border-yellow-300 bg-yellow-50 text-yellow-800 px-3 py-2 rounded-md text-sm">
              <AlertTriangle className="w-4 h-4 mt-[2px]" />
              <p>
                EVV compliance has been low. Review and run this pre-filled
                report to see which visits are impacting your compliance.
              </p>
            </div>
          )}

          {/* Saved Reports Button (still mock – can wire later) */}
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
              <Select
                value={reportType}
                onValueChange={(value) => {
                  setReportType(value);
                  setReportName("");
                }}
              >
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
              <Select value={reportDateType} onValueChange={setReportDateType}>
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
              <Select
                value={reportName}
                onValueChange={setReportName}
                disabled={!reportType}
              >
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

          {/* Dynamic Date Filters (same as before, just using state) */}
          {reportDateType === "daily" && (
            <div>
              <label className="block text-sm font-medium">Date</label>
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={startDate}
                  onChange={(d) => setStartDate(d)}
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
                  onChange={(d) => setStartDate(d)}
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
                  onChange={(d) => setStartDate(d)}
                  customInput={<Input readOnly />}
                  dateFormat="MM/dd/yyyy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">To</label>
                <DatePicker
                  selected={date}
                  onChange={(d) => setDate(d)}
                  customInput={<Input readOnly />}
                  dateFormat="MM/dd/yyyy"
                />
              </div>
            </div>
          )}

          {/* Time-of-day filters for EVV reports (defaults 12:00am–11:59pm) */}
          {isEvvCompliance && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">From Time</label>
                <Input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">To Time</label>
                <Input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Employee / Client / Medicaid filters */}
          {(reportType === "Employee" ||
            reportType === "Client" ||
            reportType === "EVV") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {(reportType === "Employee" || reportType === "EVV") && (
                <div>
                  <label className="block text-sm font-medium">Employee</label>
                  <select
                    className="border rounded-md w-full p-2 text-sm"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    disabled={loadingFilters || !filtersData}
                  >
                    <option value="">All Employees</option>
                    {filtersData?.employees.map((e) => (
                      <option key={e.id} value={e.employeeID}>
                        {e.firstName} {e.lastName} ({e.employeeID})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {(reportType === "Client" || reportType === "EVV") && (
                <div>
                  <label className="block text-sm font-medium">Client</label>
                  <select
                    className="border rounded-md w-full p-2 text-sm"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    disabled={loadingFilters || !filtersData}
                  >
                    <option value="">All Clients</option>
                    {filtersData?.clients.map((c) => (
                      <option key={c.id} value={c.clientID}>
                        {c.name} ({c.clientID})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {(reportType === "Client" ||
            reportType === "FVV" ||
            reportType === "Authorization" ||
            reportType === "EVV") && (
            <div className="mt-4">
              <label className="block text-sm font-medium">
                Medicaid ID (optional)
              </label>
              <Input
                placeholder="Enter Medicaid ID"
                value={medicaidFilter}
                onChange={(e) => setMedicaidFilter(e.target.value)}
              />
            </div>
          )}

          {/* Payer / Program / Service multi-select (hidden for EVV Compliance) */}
          {!isEvvCompliance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium">Payers</label>
                <select
                  multiple
                  className="border rounded-md w-full p-2 text-sm h-24"
                  value={selectedPayerIds}
                  onChange={(e) =>
                    handleMultiSelectChange(e, setSelectedPayerIds)
                  }
                  disabled={loadingFilters || !filtersData}
                >
                  {filtersData?.payers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.payerName} ({p.medicaidID})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Programs</label>
                <select
                  multiple
                  className="border rounded-md w-full p-2 text-sm h-24"
                  value={selectedProgramIds}
                  onChange={(e) =>
                    handleMultiSelectChange(e, setSelectedProgramIds)
                  }
                  disabled={loadingFilters || !filtersData}
                >
                  {filtersData?.programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name ?? "Unnamed Program"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Services</label>
                <select
                  multiple
                  className="border rounded-md w-full p-2 text-sm h-24"
                  value={selectedServiceIds}
                  onChange={(e) =>
                    handleMultiSelectChange(e, setSelectedServiceIds)
                  }
                  disabled={loadingFilters || !filtersData}
                >
                  {filtersData?.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleRunReport}
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
// "use client";

// import React, { useState, useRef } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Checkbox } from "@/components/ui/checkbox";
// import { format } from "date-fns";

// import { CalendarIcon } from "lucide-react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import SystemAutoHRReports from "./SystemAutoHRReports";
// import SavedReportsModal from "./SavedReportsModal";
// import { useRouter } from "next/navigation";

// const quarters = ["Q1", "Q2", "Q3", "Q4"];
// const years = Array.from(
//   { length: 20 },
//   (_, i) => new Date().getFullYear() - i
// );
// const months = Array.from({ length: 12 }, (_, i) =>
//   format(new Date(0, i), "MMMM")
// );

// const reportTypes = {
//   review: ["Employee Review", "Client Review"],
//   EVV: [
//     "Auto Verification Report Detail",
//     "Auto Verification Report Summary",
//     "Detail Visit Status",
//     "Compliance Statistics",
//     "Full Visit Export",
//     "Mileage",
//     "Summary Visit Status",
//     "Exceptions",
//     "Unresolved Late & Missed Visits",
//     "Visit Capture Statistics",
//     "Visit Verification Activity Summary",
//     "Call Summary",
//     "GPS Exceptions",
//     "Visit Listing",
//   ],
//   Employee: [
//     "Hours Worked Summary",
//     "Visit Log",
//     "Office Hours",
//     "Mileage",
//     "Schedules",
//     "Attributes",
//   ],
//   FVV: ["Assignment", "Call Listing", "Active Employees"],
//   Client: [
//     "Schedules",
//     "Visit Log",
//     "Hours Worked",
//     "Visit Summary",
//     "Active Client Contacts",
//     "Active Clients",
//     "Client Address Listing",
//   ],
//   Billing: ["Visit Verification Status"],
//   Authorization: [
//     "Authorization vs Actual Used by Client",
//     "Authorizations",
//     "Clients without Authorizations",
//     "Expiring Authorizations",
//   ],
// };

// const reportDateTypes = [
//   "Daily",
//   "Weekly",
//   "Monthly",
//   "Quarterly",
//   "Yearly",
//   "Specific Date Range",
// ];

// export default function ReportsPage() {
//   const [reportType, setReportType] = useState("");
//   const [reportName, setReportName] = useState("");
//   const [reportDateType, setReportDateType] = useState("");
//   const [date, setDate] = useState<Date | undefined>(new Date());
//   const [showModal, setShowModal] = useState(false);
//   const router = useRouter();

//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const calendarRef = useRef<any>(null);

//   const openCalendar = () => {
//     if (calendarRef.current) {
//       calendarRef.current.setOpen(true);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Reports</CardTitle>
//           <p className="text-sm text-gray-600">
//             Generate or view saved reports
//           </p>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {/* Saved Reports Button */}
//           <Button variant="outline" onClick={() => setShowModal(true)}>
//             View Saved Reports
//           </Button>

//           <SavedReportsModal
//             open={showModal}
//             onClose={() => setShowModal(false)}
//             reports={[
//               {
//                 id: "1",
//                 fileName: "Client_Visit_Summary.pdf",
//                 reportType: "Client",
//                 savedDate: "07/21/2025",
//               },
//               {
//                 id: "2",
//                 fileName: "EVV_Status_Export.csv",
//                 reportType: "EVV",
//                 savedDate: "07/19/2025",
//               },
//             ]}
//             onView={(id) => console.log("View", id)}
//             onDownload={(id) => console.log("Download", id)}
//             onDelete={(id) => console.log("Delete", id)}
//           />

//           {/* Filters */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium">Report Type</label>
//               <Select onValueChange={setReportType}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select report type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {Object.keys(reportTypes).map((type) => (
//                     <SelectItem key={type} value={type}>
//                       {type.charAt(0).toUpperCase() + type.slice(1)}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Report Date</label>
//               <Select onValueChange={setReportDateType}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select report date type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {reportDateTypes.map((type) => (
//                     <SelectItem key={type} value={type.toLowerCase()}>
//                       {type}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Report Name</label>
//               <Select onValueChange={setReportName} disabled={!reportType}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select report name" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {reportType &&
//                     reportTypes[reportType as keyof typeof reportTypes].map(
//                       (name) => (
//                         <SelectItem key={name} value={name}>
//                           {name}
//                         </SelectItem>
//                       )
//                     )}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Dynamic Date Filters */}
//           {reportDateType === "daily" && (
//             <div>
//               <label className="block text-sm font-medium">Date</label>
//               <div className="flex items-center gap-2">
//                 <DatePicker
//                   selected={startDate}
//                   onChange={(date) => setStartDate(date)}
//                   customInput={<Input readOnly />}
//                   dateFormat="MM/dd/yyyy"
//                 />
//                 <Button variant="ghost" type="button" onClick={openCalendar}>
//                   <CalendarIcon className="h-5 w-5" />
//                 </Button>
//               </div>
//             </div>
//           )}

//           {reportDateType === "weekly" && (
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium">Start Date</label>
//                 <DatePicker
//                   selected={startDate}
//                   onChange={(date) => setStartDate(date)}
//                   customInput={<Input readOnly />}
//                   dateFormat="MM/dd/yyyy"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">End Date</label>
//                 <Input
//                   readOnly
//                   value={
//                     startDate
//                       ? format(
//                           new Date(startDate.getTime() + 6 * 86400000),
//                           "MM/dd/yyyy"
//                         )
//                       : ""
//                   }
//                 />
//               </div>
//             </div>
//           )}

//           {reportDateType === "monthly" && (
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium">Month</label>
//                 <Select
//                   onValueChange={(month) =>
//                     setStartDate(
//                       new Date(new Date().getFullYear(), months.indexOf(month))
//                     )
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select month" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {months.map((month) => (
//                       <SelectItem key={month} value={month}>
//                         {month}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Year</label>
//                 <Select
//                   onValueChange={(year) =>
//                     setStartDate(
//                       new Date(Number(year), startDate?.getMonth() ?? 0)
//                     )
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select year" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {years.map((year) => (
//                       <SelectItem key={year} value={year.toString()}>
//                         {year}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           )}

//           {reportDateType === "quarterly" && (
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium">Quarter</label>
//                 <Select onValueChange={(q) => setReportName(q)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select quarter" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {quarters.map((q) => (
//                       <SelectItem key={q} value={q}>
//                         {q}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Year</label>
//                 <Select
//                   onValueChange={(year) =>
//                     setStartDate(new Date(Number(year), 0))
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select year" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {years.map((year) => (
//                       <SelectItem key={year} value={year.toString()}>
//                         {year}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           )}

//           {reportDateType === "yearly" && (
//             <div>
//               <label className="block text-sm font-medium">Year</label>
//               <Select
//                 onValueChange={(year) =>
//                   setStartDate(new Date(Number(year), 0))
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select year" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {years.map((year) => (
//                     <SelectItem key={year} value={year.toString()}>
//                       {year}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           )}

//           {reportDateType === "specific date range" && (
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium">From</label>
//                 <DatePicker
//                   selected={startDate}
//                   onChange={(date) => setStartDate(date)}
//                   customInput={<Input readOnly />}
//                   dateFormat="MM/dd/yyyy"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">To</label>
//                 <DatePicker
//                   selected={date}
//                   onChange={(date) => setDate(date!)}
//                   customInput={<Input readOnly />}
//                   dateFormat="MM/dd/yyyy"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Additional Filters Based on Report Type */}
//           {(reportType === "Employee" ||
//             reportType === "Client" ||
//             reportType === "EVV") && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//               {(reportType === "Employee" || reportType === "EVV") && (
//                 <Input placeholder="Search Employee Name or ID" />
//               )}
//               {(reportType === "Client" || reportType === "EVV") && (
//                 <Input placeholder="Search Client Name or ID" />
//               )}
//             </div>
//           )}

//           {(reportType === "Client" ||
//             reportType === "FVV" ||
//             reportType === "Authorization" ||
//             reportType === "EVV") && (
//             <div className="mt-4">
//               <Input placeholder="Enter Medicaid ID (if applicable)" />
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//             <Input placeholder="Select Payer" />
//             <Input placeholder="Select Program" />
//             <Input placeholder="Select Service" />
//           </div>

//           {/* Buttons */}
//           <div className="flex justify-end gap-4 mt-6">
//             <Button variant="outline">Cancel</Button>
//             <Button
//               className="bg-blue-600 text-white hover:bg-blue-700"
//               onClick={() => router.push("/dashboard/reports/generated_report")}
//             >
//               Run Report
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//       <SystemAutoHRReports />
//     </div>
//   );
// }
