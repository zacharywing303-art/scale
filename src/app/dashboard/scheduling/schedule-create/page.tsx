"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner"; //
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { eachDayOfInterval, format } from "date-fns";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TimePicker } from "@/components/TimePicker";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function buildDateTime(baseDate: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(h, m, 0, 0);
  return dt;
}

function normalizeStartEnd(baseDate: Date, startTime: string, endTime: string) {
  const start = buildDateTime(baseDate, startTime);
  const end = buildDateTime(baseDate, endTime);
  if (end <= start) end.setDate(end.getDate() + 1);
  return { start, end };
}

function generateSchedulesInRange(
  rangeStart: Date,
  rangeEnd: Date,
  weekdays: string[],
  startTime: string,
  endTime: string
) {
  const schedules: { start: Date; end: Date }[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const start = new Date(rangeStart);
  const end = new Date(rangeEnd);

  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + dayMs)) {
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    if (weekdays.includes(dayName)) {
      const normalized = normalizeStartEnd(d, startTime, endTime);
      if (normalized) schedules.push(normalized);
    }
  }

  return schedules;
}

export default function CreateSchedulePage() {
  const [type, setType] = useState<"office" | "visit" | "facility" | "">("");
  const [oneDay, setOneDay] = useState(true);
  const [recurring, setRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<
    "WEEKLY" | "BIWEEKLY" | ""
  >("");

  const [rangeStart, setRangeStart] = useState<Date | undefined>();
  const [rangeEnd, setRangeEnd] = useState<Date | undefined>();
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const [client, setClient] = useState<string | null>(null);
  const [service, setService] = useState("");
  const [authorization, setAuthorization] = useState("");
  const [groupVisit, setGroupVisit] = useState(false);
  const [visitEmployees, setVisitEmployees] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Office-specific
  const [reason, setReason] = useState("");
  const [officeOpenShift, setOfficeOpenShift] = useState(false);
  const [officeEmployees, setOfficeEmployees] = useState<string[]>([]);

  // Visit-specific

  // Shared
  const [reschedule, setReschedule] = useState(false);
  const [selectedMissed, setSelectedMissed] = useState<string[]>([]);

  // ✅ Live data from API
  const [groupVisitCode, setGroupVisitCode] = useState<string | null>(null);
  const [officeStaffOnly, setOfficeStaffOnly] = useState(false);
  const [facilityStaffOnly, setFacilityStaffOnly] = useState(false);

  const user = getLoggedInUser();
  // const today = new Date();
  // today.setHours(0, 0, 0, 0);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const [invalidDate, setInvalidDate] = useState(false); // ✅ track invalid selections

  const [showAssignedOnly, setShowAssignedOnly] = useState(false);
  const [clientAssignedEmployees, setClientAssignedEmployees] = useState<
    string[]
  >([]);

  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const weekdaysList = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // const dummyMissedShifts = ["Visit with Mr. A (6/10)", "Office shift (6/5)"];
  const [missedShifts, setMissedShifts] = useState<any[]>([]);

  // Load clients, employees, services
  useEffect(() => {
    async function fetchData() {
      if (!user?.agency?.id) return;
      try {
        const [clientRes, employeeRes, serviceRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/clients/agency/${user.agency.id}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/employees/agency/${user.agency.id}`
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`),
        ]);
        const [clientData, employeeData, serviceData] = await Promise.all([
          clientRes.json(),
          employeeRes.json(),
          serviceRes.json(),
        ]);
        setClients(clientData);
        setEmployees(employeeData);
        setServices(serviceData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, [user]);

  const handleCheckboxChange = (
    value: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  };

  const handleEmployeeSelect = (id: string) => {
    if (groupVisit) {
      setVisitEmployees((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setVisitEmployees([id]);
    }
  };

  const canSubmit = () => {
    if (invalidDate || !type || !startTime || !endTime) return false;

    // per-type requirements
    if (type === "visit") {
      if (!client || !service) return false;
      if (groupVisit && visitEmployees.length === 0) return false;
      if (!groupVisit && (!visitEmployees[0] || visitEmployees.length > 1))
        return false;
    } else {
      // office/facility must have at least one employee
      if (visitEmployees.length === 0) return false;
    }

    if (oneDay) {
      return !!selectedDate && selectedDate > new Date();
    }
    if (rangeStart && rangeEnd && weekdays.length > 0) {
      return rangeStart > new Date() && rangeEnd > new Date();
    }
    return false;
  };

  const getSelectedDates = (): string[] => {
    if (oneDay && selectedDate) {
      return [selectedDate.toISOString()];
    }
    if (rangeStart && rangeEnd) {
      const allDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
      return allDays
        .filter((d) =>
          weekdays.includes(d.toLocaleDateString("en-US", { weekday: "long" }))
        )
        .map((d) => d.toISOString());
    }
    return [];
  };

  const filteredEmployees = employees.filter((e) => {
    if (officeStaffOnly) return e.officeStaff;
    if (facilityStaffOnly) return e.facilityStaff;
    if (showAssignedOnly && clientAssignedEmployees.length) {
      return clientAssignedEmployees.includes(e.id);
    }
    return true;
  });

  const generateGroupVisitCode = () => {
    const code = `GV-${Math.floor(100000 + Math.random() * 900000)}`;
    setGroupVisitCode(code);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);

      const selectedDates = getSelectedDates();
      if (selectedDates.length === 0) {
        alert("Please select valid date(s)");
        return;
      }

      const baseSchedule: any = {
        scheduleType: type,
        // visit-only fields
        clientID: type === "visit" ? client || null : null,
        clientMedicaidId: type === "visit" ? "TEMP123" : null,
        serviceId: type === "visit" ? service || null : null,
        authorizations: type === "visit" ? authorization || null : null,

        // office/facility reason (optional)
        officeReason: type !== "visit" ? reason || null : null,

        eventCode: "EVT001",
        authorizationBillUnitType: "Hourly",
        eventStatus: "Confirmed",
        startTime: buildDateTime(new Date(), startTime).toISOString(),
        endTime: buildDateTime(new Date(), endTime).toISOString(),
        comments,
        agencyID: user?.agency?.id,
      };

      const isBatch = !oneDay || recurring;
      const apiUrl = isBatch
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/batch`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/schedules`;

      // employee selection logic per type
      const selectedEmployeeIDs =
        type === "visit"
          ? groupVisit
            ? visitEmployees
            : [visitEmployees[0]]
          : visitEmployees; // office/facility support multi employees always

      const payload: any = isBatch
        ? {
            baseSchedule,
            selectedDates,
            groupVisit: type === "visit" ? groupVisit : false,
            employeeIDs: selectedEmployeeIDs,
            recurring,
            recurringFrequency: recurring ? recurringFrequency : undefined,
          }
        : {
            ...baseSchedule,
            eventDate: selectedDate?.toISOString(),
            startTime: buildDateTime(selectedDate!, startTime).toISOString(),
            endTime: buildDateTime(selectedDate!, endTime).toISOString(),
            groupVisit: type === "visit" ? groupVisit : false,
            employeeIDs: selectedEmployeeIDs, // one or many
            employeeID:
              type === "visit" && !groupVisit
                ? visitEmployees[0] || null
                : null,
          };

      // ✅ Include groupVisitCode if it's a group visit
      if (type === "visit" && groupVisit && groupVisitCode) {
        payload.groupVisitCode = groupVisitCode;
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create schedule(s)");
      alert("✅ Schedule(s) created successfully!");
      window.location.href = "/dashboard/scheduling/schedule-view";
    } catch (err) {
      console.error(err);
      alert("❌ Error creating schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute
      allowedRoles={["AGENCY_ADMIN"]}
      permission="Create/Edit Schedule"
    >
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Create Schedule</h1>

        {/* Schedule Type */}
        <div>
          <Label className="mb-1">
            Schedule Type<span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={(v) => setType(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="visit">Visit</SelectItem>
              <SelectItem value="facility">Facility</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === "visit" && (
          <>
            <Label>Client *</Label>
            <Select
              onValueChange={async (clientId) => {
                setClient(clientId);
                setShowAssignedOnly(false); // reset toggle

                try {
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${clientId}`
                  );
                  const data = await res.json();

                  if (data?.assignedEmployees?.length) {
                    setClientAssignedEmployees(
                      data.assignedEmployees.map((e: any) => e.id)
                    );
                  } else {
                    setClientAssignedEmployees([]);
                  }
                } catch (err) {
                  console.error("Failed to load assigned employees:", err);
                  setClientAssignedEmployees([]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {/* One or Multiple */}
        <div className="flex items-center gap-3 mt-4">
          <Label>Apply To:</Label>
          <Select
            onValueChange={(v) => {
              const single = v === "one";
              setOneDay(single);
              if (single) setRecurring(false);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one">One Day</SelectItem>
              <SelectItem value="multiple">Multiple Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recurring Options */}
        {!oneDay && (
          <div className="flex gap-3 mt-2 items-center">
            <Checkbox
              checked={recurring}
              onCheckedChange={(v) => setRecurring(!!v)}
            />
            <Label>Recurring?</Label>
            {recurring && (
              <Select onValueChange={(v) => setRecurringFrequency(v as any)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="BIWEEKLY">Every Other Week</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Date Selector */}
        {oneDay ? (
          <div>
            <Label>
              Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (!date) return;
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    if (date <= now) {
                      toast.warning("You cannot select today or a past date.");
                      setInvalidDate(true);
                      setSelectedDate(undefined);
                    } else {
                      setSelectedDate(date);
                      setInvalidDate(false);
                    }
                  }}
                  fromDate={tomorrow}
                />
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <>
            <Label>
              Select Weekdays <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {weekdaysList.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`px-3 py-1 rounded border ${
                    weekdays.includes(day)
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() =>
                    handleCheckboxChange(day, weekdays, setWeekdays)
                  }
                >
                  {day}
                </button>
              ))}
            </div>
            {/* Range Start */}
            <div>
              <Label>
                From <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[220px] justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rangeStart ? format(rangeStart, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={rangeStart}
                    onSelect={(date) => {
                      if (!date) return;
                      const now = new Date();
                      now.setHours(0, 0, 0, 0);
                      if (date <= now) {
                        toast.warning("Start date cannot be today or earlier.");
                        setInvalidDate(true);
                        setRangeStart(undefined);
                        setRangeEnd(undefined);
                        return;
                      }
                      setRangeStart(date);
                      const autoEnd = new Date(date);
                      autoEnd.setDate(autoEnd.getDate() + 6); // 7-day range
                      setRangeEnd(autoEnd);
                      setInvalidDate(false);
                    }}
                    fromDate={tomorrow}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Range End */}
            <div>
              <Label>
                To <span className="text-red-500">*</span>
              </Label>
              <Button
                variant="outline"
                className="w-[220px] justify-start"
                disabled
                title={
                  rangeStart
                    ? "End date is auto-calculated from the start date"
                    : "Pick a start date first"
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {rangeEnd
                  ? format(rangeEnd, "PPP")
                  : rangeStart
                  ? format(
                      new Date(rangeStart.getTime() + 6 * 24 * 60 * 60 * 1000),
                      "PPP"
                    )
                  : "Pick start date first"}
              </Button>
            </div>
          </>
        )}

        {/* Time */}
        <div className="flex gap-4 mt-4">
          <TimePicker
            label="Start Time "
            value={startTime}
            onChange={setStartTime}
          />
          <TimePicker
            label="End Time *"
            value={endTime}
            onChange={setEndTime}
          />
        </div>

        {/* Visit Only: Service + Employees */}
        {type === "visit" ? (
          <>
            <Label className="mt-4">
              Service <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={setService}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3 mt-3">
              <Checkbox
                checked={groupVisit}
                onCheckedChange={(v) => {
                  const val = !!v;
                  setGroupVisit(val);
                  if (val) generateGroupVisitCode();
                  else setGroupVisitCode(null);
                }}
              />
              <Label>Group Visit?</Label>
              {groupVisit && groupVisitCode && (
                <span className="text-sm text-muted-foreground">
                  Code: <strong>{groupVisitCode}</strong>
                </span>
              )}
            </div>

            {clientAssignedEmployees.length > 0 && (
              <div className="flex items-center gap-3 mt-2">
                <Checkbox
                  checked={showAssignedOnly}
                  onCheckedChange={(v) => setShowAssignedOnly(!!v)}
                />
                <Label>Show only assigned employees for client</Label>
              </div>
            )}

            <Label className="mt-3">
              {groupVisit ? "Select Employees" : "Assign Employee"}
            </Label>

            {filteredEmployees.length === 0 ? (
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                <span>No employees currently.</span>
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 underline"
                  onClick={() => (window.location.href = "/hr/employees/page")}
                >
                  Create one?
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    className={`px-3 py-1 rounded border ${
                      visitEmployees.includes(emp.id)
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                    onClick={() => handleEmployeeSelect(emp.id)}
                  >
                    {emp.name}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Office / Facility */
          <>
            <Label className="mt-4">Reason (optional)</Label>
            <Input
              placeholder={
                type === "office"
                  ? "e.g., Staff meeting"
                  : "e.g., Facility coverage"
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <Label className="mt-3">Assign Employees</Label>
            {filteredEmployees.length === 0 ? (
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                <span>No employees currently.</span>
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 underline"
                  onClick={() => (window.location.href = "/hr/employees/page")}
                >
                  Create one?
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    className={`px-3 py-1 rounded border ${
                      visitEmployees.includes(emp.id)
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                    onClick={() =>
                      setVisitEmployees((prev) =>
                        prev.includes(emp.id)
                          ? prev.filter((x) => x !== emp.id)
                          : [...prev, emp.id]
                      )
                    }
                  >
                    {emp.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <Label className="mt-4 block">Comments</Label>
        <Textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />

        {/* PREVIEW BUTTON */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogTrigger asChild>
            <Button disabled={!canSubmit() || loading} className="mt-6 w-full">
              Generate Schedule Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Preview</DialogTitle>
              <DialogDescription>
                Review all generated schedule entries before confirming.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-y-1">
                <div>
                  <strong>Type:</strong>{" "}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
                <div>
                  <strong>Recurring:</strong>{" "}
                  {recurring
                    ? `${recurringFrequency.charAt(0)}${recurringFrequency
                        .slice(1)
                        .toLowerCase()}`
                    : "No"}
                </div>

                {oneDay ? (
                  <div className="col-span-2">
                    <strong>Date:</strong>{" "}
                    {selectedDate ? format(selectedDate, "PPP") : "N/A"}
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>Range Start:</strong>{" "}
                      {rangeStart ? format(rangeStart, "PPP") : "—"}
                    </div>
                    <div>
                      <strong>Range End:</strong>{" "}
                      {rangeEnd ? format(rangeEnd, "PPP") : "—"}
                    </div>
                    <div className="col-span-2">
                      <strong>Weekdays:</strong>{" "}
                      {weekdays.length ? weekdays.join(", ") : "None"}
                    </div>
                  </>
                )}

                <div>
                  <strong>Start Time:</strong>{" "}
                  {(() => {
                    if (!startTime) return "N/A";
                    const dt = buildDateTime(new Date(), startTime);
                    return !isNaN(dt.getTime()) ? format(dt, "hh:mm a") : "N/A";
                  })()}
                </div>
                <div>
                  <strong>End Time:</strong>{" "}
                  {(() => {
                    if (!endTime) return "N/A";
                    const dt = buildDateTime(new Date(), endTime);
                    return !isNaN(dt.getTime()) ? format(dt, "hh:mm a") : "N/A";
                  })()}
                </div>

                {type === "visit" && (
                  <>
                    <div>
                      <strong>Client:</strong>{" "}
                      {clients.find((c) => c.id === client)?.name || "N/A"}
                    </div>
                    <div>
                      <strong>Service:</strong>{" "}
                      {services.find((s) => s.id === service)?.name || "N/A"}
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <strong>Employees:</strong>{" "}
                  {visitEmployees
                    .map((id) => employees.find((e) => e.id === id)?.name)
                    .join(", ") || "None"}
                </div>
              </div>

              <div className="border-t pt-3 mt-2">
                <strong>Generated Schedule Summary:</strong>
                <p className="text-muted-foreground text-xs mb-2">
                  (These are the schedules that will be created)
                </p>

                <div className="max-h-48 overflow-y-auto border rounded-md">
                  <table className="w-full text-xs border-collapse">
                    <thead className="bg-muted text-muted-foreground border-b">
                      <tr>
                        <th className="px-2 py-1 text-left">#</th>
                        <th className="px-2 py-1 text-left">Date</th>
                        <th className="px-2 py-1 text-left">Day</th>
                        <th className="px-2 py-1 text-left">Start Time</th>
                        <th className="px-2 py-1 text-left">End Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const allDates: Date[] = [];

                        // --- 1️⃣ Build base range dates ---
                        if (oneDay && selectedDate) {
                          allDates.push(selectedDate);
                        } else if (rangeStart && rangeEnd) {
                          const days = eachDayOfInterval({
                            start: rangeStart,
                            end: rangeEnd,
                          });
                          for (const d of days) {
                            const dayName = d.toLocaleDateString("en-US", {
                              weekday: "long",
                            });
                            if (weekdays.includes(dayName)) allDates.push(d);
                          }

                          // --- 2️⃣ Add recurrence for entire base range ---
                          if (recurring && recurringFrequency) {
                            const offsetDays =
                              recurringFrequency === "BIWEEKLY" ? 14 : 7;
                            const recurStart = new Date(rangeStart);
                            const recurEnd = new Date(rangeEnd);
                            recurStart.setDate(
                              recurStart.getDate() + offsetDays
                            );
                            recurEnd.setDate(recurEnd.getDate() + offsetDays);

                            const repeatDays = eachDayOfInterval({
                              start: recurStart,
                              end: recurEnd,
                            });
                            for (const d of repeatDays) {
                              const dayName = d.toLocaleDateString("en-US", {
                                weekday: "long",
                              });
                              if (weekdays.includes(dayName)) allDates.push(d);
                            }
                          }
                        }

                        // --- 3️⃣ Sort chronologically ---
                        allDates.sort((a, b) => a.getTime() - b.getTime());

                        // --- 4️⃣ Render ---
                        if (!allDates.length) {
                          return (
                            <tr>
                              <td
                                colSpan={5}
                                className="text-center text-muted-foreground py-3"
                              >
                                No valid dates selected
                              </td>
                            </tr>
                          );
                        }

                        return allDates.map((d, idx) => (
                          <tr
                            key={idx}
                            className="border-b hover:bg-accent/40 transition-colors"
                          >
                            <td className="px-2 py-1">{idx + 1}</td>
                            <td className="px-2 py-1">{format(d, "PPP")}</td>
                            <td className="px-2 py-1">
                              {d.toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                            </td>
                            <td className="px-2 py-1">{startTime}</td>
                            <td className="px-2 py-1">{endTime}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>

                    {/* <tbody>
                      {(() => {
                        // Compute all dates that will be created
                        const allDates: Date[] = [];

                        if (oneDay && selectedDate) {
                          allDates.push(selectedDate);
                        } else if (rangeStart && rangeEnd) {
                          const days = eachDayOfInterval({
                            start: rangeStart,
                            end: rangeEnd,
                          });
                          for (const d of days) {
                            const dayName = d.toLocaleDateString("en-US", {
                              weekday: "long",
                            });
                            if (weekdays.includes(dayName)) allDates.push(d);
                          }

                          // Add recurring instances (weekly/biweekly)
                          if (recurring && recurringFrequency) {
                            const repeatDays = eachDayOfInterval({
                              start: new Date(
                                rangeStart.getTime() +
                                  (recurringFrequency === "WEEKLY" ? 7 : 14) *
                                    24 *
                                    60 *
                                    60 *
                                    1000
                              ),
                              end: new Date(
                                rangeEnd.getTime() +
                                  (recurringFrequency === "WEEKLY" ? 7 : 14) *
                                    24 *
                                    60 *
                                    60 *
                                    1000
                              ),
                            });
                            for (const d of repeatDays) {
                              const dayName = d.toLocaleDateString("en-US", {
                                weekday: "long",
                              });
                              if (weekdays.includes(dayName)) allDates.push(d);
                            }
                          }
                        }

                        if (!allDates.length)
                          return (
                            <tr>
                              <td
                                colSpan={5}
                                className="text-center text-muted-foreground py-3"
                              >
                                No valid dates selected
                              </td>
                            </tr>
                          );

                        return allDates.map((d, idx) => (
                          <tr
                            key={idx}
                            className="border-b hover:bg-accent/40 transition-colors"
                          >
                            <td className="px-2 py-1">{idx + 1}</td>
                            <td className="px-2 py-1">{format(d, "PPP")}</td>
                            <td className="px-2 py-1">
                              {d.toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                            </td>
                            <td className="px-2 py-1">{startTime}</td>
                            <td className="px-2 py-1">{endTime}</td>
                          </tr>
                        ));
                      })()}
                    </tbody> */}
                  </table>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full mt-2"
                >
                  {loading ? "Creating..." : "Confirm & Create Schedule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
