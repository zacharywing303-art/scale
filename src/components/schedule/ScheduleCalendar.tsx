// "use client";

// import { Calendar, momentLocalizer, Views } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// import React, { useMemo } from "react";

// type ScheduleCalendarProps = {
//   date: Date;
//   viewMode: "day" | "week" | "agenda";
//   filters: {
//     type: string;
//     service?: string;
//     employee?: string;
//     client?: string;
//     role?: string;
//   };
//   schedules: any[];
//   onDateChange: (newDate: Date) => void;
//   onViewChange: (newView: "day" | "week" | "agenda") => void;
// };

// const localizer = momentLocalizer(moment);

// // Utility for assigning consistent random colors to employee names
// const getColorForEmployee = (() => {
//   const colorMap = new Map<string, string>();
//   const colors = [
//     "#E57373",
//     "#64B5F6",
//     "#81C784",
//     "#FFD54F",
//     "#BA68C8",
//     "#4DB6AC",
//     "#A1887F",
//     "#90A4AE",
//     "#F06292",
//     "#7986CB",
//   ];
//   let index = 0;

//   return (name: string) => {
//     if (!colorMap.has(name)) {
//       colorMap.set(name, colors[index % colors.length]);
//       index++;
//     }
//     return colorMap.get(name)!;
//   };
// })();

// const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
//   date,
//   viewMode,
//   filters,
//   schedules,
//   onDateChange,
//   onViewChange,
// }) => {
//   const goToToday = () => onDateChange(new Date());

//   const goToPrevious = () => {
//     const newDate = new Date(date);
//     if (viewMode === "day") {
//       newDate.setDate(date.getDate() - 1);
//     } else {
//       newDate.setDate(date.getDate() - 7);
//     }
//     onDateChange(newDate);
//   };

//   const goToNext = () => {
//     const newDate = new Date(date);
//     if (viewMode === "day") {
//       newDate.setDate(date.getDate() + 1);
//     } else {
//       newDate.setDate(date.getDate() + 7);
//     }
//     onDateChange(newDate);
//   };

//   // Format date range or single date for header
//   const formattedDateRange = useMemo(() => {
//     if (viewMode === "day") {
//       return moment(date).format("MMMM D, YYYY");
//     } else {
//       const start = moment(date).startOf("week");
//       const end = moment(date).endOf("week");
//       return `${start.format("MMM D")} - ${end.format("D, YYYY")}`;
//     }
//   }, [date, viewMode]);

//   // Mock data
//   const events = useMemo(() => {
//     return schedules.map((s) => ({
//       id: s.id,
//       title: `${s.scheduleType} - ${s.employee?.name || "Unassigned"} ${
//         s.client ? `w/ ${s.client.name}` : ""
//       } ${s.service ? `(${s.service.name})` : ""}`,
//       start: new Date(s.startTime),
//       end: new Date(s.endTime),
//       type: s.scheduleType, // office, visit, facility
//       employee: s.employee?.name,
//       client: s.client?.name,
//       service: s.service?.name,
//       role: s.employee?.position, // role assigned to employee
//     }));
//   }, [schedules]);

//   // Apply filters
//   const filteredEvents = events.filter((event) => {
//     if (filters.type && event.type !== filters.type) return false;
//     if (filters.employee && event.employee !== filters.employee) return false;
//     if (filters.client && event.client !== filters.client) return false;
//     if (filters.service && event.service !== filters.service) return false;
//     if (filters.role && event.role !== filters.role) return false;
//     return true;
//   });

//   return (
//     <div className="space-y-4">
//       {/* Header Controls */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={goToPrevious}
//             className="px-3 py-1 bg-gray-200 rounded"
//           >
//             ◀
//           </button>
//           <button onClick={goToToday} className="px-3 py-1 bg-gray-200 rounded">
//             Today
//           </button>
//           <button onClick={goToNext} className="px-3 py-1 bg-gray-200 rounded">
//             ▶
//           </button>
//         </div>

//         <div className="text-lg font-semibold text-center text-gray-700">
//           {formattedDateRange}
//         </div>

//         <div className="flex items-center space-x-2">
//           {["day", "week", "agenda"].map((v) => (
//             <button
//               key={v}
//               onClick={() => onViewChange(v as any)}
//               className={`px-3 py-1 rounded ${
//                 viewMode === v ? "bg-blue-600 text-white" : "bg-gray-200"
//               }`}
//             >
//               {v.charAt(0).toUpperCase() + v.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Calendar */}
//       <div className="overflow-x-auto">
//         <Calendar
//           localizer={localizer}
//           events={filteredEvents}
//           date={date}
//           onNavigate={onDateChange}
//           view={
//             viewMode === "agenda"
//               ? Views.AGENDA
//               : viewMode === "week"
//               ? Views.WEEK
//               : Views.DAY
//           }
//           toolbar={false}
//           style={{ height: 600 }}
//           popup
//           selectable
//           eventPropGetter={(event) => {
//             const backgroundColor = getColorForEmployee(event.employee || "");
//             return {
//               style: {
//                 backgroundColor,
//                 borderRadius: "4px",
//                 color: "white",
//                 border: "none",
//               },
//             };
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default ScheduleCalendar;

// "use client";

// import { Calendar, momentLocalizer, Views } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import React, { useMemo } from "react";

// interface ScheduleCalendarProps {
//   date: Date;
//   viewMode: "day" | "week" | "agenda";
//   filters: {
//     type: string;
//     service: string;
//     employee: string;
//     client: string;
//     role: string;
//   };
//   schedules: any[];
//   onDateChange: (date: Date) => void;
//   onViewChange: (view: "day" | "week" | "agenda") => void;
// }

// const localizer = momentLocalizer(moment);

// // Utility for assigning consistent random colors to employee names
// const getColorForEmployee = (() => {
//   const colorMap = new Map<string, string>();
//   const colors = [
//     "#E57373",
//     "#64B5F6",
//     "#81C784",
//     "#FFD54F",
//     "#BA68C8",
//     "#4DB6AC",
//     "#A1887F",
//     "#90A4AE",
//     "#F06292",
//     "#7986CB",
//   ];
//   let index = 0;

//   return (name: string) => {
//     if (!colorMap.has(name)) {
//       colorMap.set(name, colors[index % colors.length]);
//       index++;
//     }
//     return colorMap.get(name)!;
//   };
// })();

// export default function ScheduleCalendar({
//   date,
//   viewMode,
//   filters,
//   schedules,
//   onDateChange,
//   onViewChange,
// }: ScheduleCalendarProps) {
//   const goToToday = () => onDateChange(new Date());

//   const goToPrevious = () => {
//     const newDate = new Date(date);
//     if (viewMode === "day") newDate.setDate(date.getDate() - 1);
//     else newDate.setDate(date.getDate() - 7);
//     onDateChange(newDate);
//   };

//   const goToNext = () => {
//     const newDate = new Date(date);
//     if (viewMode === "day") newDate.setDate(date.getDate() + 1);
//     else newDate.setDate(date.getDate() + 7);
//     onDateChange(newDate);
//   };

//   // Format date range or single date for header
//   const formattedDateRange = useMemo(() => {
//     if (viewMode === "day") return moment(date).format("MMMM D, YYYY");
//     const start = moment(date).startOf("week");
//     const end = moment(date).endOf("week");
//     return `${start.format("MMM D")} - ${end.format("D, YYYY")}`;
//   }, [date, viewMode]);

//   // Convert schedules → events
//   const events = useMemo(
//     () =>
//       schedules.map((s) => ({
//         id: s.id,
//         title: `${s.scheduleType} - ${s.employee?.name || "Unassigned"} ${
//           s.client ? `w/ ${s.client.name}` : ""
//         } ${s.service ? `(${s.service.name})` : ""}`,
//         start: new Date(s.startTime),
//         end: new Date(s.endTime),
//         type: s.scheduleType,
//         employee: s.employee?.name,
//         client: s.client?.name,
//         service: s.service?.name,
//         role: s.employee?.position,
//       })),
//     [schedules]
//   );

//   // Apply filters (match your "" defaults, not "all")
//   const filteredEvents = events.filter((event) => {
//     if (filters.type && event.type !== filters.type) return false;
//     if (filters.employee && event.employee !== filters.employee) return false;
//     if (filters.client && event.client !== filters.client) return false;
//     if (filters.service && event.service !== filters.service) return false;
//     if (filters.role && event.role !== filters.role) return false;
//     return true;
//   });

//   return (
//     <div className="space-y-4">
//       {/* Header Controls */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={goToPrevious}
//             className="px-3 py-1 bg-gray-200 rounded"
//           >
//             ◀
//           </button>
//           <button onClick={goToToday} className="px-3 py-1 bg-gray-200 rounded">
//             Today
//           </button>
//           <button onClick={goToNext} className="px-3 py-1 bg-gray-200 rounded">
//             ▶
//           </button>
//         </div>

//         <div className="text-lg font-semibold text-center text-gray-700">
//           {formattedDateRange}
//         </div>

//         <div className="flex items-center space-x-2">
//           {["day", "week", "agenda"].map((v) => (
//             <button
//               key={v}
//               onClick={() => onViewChange(v as any)}
//               className={`px-3 py-1 rounded ${
//                 viewMode === v ? "bg-blue-600 text-white" : "bg-gray-200"
//               }`}
//             >
//               {v.charAt(0).toUpperCase() + v.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Calendar */}
//       <div className="overflow-x-auto">
//         <Calendar
//           localizer={localizer}
//           events={filteredEvents}
//           date={date}
//           onNavigate={onDateChange}
//           view={
//             viewMode === "agenda"
//               ? Views.AGENDA
//               : viewMode === "week"
//               ? Views.WEEK
//               : Views.DAY
//           }
//           toolbar={false}
//           style={{ height: 600 }}
//           popup
//           selectable
//           eventPropGetter={(event: any) => {
//             const backgroundColor = getColorForEmployee(event.employee || "");
//             return {
//               style: {
//                 backgroundColor,
//                 borderRadius: "4px",
//                 color: "white",
//                 border: "none",
//               },
//             };
//           }}
//         />
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useMemo } from "react";
import { Calendar, momentLocalizer, Views, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface ScheduleCalendarProps {
  date: Date;
  viewMode: "day" | "week" | "agenda";
  filters: {
    type: string;
    service: string;
    employee: string;
    client: string;
    role: string;
  };
  schedules: any[];
  onDateChange: (date: Date) => void;
  onViewChange: (view: "day" | "week" | "agenda") => void;
  colorBy?: "employee" | "service"; // 🔹 New prop
}

// 🔹 Utility: Assign consistent colors
const getColorMap = (() => {
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
  return (key: string) => {
    if (!colorMap.has(key)) {
      colorMap.set(key, colors[index % colors.length]);
      index++;
    }
    return colorMap.get(key)!;
  };
})();

export default function ScheduleCalendar({
  date,
  viewMode,
  filters,
  schedules,
  onDateChange,
  onViewChange,
  colorBy = "employee", // default to employee
}: ScheduleCalendarProps) {
  // 🔹 Convert schedules -> events
  const events: Event[] = useMemo(() => {
    return schedules
      .filter((s) => {
        if (filters.type !== "all" && s.scheduleType !== filters.type)
          return false;
        if (filters.service !== "all") {
          if (!s.service && filters.service === "unknown") return true; // allow unassigned
          if (s.service?.name !== filters.service) return false;
        }
        if (filters.employee !== "all" && s.employee?.name !== filters.employee)
          return false;
        if (filters.client !== "all" && s.client?.name !== filters.client)
          return false;
        if (filters.role !== "all" && s.employee?.position !== filters.role)
          return false;
        return true;
      })
      .map((s) => ({
        id: s.id,
        title: `${s.service?.name || "Service"} - ${
          s.employee?.name || "Employee"
        } (${s.client?.name || "Client"})`,
        start: new Date(s.startTime),
        end: new Date(s.endTime),
        resource: s,
        employee: s.employee?.name,
        service: s.service?.name,
      }));
  }, [schedules, filters]);

  // 🔹 Event color (switchable)
  const eventStyleGetter = (event: any) => {
    const key =
      colorBy === "employee"
        ? event.employee || "unknown"
        : event.service || "unknown";
    const backgroundColor = getColorMap(key);
    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "4px",
        border: "none",
      },
    };
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        date={date}
        view={viewMode}
        onNavigate={onDateChange}
        onView={(view) => onViewChange(view as "day" | "week" | "agenda")}
        views={[Views.DAY, Views.WEEK, Views.AGENDA]}
        eventPropGetter={eventStyleGetter}
        style={{ height: "75vh" }}
      />
    </div>
  );
}
