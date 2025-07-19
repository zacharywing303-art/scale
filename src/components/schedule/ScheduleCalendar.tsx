"use client";

import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import React, { useMemo } from "react";

type ScheduleCalendarProps = {
  date: Date;
  viewMode: "day" | "week" | "agenda";
  filters: {
    type: string;
    service?: string;
    employee?: string;
    client?: string;
    role?: string;
  };
  onDateChange: (newDate: Date) => void;
  onViewChange: (newView: "day" | "week" | "agenda") => void;
};

const localizer = momentLocalizer(moment);

// Utility for assigning consistent random colors to employee names
const getColorForEmployee = (() => {
  const colorMap = new Map<string, string>();
  const colors = [
    "#E57373",
    "#64B5F6",
    "#81C784",
    "#FFD54F",
    "#BA68C8",
    "#4DB6AC",
    "#A1887F",
    "#90A4AE",
    "#F06292",
    "#7986CB",
  ];
  let index = 0;

  return (name: string) => {
    if (!colorMap.has(name)) {
      colorMap.set(name, colors[index % colors.length]);
      index++;
    }
    return colorMap.get(name)!;
  };
})();

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  date,
  viewMode,
  filters,
  onDateChange,
  onViewChange,
}) => {
  const goToToday = () => onDateChange(new Date());

  const goToPrevious = () => {
    const newDate = new Date(date);
    if (viewMode === "day") {
      newDate.setDate(date.getDate() - 1);
    } else {
      newDate.setDate(date.getDate() - 7);
    }
    onDateChange(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(date);
    if (viewMode === "day") {
      newDate.setDate(date.getDate() + 1);
    } else {
      newDate.setDate(date.getDate() + 7);
    }
    onDateChange(newDate);
  };

  // Format date range or single date for header
  const formattedDateRange = useMemo(() => {
    if (viewMode === "day") {
      return moment(date).format("MMMM D, YYYY");
    } else {
      const start = moment(date).startOf("week");
      const end = moment(date).endOf("week");
      return `${start.format("MMM D")} - ${end.format("D, YYYY")}`;
    }
  }, [date, viewMode]);

  // Mock data
  const events = [
    {
      title: "Office Shift - Alice",
      start: moment(date).set({ hour: 9, minute: 0 }).toDate(),
      end: moment(date).set({ hour: 17, minute: 0 }).toDate(),
      type: "office",
      employee: "Alice",
    },
    {
      title: "Visit - Bob w/ Client John Doe (Therapy)",
      start: moment(date).set({ hour: 10, minute: 0 }).toDate(),
      end: moment(date).set({ hour: 12, minute: 0 }).toDate(),
      type: "home",
      employee: "Bob",
      client: "John Doe",
      service: "Therapy",
    },
  ];

  // Apply filters
  const filteredEvents = events.filter((event) => {
    if (filters.type && event.type !== filters.type) return false;
    if (filters.employee && event.employee !== filters.employee) return false;
    if (filters.client && event.client !== filters.client) return false;
    if (filters.service && event.service !== filters.service) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            ◀
          </button>
          <button onClick={goToToday} className="px-3 py-1 bg-gray-200 rounded">
            Today
          </button>
          <button onClick={goToNext} className="px-3 py-1 bg-gray-200 rounded">
            ▶
          </button>
        </div>

        <div className="text-lg font-semibold text-center text-gray-700">
          {formattedDateRange}
        </div>

        <div className="flex items-center space-x-2">
          {["day", "week", "agenda"].map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v as any)}
              className={`px-3 py-1 rounded ${
                viewMode === v ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="overflow-x-auto">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          date={date}
          onNavigate={onDateChange}
          view={
            viewMode === "agenda"
              ? Views.AGENDA
              : viewMode === "week"
              ? Views.WEEK
              : Views.DAY
          }
          toolbar={false}
          style={{ height: 600 }}
          popup
          selectable
          eventPropGetter={(event) => {
            const backgroundColor = getColorForEmployee(event.employee || "");
            return {
              style: {
                backgroundColor,
                borderRadius: "4px",
                color: "white",
                border: "none",
              },
            };
          }}
        />
      </div>
    </div>
  );
};

export default ScheduleCalendar;
