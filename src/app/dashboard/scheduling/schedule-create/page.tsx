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
    if (!type || !startTime || !endTime) return false;
    if (oneDay) return !!selectedDate;
    return !!(rangeStart && rangeEnd && weekdays.length > 0);
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

  // Filter employees by office/facility flags
  const filteredEmployees = employees.filter((e) => {
    if (officeStaffOnly) return e.officeStaff;
    if (facilityStaffOnly) return e.facilityStaff;
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

      const baseSchedule = {
        scheduleType: type,
        clientID: client || "",
        clientMedicaidId: "TEMP123",
        authorizations: authorization || null,
        serviceId: service || null,
        officeReason: type === "office" ? "Office Schedule" : null,
        eventCode: "EVT001",
        authorizationBillUnitType: "Hourly",
        eventStatus: "Confirmed",
        startTime: buildDateTime(new Date(), startTime).toISOString(),
        endTime: buildDateTime(new Date(), endTime).toISOString(),
        comments,
        agencyID: user?.agency?.id,
      };

      // Use batch API if multi-day or recurring
      const apiUrl =
        !oneDay || recurring
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/batch`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/schedules`;

      const payload =
        !oneDay || recurring
          ? {
              baseSchedule,
              selectedDates,
              groupVisit,
              employeeIDs: groupVisit ? visitEmployees : [visitEmployees[0]],
              recurring,
              recurringFrequency: recurring ? recurringFrequency : undefined,
            }
          : {
              ...baseSchedule,
              eventDate: selectedDate?.toISOString(),
              startTime: buildDateTime(selectedDate!, startTime).toISOString(),
              endTime: buildDateTime(selectedDate!, endTime).toISOString(),
              groupVisit,
              employeeIDs: groupVisit ? visitEmployees : [],
              employeeID: !groupVisit ? visitEmployees[0] || null : null,
            };

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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Schedule</h1>

      {/* Schedule Type */}
      <div>
        <Label>Schedule Type *</Label>
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
          <Select onValueChange={setClient}>
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
          <Label>Date *</Label>
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
                onSelect={setSelectedDate}
                fromDate={today}
              />
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <>
          <Label>Select Weekdays *</Label>
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
                onClick={() => handleCheckboxChange(day, weekdays, setWeekdays)}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex gap-4 mt-3">
            {[
              { label: "From", date: rangeStart, setter: setRangeStart },
              { label: "To", date: rangeEnd, setter: setRangeEnd },
            ].map(({ label, date, setter }) => (
              <div key={label}>
                <Label>{label}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[220px] justify-start"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
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
        />
        <TimePicker label="End Time *" value={endTime} onChange={setEndTime} />
      </div>

      {/* Visit Only: Service + Employees */}
      {type === "visit" && (
        <>
          <Label className="mt-4">Service *</Label>
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

          <Label className="mt-3">
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
                <strong>Type:</strong> {type}
              </div>
              <div>
                <strong>Recurring:</strong>{" "}
                {recurring ? `${recurringFrequency}` : "No"}
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
                <strong>Start Time:</strong> {startTime}
              </div>
              <div>
                <strong>End Time:</strong> {endTime}
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
                  <div className="col-span-2">
                    <strong>Employees:</strong>{" "}
                    {visitEmployees
                      .map((id) => employees.find((e) => e.id === id)?.name)
                      .join(", ") || "None"}
                  </div>
                </>
              )}
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
                            {d.toLocaleDateString("en-US", { weekday: "long" })}
                          </td>
                          <td className="px-2 py-1">{startTime}</td>
                          <td className="px-2 py-1">{endTime}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
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
  );
  // return (
  //   <div className="p-6 space-y-6">
  //     <h2 className="text-2xl font-bold">Create Schedule</h2>

  //     {/* Schedule Type */}
  //     <div>
  //       <Label>Schedule Type *</Label>
  //       <Select onValueChange={(v) => setType(v as any)}>
  //         <SelectTrigger>
  //           <SelectValue placeholder="Select type" />
  //         </SelectTrigger>
  //         <SelectContent>
  //           <SelectItem value="office">Office</SelectItem>
  //           <SelectItem value="visit">Visit</SelectItem>
  //           <SelectItem value="facility">Facility</SelectItem>
  //         </SelectContent>
  //       </Select>
  //     </div>

  //     {type === "visit" && (
  //       <>
  //         <Label>Client *</Label>
  //         <Select onValueChange={setClient}>
  //           <SelectTrigger>
  //             <SelectValue placeholder="Select client" />
  //           </SelectTrigger>
  //           <SelectContent>
  //             {clients.map((c) => (
  //               <SelectItem key={c.id} value={c.id}>
  //                 {c.name}
  //               </SelectItem>
  //             ))}
  //           </SelectContent>
  //         </Select>
  //       </>
  //     )}

  //     {type && (
  //       <>
  //         {/* One Day or Multiple */}
  //         <div className="flex items-center gap-3">
  //           <Label>Apply To:</Label>
  //           <Select
  //             onValueChange={(val) => {
  //               const isOne = val === "one";
  //               setOneDay(isOne);
  //               if (isOne) setRecurring(false);
  //             }}
  //           >
  //             <SelectTrigger className="w-[160px]">
  //               <SelectValue placeholder="One Day or Multiple" />
  //             </SelectTrigger>
  //             <SelectContent>
  //               <SelectItem value="one">One Day</SelectItem>
  //               <SelectItem value="multiple">Multiple Week Days</SelectItem>
  //             </SelectContent>
  //           </Select>
  //         </div>

  //         {/* Recurring */}
  //         {!oneDay && (
  //           <div className="flex items-center gap-3">
  //             <Checkbox
  //               checked={recurring}
  //               onCheckedChange={(val) => setRecurring(Boolean(val))}
  //             />
  //             <Label>Recurring Schedule?</Label>
  //           </div>
  //         )}

  //         {/* Date or Range */}
  //         {oneDay ? (
  //           <div>
  //             <Label className="mb-1 block">Date *</Label>
  //             <Popover>
  //               <PopoverTrigger asChild>
  //                 <Button
  //                   variant="outline"
  //                   className="w-[280px] justify-start text-left font-normal"
  //                 >
  //                   <CalendarIcon className="mr-2 h-4 w-4" />
  //                   {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
  //                 </Button>
  //               </PopoverTrigger>
  //               <PopoverContent className="w-auto p-0" align="start">
  //                 <Calendar
  //                   mode="single"
  //                   selected={selectedDate}
  //                   onSelect={setSelectedDate}
  //                   fromDate={today}
  //                 />
  //               </PopoverContent>
  //             </Popover>
  //           </div>
  //         ) : (
  //           <>
  //             <Label>Select Week Days *</Label>
  //             <div className="flex flex-wrap gap-2">
  //               {weekdaysList.map((day) => (
  //                 <button
  //                   key={day}
  //                   type="button"
  //                   className={`px-3 py-1 rounded border ${
  //                     weekdays.includes(day)
  //                       ? "bg-primary text-white"
  //                       : "bg-muted text-muted-foreground"
  //                   }`}
  //                   onClick={() =>
  //                     handleCheckboxChange(day, weekdays, setWeekdays)
  //                   }
  //                 >
  //                   {day}
  //                 </button>
  //               ))}
  //             </div>
  //             <div className="flex gap-4 mt-4">
  //               {[
  //                 { label: "From", date: rangeStart, setter: setRangeStart },
  //                 { label: "To", date: rangeEnd, setter: setRangeEnd },
  //               ].map(({ label, date, setter }) => (
  //                 <div key={label}>
  //                   <Label className="mb-1 block">{label} *</Label>
  //                   <Popover>
  //                     <PopoverTrigger asChild>
  //                       <Button
  //                         variant="outline"
  //                         className="w-[220px] justify-start text-left font-normal"
  //                       >
  //                         <CalendarIcon className="mr-2 h-4 w-4" />
  //                         {date ? format(date, "PPP") : "Pick a date"}
  //                       </Button>
  //                     </PopoverTrigger>
  //                     <PopoverContent className="w-auto p-0" align="start">
  //                       <Calendar
  //                         mode="single"
  //                         selected={date}
  //                         onSelect={setter}
  //                         fromDate={today}
  //                       />
  //                     </PopoverContent>
  //                   </Popover>
  //                 </div>
  //               ))}
  //             </div>
  //           </>
  //         )}

  //         {/* Time */}
  //         <div className="flex gap-4 mt-4">
  //           <TimePicker
  //             label="Start Time *"
  //             value={startTime}
  //             onChange={setStartTime}
  //             onApply={() => setTimePickerOpen(false)}
  //           />
  //           <TimePicker
  //             label="End Time *"
  //             value={endTime}
  //             onChange={setEndTime}
  //             onApply={() => setTimePickerOpen(false)}
  //           />
  //         </div>

  //         {/* Visit Only */}
  //     {type === "visit" && (
  //       <>
  //         <Label className="mt-4">Service *</Label>
  //         <Select onValueChange={setService}>
  //           <SelectTrigger>
  //             <SelectValue placeholder="Select service" />
  //           </SelectTrigger>
  //           <SelectContent>
  //             {services.map((s) => (
  //               <SelectItem key={s.id} value={s.id}>
  //                 {s.name}
  //               </SelectItem>
  //             ))}
  //           </SelectContent>
  //         </Select>

  //         <div className="mt-2">
  //           <Label>Authorization (optional)</Label>
  //           <Input value={authorization} onChange={(e) => setAuthorization(e.target.value)} />
  //         </div>

  //         <div className="flex items-center gap-2 mt-4">
  //           <Checkbox
  //             checked={groupVisit}
  //             onCheckedChange={(v) => {
  //               setGroupVisit(!!v);
  //               if (v) generateGroupVisitCode();
  //               else setGroupVisitCode(null);
  //             }}
  //           />
  //           <Label>Group Visit</Label>
  //           {groupVisitCode && <span className="ml-2 text-sm text-muted-foreground">{groupVisitCode}</span>}
  //         </div>

  //         <div className="mt-2 flex gap-4">
  //           <div className="flex items-center gap-2">
  //             <Checkbox checked={officeStaffOnly} onCheckedChange={(v) => setOfficeStaffOnly(!!v)} />
  //             <Label>Show Office Staff Only</Label>
  //           </div>
  //           <div className="flex items-center gap-2">
  //             <Checkbox checked={facilityStaffOnly} onCheckedChange={(v) => setFacilityStaffOnly(!!v)} />
  //             <Label>Show Facility Staff Only</Label>
  //           </div>
  //         </div>

  //         <Label className="mt-3">
  //           {groupVisit ? "Select Employees *" : "Assign Employee *"}
  //         </Label>
  //         <div className="flex flex-wrap gap-2 mt-2">
  //           {filteredEmployees.map((emp) => {
  //             const assignedToClient =
  //               client && emp.assignedClients?.some((c: any) => c.id === client);
  //             return (
  //               <button
  //                 key={emp.id}
  //                 type="button"
  //                 className={`px-3 py-1 rounded border ${
  //                   visitEmployees.includes(emp.id)
  //                     ? "bg-primary text-white"
  //                     : "bg-muted text-muted-foreground"
  //                 }`}
  //                 onClick={() => handleEmployeeSelect(emp.id)}
  //               >
  //                 {emp.name}
  //                 {emp.officeStaff && " (Office)"}
  //                 {emp.facilityStaff && " (Facility)"}
  //                 {assignedToClient && " ⭐ Assigned"}
  //               </button>
  //             );
  //           })}
  //         </div>
  //       </>
  //     )}

  //         {/* Comments */}
  //         <div className="mt-4">
  //           <Label className="mb-1 block">Comments</Label>
  //           <Textarea
  //             value={comments}
  //             onChange={(e) => setComments(e.target.value)}
  //           />
  //         </div>

  //         {/* Reschedule */}
  //         <div className="flex items-center gap-2 mt-4">
  //           <Checkbox
  //             checked={reschedule}
  //             onCheckedChange={(val) => setReschedule(Boolean(val))}
  //           />
  //           <Label>Reschedule Missed Visit/Shift?</Label>
  //         </div>
  //         {reschedule && (
  //           <div>
  //             <Label>Select Missed Visit</Label>
  //             <div className="flex flex-wrap gap-2 mt-2">
  //               {missedShifts.length > 0 ? (
  //                 missedShifts.map((m) => (
  //                   <button
  //                     key={m.id}
  //                     type="button"
  //                     className={`px-3 py-1 rounded border ${
  //                       selectedMissed.includes(m.id)
  //                         ? "bg-primary text-white"
  //                         : "bg-muted text-muted-foreground"
  //                     }`}
  //                     onClick={() =>
  //                       handleCheckboxChange(
  //                         m.id,
  //                         selectedMissed,
  //                         setSelectedMissed
  //                       )
  //                     }
  //                   >
  //                     {m.client
  //                       ? `Visit with ${m.client} (${new Date(
  //                           m.scheduledTimeOut
  //                         ).toLocaleDateString()})`
  //                       : `Missed Shift (${new Date(
  //                           m.scheduledTimeOut
  //                         ).toLocaleDateString()})`}
  //                   </button>
  //                 ))
  //               ) : (
  //                 <p className="text-muted-foreground">
  //                   No missed visits found.
  //                 </p>
  //               )}
  //             </div>
  //           </div>
  //         )}

  //         {/* Submit */}
  //         <div className="pt-6">
  //           <Dialog>
  //             <DialogTrigger asChild>
  //               <Button disabled={!canSubmit()} className="w-full">
  //                 Generate Schedule Preview
  //               </Button>
  //             </DialogTrigger>
  //             <DialogContent className="max-w-md">
  //               <DialogHeader>
  //                 <DialogTitle>Schedule Preview</DialogTitle>
  //                 <DialogDescription>
  //                   Review your schedule details before submission.
  //                 </DialogDescription>
  //               </DialogHeader>

  //               <div className="space-y-2 text-sm">
  //                 <div>
  //                   <strong>Type:</strong>{" "}
  //                   {type === "visit" ? "Visit" : "Office"}
  //                 </div>
  //                 {oneDay ? (
  //                   <div>
  //                     <strong>Date:</strong>{" "}
  //                     {selectedDate ? format(selectedDate, "PPP") : "N/A"}
  //                   </div>
  //                 ) : (
  //                   <>
  //                     <div>
  //                       <strong>Date Range:</strong>{" "}
  //                       {rangeStart ? format(rangeStart, "PPP") : "N/A"} to{" "}
  //                       {rangeEnd ? format(rangeEnd, "PPP") : "N/A"}
  //                     </div>
  //                     <div>
  //                       <strong>Weekdays:</strong>{" "}
  //                       {weekdays.length > 0 ? weekdays.join(", ") : "None"}
  //                     </div>
  //                   </>
  //                 )}
  //                 {(() => {
  //                   const normalized =
  //                     startTime &&
  //                     endTime &&
  //                     (oneDay ? selectedDate : rangeStart)
  //                       ? normalizeStartEnd(
  //                           oneDay
  //                             ? (selectedDate as Date)
  //                             : (rangeStart as Date),
  //                           startTime,
  //                           endTime
  //                         )
  //                       : null;
  //                   return (
  //                     <>
  //                       <div>
  //                         <strong>Start Time:</strong>{" "}
  //                         {normalized
  //                           ? format(normalized.start, "PPpp")
  //                           : "Invalid Time"}
  //                       </div>
  //                       <div>
  //                         <strong>End Time:</strong>{" "}
  //                         {normalized
  //                           ? format(normalized.end, "PPpp")
  //                           : "Invalid Time"}
  //                       </div>
  //                     </>
  //                   );
  //                 })()}

  //                 {type === "visit" && (
  //                   <div>
  //                     <strong>Service:</strong>{" "}
  //                     {services.find((s) => s.id === service)?.name || "N/A"}
  //                   </div>
  //                 )}
  //                 <div>
  //                   <strong>Employee:</strong>{" "}
  //                   {type === "visit"
  //                     ? visitEmployees.length > 0
  //                       ? visitEmployees
  //                           .map(
  //                             (empId) =>
  //                               employees.find((e) => e.id === empId)?.name ||
  //                               empId
  //                           )
  //                           .join(", ")
  //                       : "N/A"
  //                     : officeEmployees.length > 0
  //                     ? officeEmployees
  //                         .map(
  //                           (empId) =>
  //                             employees.find((e) => e.id === empId)?.name ||
  //                             empId
  //                         )
  //                         .join(", ")
  //                     : "N/A"}
  //                 </div>
  //                 <div>
  //                   <strong>Client:</strong>{" "}
  //                   {client
  //                     ? clients.find((c) => c.id === client)?.name || client
  //                     : "N/A"}
  //                 </div>
  //                 {/* <div>
  //     <strong>Role:</strong> {role || "N/A"}
  //   </div> */}
  //               </div>

  //               <div className="pt-4">
  //                 <Button
  //                   className="w-full"
  //                   onClick={async () => {
  //                     try {
  //                       let scheduleBlocks: { start: Date; end: Date }[] = [];

  //                       if (oneDay) {
  //                         const normalized = normalizeStartEnd(
  //                           selectedDate as Date,
  //                           startTime,
  //                           endTime
  //                         );
  //                         if (!normalized) {
  //                           alert("❌ End time cannot equal start time.");
  //                           return;
  //                         }
  //                         scheduleBlocks = [normalized];
  //                       } else {
  //                         if (!rangeStart || !rangeEnd) {
  //                           alert("❌ Please select a valid date range.");
  //                           return;
  //                         }

  //                         // First block
  //                         const initialBlock = generateSchedulesInRange(
  //                           rangeStart,
  //                           rangeEnd,
  //                           weekdays,
  //                           startTime,
  //                           endTime
  //                         );
  //                         if (initialBlock.some((b) => !b)) {
  //                           alert("❌ Invalid start or end time in range.");
  //                           return;
  //                         }
  //                         scheduleBlocks.push(...initialBlock);

  //                         // If recurring → duplicate block forward
  //                         if (recurring) {
  //                           const blockLength =
  //                             Math.ceil(
  //                               (rangeEnd.getTime() - rangeStart.getTime()) /
  //                                 (1000 * 60 * 60 * 24)
  //                             ) + 1;
  //                           let nextStart = new Date(rangeStart);
  //                           let nextEnd = new Date(rangeEnd);

  //                           while (true) {
  //                             nextStart = new Date(
  //                               nextStart.getTime() +
  //                                 blockLength * 24 * 60 * 60 * 1000
  //                             );
  //                             nextEnd = new Date(
  //                               nextEnd.getTime() +
  //                                 blockLength * 24 * 60 * 60 * 1000
  //                             );

  //                             // Stop condition: only generate until user turns recurring off later
  //                             // For now we generate ONE extra block forward
  //                             const nextBlock = generateSchedulesInRange(
  //                               nextStart,
  //                               nextEnd,
  //                               weekdays,
  //                               startTime,
  //                               endTime
  //                             );
  //                             if (nextBlock.some((b) => !b)) {
  //                               alert(
  //                                 "❌ Invalid start or end time in recurring range."
  //                               );
  //                               return;
  //                             }
  //                             scheduleBlocks.push(...nextBlock);

  //                             break; // ⚡️ remove this `break` later if you want indefinite recurrence until edited
  //                           }
  //                         }
  //                       }

  //                       // Send each schedule
  //                       for (const block of scheduleBlocks) {
  //                         if (!block || !block.start || !block.end) {
  //                           alert("❌ Invalid schedule block detected.");
  //                           return;
  //                         }
  //                         const payload = {
  //                           scheduleType: type,
  //                           clientID: client || null,
  //                           clientMedicaidId: "TEMP123",
  //                           authorizations: authorization || null,
  //                           serviceId: service || null,
  //                           officeReason: type === "office" ? reason : null,
  //                           eventCode: "EVT001",
  //                           authorizationBillUnitType: "Hourly",
  //                           eventStatus: "Confirmed",
  //                           eventDate: block.start.toISOString(),
  //                           startTime: block.start.toISOString(),
  //                           endTime: block.end.toISOString(),
  //                           employeeID: visitEmployees[0] || null,
  //                           repeatedEvent: !oneDay && recurring,
  //                           comments,
  //                           billingOverride: false,
  //                           rate: null,
  //                           copay: null,
  //                           billAmount: null,
  //                           agencyID: user?.agency?.id,
  //                         };

  //                         const res = await fetch(
  //                           `${process.env.NEXT_PUBLIC_API_URL}/api/schedules`,
  //                           {
  //                             method: "POST",
  //                             headers: { "Content-Type": "application/json" },
  //                             body: JSON.stringify(payload),
  //                           }
  //                         );

  //                         if (!res.ok)
  //                           throw new Error("Failed to create schedule");
  //                       }

  //                       alert("✅ Schedule(s) created successfully!");
  //                       window.location.href =
  //                         "/dashboard/scheduling/schedule-view";
  //                     } catch (err) {
  //                       console.error(err);
  //                       alert("❌ Error creating schedule");
  //                     }
  //                   }}
  //                 >
  //                   Confirm & Create Schedule
  //                 </Button>
  //               </div>
  //             </DialogContent>
  //           </Dialog>
  //         </div>
  //       </>
  //     )}
  //   </div>
  // );
}
