"use client";

import { useState } from "react";
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

import { format } from "date-fns";

export default function CreateSchedulePage() {
  const [type, setType] = useState<"office" | "visit" | "">("");
  const [recurring, setRecurring] = useState(false);
  const [oneDay, setOneDay] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [rangeStart, setRangeStart] = useState<Date | undefined>();
  const [rangeEnd, setRangeEnd] = useState<Date | undefined>();
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

  const weekdaysList = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dummyEmployees = ["Jane Smith", "John Doe", "Maria Clark"];
  const dummyMissedShifts = ["Visit with Mr. A (6/10)", "Office shift (6/5)"];

  const canSubmit = () => {
    return (
      type &&
      startTime &&
      endTime &&
      ((oneDay && selectedDate) ||
        (!oneDay && recurring && weekdays.length > 0 && rangeStart && rangeEnd))
    );
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

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Create Schedule</h2>

      {/* Step 1: Type */}
      <div>
        <Label>Schedule Type</Label>
        <Select onValueChange={(val) => setType(val as "office" | "visit")}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="visit">Visit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type && (
        <>
          {/* Step 2: Recurring */}
          <div className="flex items-center gap-3">
            <Checkbox
              checked={recurring}
              onCheckedChange={(val) => setRecurring(Boolean(val))}
            />
            <Label>Recurring Schedule?</Label>
          </div>

          {/* Step 3: One day or multiple */}
          <div className="flex items-center gap-3">
            <Label>Apply To:</Label>
            <Select onValueChange={(val) => setOneDay(val === "one")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="One Day or Multiple" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">One Day</SelectItem>
                <SelectItem value="multiple">Multiple Week Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          {oneDay ? (
            <div>
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </div>
          ) : (
            <>
              <Label>Select Week Days</Label>
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
                <div>
                  <Label>From</Label>
                  <Calendar
                    mode="single"
                    selected={rangeStart}
                    onSelect={setRangeStart}
                  />
                </div>
                <div>
                  <Label>To</Label>
                  <Calendar
                    mode="single"
                    selected={rangeEnd}
                    onSelect={setRangeEnd}
                  />
                </div>
              </div>
            </>
          )}

          {/* Time Range */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Conditional Fields */}
          {type === "office" && (
            <>
              <div>
                <Label>Reason (optional)</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={officeOpenShift}
                  onCheckedChange={(val) => setOfficeOpenShift(Boolean(val))}
                />
                <Label>Open Shift (any employee can pick)</Label>
              </div>
              {!officeOpenShift && (
                <div>
                  <Label>Select Employee(s)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dummyEmployees.map((emp) => (
                      <button
                        key={emp}
                        type="button"
                        className={`px-3 py-1 rounded border ${
                          officeEmployees.includes(emp)
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() =>
                          handleCheckboxChange(
                            emp,
                            officeEmployees,
                            setOfficeEmployees
                          )
                        }
                      >
                        {emp}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {type === "visit" && (
            <>
              <div>
                <Label>Service</Label>
                <Input
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                />
              </div>
              <div>
                <Label>Authorization (if any)</Label>
                <Input
                  value={authorization}
                  onChange={(e) => setAuthorization(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
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
                  {dummyEmployees.map((emp) => (
                    <button
                      key={emp}
                      type="button"
                      className={`px-3 py-1 rounded border ${
                        visitEmployees.includes(emp)
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                      onClick={() =>
                        handleCheckboxChange(
                          emp,
                          visitEmployees,
                          setVisitEmployees
                        )
                      }
                    >
                      {emp}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Common Fields */}
          <div>
            <Label>Comments</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
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
            <Button disabled={!canSubmit()} className="w-full">
              Generate Schedule Preview
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
