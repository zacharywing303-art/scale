"use client";

import { useState, useEffect } from "react";
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
import { format } from "date-fns";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TimePicker } from "@/components/TimePicker";

function buildDateTime(baseDate: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(h, m, 0, 0);
  return dt;
}

function normalizeStartEnd(
  baseDate: Date,
  startTime: string,
  endTime: string
): { start: Date; end: Date } | null {
  const start = buildDateTime(baseDate, startTime);
  const end = buildDateTime(baseDate, endTime);

  if (end.getTime() === start.getTime()) {
    return null; // Invalid
  }

  if (end < start) {
    end.setDate(end.getDate() + 1); // roll to next day
  }

  return { start, end };
}

export default function CreateSchedulePage() {
  const [type, setType] = useState<"office" | "visit" | "">("");
  const [client, setClient] = useState<string | null>(null);
  const [oneDay, setOneDay] = useState(true);
  const [recurring, setRecurring] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [rangeStart, setRangeStart] = useState<Date | undefined>();
  const [rangeEnd, setRangeEnd] = useState<Date | undefined>();
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Office-specific
  const [reason, setReason] = useState("");
  const [officeOpenShift, setOfficeOpenShift] = useState(false);
  const [officeEmployees, setOfficeEmployees] = useState<string[]>([]);

  // Visit-specific
  const [service, setService] = useState("");
  const [groupVisit, setGroupVisit] = useState(false);
  const [visitEmployees, setVisitEmployees] = useState<string[]>([]);
  const [authorization, setAuthorization] = useState("");

  // Shared
  const [comments, setComments] = useState("");
  const [reschedule, setReschedule] = useState(false);
  const [selectedMissed, setSelectedMissed] = useState<string[]>([]);

  // ✅ Live data from API
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const dummyMissedShifts = ["Visit with Mr. A (6/10)", "Office shift (6/5)"];

  // 🔹 Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, servicesRes, employeesRes] = await Promise.all([
          fetch("http://localhost:5000/api/clients"),
          fetch("http://localhost:5000/api/services"),
          fetch("http://localhost:5000/api/employees"),
        ]);

        const [clientsData, servicesData, employeesData] = await Promise.all([
          clientsRes.json(),
          servicesRes.json(),
          employeesRes.json(),
        ]);

        setClients(clientsData);
        setServices(servicesData);
        setEmployees(employeesData);
      } catch (err) {
        console.error("❌ Error fetching data", err);
      }
    };

    fetchData();
  }, []);

  const canSubmit = () => {
    if (!type) return false;
    if (oneDay) {
      return selectedDate && startTime && endTime;
    } else {
      return (
        weekdays.length > 0 && rangeStart && rangeEnd && startTime && endTime
      );
    }
  };

  const handleCheckboxChange = (
    value: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  };

  const handleEmployeeSelect = (empId: string) => {
    if (groupVisit) {
      // ✅ Allow multiple
      setVisitEmployees((prev) =>
        prev.includes(empId)
          ? prev.filter((id) => id !== empId)
          : [...prev, empId]
      );
    } else {
      // ✅ Only one employee allowed
      setVisitEmployees([empId]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Create Schedule</h2>

      {/* Schedule Type */}
      <div>
        <Label className="mb-1 block">Schedule Type *</Label>
        <Select onValueChange={(val) => setType(val as "office" | "visit")}>
          <SelectTrigger className="mt-1">
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
          {/* Client */}
          <div>
            <Label className="mb-1 block">Client *</Label>
            <Select onValueChange={(val) => setClient(val)}>
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
          </div>
        </>
      )}

      {type && (
        <>
          {/* One Day or Multiple */}
          <div className="flex items-center gap-3">
            <Label>Apply To:</Label>
            <Select
              onValueChange={(val) => {
                const isOne = val === "one";
                setOneDay(isOne);
                if (isOne) setRecurring(false);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="One Day or Multiple" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">One Day</SelectItem>
                <SelectItem value="multiple">Multiple Week Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurring */}
          {!oneDay && (
            <div className="flex items-center gap-3">
              <Checkbox
                checked={recurring}
                onCheckedChange={(val) => setRecurring(Boolean(val))}
              />
              <Label>Recurring Schedule?</Label>
            </div>
          )}

          {/* Date or Range */}
          {oneDay ? (
            <div>
              <Label className="mb-1 block">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    fromDate={today}
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <>
              <Label>Select Week Days *</Label>
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
              <div className="flex gap-4 mt-4">
                {[
                  { label: "From", date: rangeStart, setter: setRangeStart },
                  { label: "To", date: rangeEnd, setter: setRangeEnd },
                ].map(({ label, date, setter }) => (
                  <div key={label}>
                    <Label className="mb-1 block">{label} *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[220px] justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setter}
                          fromDate={today}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Time */}
          <div className="flex gap-4 mt-4">
            <TimePicker
              label="Start Time *"
              value={startTime}
              onChange={setStartTime}
              onApply={() => setTimePickerOpen(false)}
            />
            <TimePicker
              label="End Time *"
              value={endTime}
              onChange={setEndTime}
              onApply={() => setTimePickerOpen(false)}
            />
          </div>

          {/* Visit-specific fields */}
          {type === "visit" && (
            <>
              <div className="mt-4">
                <Label className="mb-1 block">Service *</Label>
                <Select onValueChange={(val) => setService(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-2">
                <Label className="mb-1 block">Authorization (optional)</Label>
                <Input
                  value={authorization}
                  onChange={(e) => setAuthorization(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  checked={groupVisit}
                  onCheckedChange={(val) => setGroupVisit(Boolean(val))}
                />
                <Label>Group Visit</Label>
              </div>
              <div>
                <Label>
                  {groupVisit ? "Select Employees" : "Assign Employee"}
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {employees.map((emp) => (
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
              </div>
            </>
          )}

          {/* Comments */}
          <div className="mt-4">
            <Label className="mb-1 block">Comments</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          {/* Reschedule */}
          <div className="flex items-center gap-2 mt-4">
            <Checkbox
              checked={reschedule}
              onCheckedChange={(val) => setReschedule(Boolean(val))}
            />
            <Label>Reschedule Missed Visit/Shift?</Label>
          </div>
          {reschedule && (
            <div>
              <Label>Select Missed Shift</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dummyMissedShifts.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`px-3 py-1 rounded border ${
                      selectedMissed.includes(item)
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                    onClick={() =>
                      handleCheckboxChange(
                        item,
                        selectedMissed,
                        setSelectedMissed
                      )
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={!canSubmit()} className="w-full">
                  Generate Schedule Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule Preview</DialogTitle>
                  <DialogDescription>
                    Review your schedule details before submission.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Type:</strong>{" "}
                    {type === "visit" ? "Visit" : "Office"}
                  </div>
                  {oneDay ? (
                    <div>
                      <strong>Date:</strong>{" "}
                      {selectedDate ? format(selectedDate, "PPP") : "N/A"}
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>Date Range:</strong>{" "}
                        {rangeStart ? format(rangeStart, "PPP") : "N/A"} to{" "}
                        {rangeEnd ? format(rangeEnd, "PPP") : "N/A"}
                      </div>
                      <div>
                        <strong>Weekdays:</strong>{" "}
                        {weekdays.length > 0 ? weekdays.join(", ") : "None"}
                      </div>
                    </>
                  )}
                  {(() => {
                    const normalized =
                      startTime &&
                      endTime &&
                      (oneDay ? selectedDate : rangeStart)
                        ? normalizeStartEnd(
                            oneDay
                              ? (selectedDate as Date)
                              : (rangeStart as Date),
                            startTime,
                            endTime
                          )
                        : null;
                    return (
                      <>
                        <div>
                          <strong>Start Time:</strong>{" "}
                          {normalized
                            ? format(normalized.start, "PPpp")
                            : "Invalid Time"}
                        </div>
                        <div>
                          <strong>End Time:</strong>{" "}
                          {normalized
                            ? format(normalized.end, "PPpp")
                            : "Invalid Time"}
                        </div>
                      </>
                    );
                  })()}

                  {type === "visit" && (
                    <div>
                      <strong>Service:</strong>{" "}
                      {services.find((s) => s.id === service)?.name || "N/A"}
                    </div>
                  )}
                  <div>
                    <strong>Employee:</strong>{" "}
                    {type === "visit"
                      ? visitEmployees.length > 0
                        ? visitEmployees
                            .map(
                              (empId) =>
                                employees.find((e) => e.id === empId)?.name ||
                                empId
                            )
                            .join(", ")
                        : "N/A"
                      : officeEmployees.length > 0
                      ? officeEmployees
                          .map(
                            (empId) =>
                              employees.find((e) => e.id === empId)?.name ||
                              empId
                          )
                          .join(", ")
                      : "N/A"}
                  </div>
                  <div>
                    <strong>Client:</strong>{" "}
                    {client
                      ? clients.find((c) => c.id === client)?.name || client
                      : "N/A"}
                  </div>
                  {/* <div>
      <strong>Role:</strong> {role || "N/A"}
    </div> */}
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={async () => {
                      const normalizedTimes = normalizeStartEnd(
                        oneDay ? (selectedDate as Date) : (rangeStart as Date),
                        startTime,
                        endTime
                      );

                      if (!normalizedTimes) {
                        alert(
                          "❌ End time cannot be the same as start time. Please choose a different time."
                        );
                        return; // Stop submission
                      }
                      try {
                        const payload = {
                          scheduleType: type, // office | visit | facility
                          clientID: client || null,
                          clientMedicaidId: "TEMP123", // ⚡️ you can fetch/set this properly later
                          authorizations: authorization || null,
                          serviceId: service || null,
                          officeReason: type === "office" ? reason : null,
                          eventCode: "EVT001", // ⚡️ placeholder until you define how codes are assigned
                          authorizationBillUnitType: "Hourly", // ⚡️ make dropdown later
                          eventStatus: "Confirmed", // ⚡️ default
                          eventDate: oneDay ? selectedDate : rangeStart, // base date
                          startTime: normalizedTimes.start.toISOString(),
                          endTime: normalizedTimes.end.toISOString(),

                          employeeID: visitEmployees[0] || null, // first employee for now
                          repeatedEvent: !oneDay && recurring,
                          dates: !oneDay
                            ? weekdays.map((w) => w) // ⚡️ we can expand this to real ISO dates later
                            : [],
                          comments,
                          billingOverride: false,
                          rate: null,
                          copay: null,
                          billAmount: null,
                        };

                        const res = await fetch(
                          "http://localhost:5000/api/schedules",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          }
                        );

                        if (!res.ok)
                          throw new Error("Failed to create schedule");

                        alert("✅ Schedule created successfully!");
                        window.location.href =
                          "/dashboard/scheduling/schedule-view";
                      } catch (err) {
                        console.error(err);
                        alert("❌ Error creating schedule");
                      }
                    }}
                  >
                    Confirm & Create Schedule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </div>
  );
}
