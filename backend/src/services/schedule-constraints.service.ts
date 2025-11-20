import prisma from "../lib/db";
import { isBefore, isAfter, parseISO } from "date-fns";

// helper to detect if ranges overlap
function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA <= endB && startB <= endA;
}

export async function getSchedulingConflicts({
  agencyId,
  employeeIds,
  date,
  startTime,
  endTime,
}: {
  agencyId: string;
  employeeIds: string[];
  date: string;
  startTime: string;
  endTime: string;
}) {
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);

  const weekday = start.getDay(); // 0=Sun

  // Fetch requests that matter
  const requests = await prisma.employeeRequest.findMany({
    where: {
      employeeId: { in: employeeIds },
      agencyId,
      status: "Approved", // only approved requests block scheduling

      OR: [
        { type: "TimeOff" },
        { type: "Sick" },
        { type: "AvailabilityChange" },
      ],
    },
    include: { employee: true },
  });

  const conflicts: any[] = [];

  for (const req of requests) {
    // --- TIME OFF + SICK ---
    if (req.type === "TimeOff" || req.type === "Sick") {
      if (req.startDate && req.endDate) {
        const offStart = new Date(req.startDate);
        const offEnd = new Date(req.endDate);

        if (overlaps(start, end, offStart, offEnd)) {
          conflicts.push({
            employeeId: req.employeeId,
            reason: req.type,
            details: {
              type: req.timeOffType,
              range: [req.startDate, req.endDate],
            },
          });
        }
      }
    }

    // --- AVAILABILITY CHANGE ---
    if (req.type === "AvailabilityChange") {
      const availability = (req.availabilityChanges as any[]) || [];

      const matchesDay = availability.find((a) => a.weekday === weekday);

      if (!matchesDay) {
        conflicts.push({
          employeeId: req.employeeId,
          reason: "Availability",
          details: {
            requested: `${weekday}`,
            availability,
          },
        });
        continue;
      }

      const startMin = start.getHours() * 60 + start.getMinutes();
      const endMin = end.getHours() * 60 + end.getMinutes();
      const aStart =
        parseInt(matchesDay.start.split(":")[0]) * 60 +
        parseInt(matchesDay.start.split(":")[1]);
      const aEnd =
        parseInt(matchesDay.end.split(":")[0]) * 60 +
        parseInt(matchesDay.end.split(":")[1]);

      if (startMin < aStart || endMin > aEnd) {
        conflicts.push({
          employeeId: req.employeeId,
          reason: "Availability",
          details: {
            requested: `${matchesDay.start}-${matchesDay.end}`,
            availability,
          },
        });
      }
    }
  }

  return conflicts;
}
