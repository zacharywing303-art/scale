import prisma from "../lib/db";
import { addMinutes } from "date-fns";
import { addDays } from "date-fns";
import { createVisit } from "./visit.service";

type CreateScheduleInput = {
  scheduleType: "office" | "visit" | "facility";
  clientID?: string;
  clientMedicaidId?: string;
  serviceId?: string | null;
  authorizations?: string | null;
  authorizationNumber?: string | null;
  officeReason?: string | null;
  eventCode: string;
  authorizationBillUnitType: "Hourly" | "Unit" | "Visit";
  eventStatus: "Hold" | "Confirmed" | "Pending";
  eventDate: Date;
  startTime: Date; // ISO
  endTime: Date; // ISO
  employeeID?: string | null;
  recurring: boolean;
  dates: string[];
  comments?: string | null;
  billingOverride?: boolean;
  rate?: number | null;
  copay?: number | null;
  billAmount?: number | null;
  agencyID: string; // pass the agency code you track, e.g., "UNITY124"
  groupVisitCode?: string | null;
  recurringFrequency?: "WEEKLY" | "BIWEEKLY" | null;
  createdScheduleID?: string;
  recurringScheduleID?: string;
};

async function generateUniqueId(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

async function generateUniqueScheduleId(agencyID: string): Promise<string> {
  let unique = false;
  let scheduleID = "";
  while (!unique) {
    scheduleID = Math.floor(1000000 + Math.random() * 9000000).toString();
    const existing = await prisma.visit.findFirst({
      where: { agencyID, scheduleID },
      select: { id: true },
    });
    if (!existing) unique = true;
  }
  return scheduleID;
}

export async function createScheduleAndVisitBatch(input: {
  baseSchedule: any;
  selectedDates: string[];
  groupVisit?: boolean;
  employeeIDs?: string[];
  recurring?: boolean;
  recurringFrequency?: "WEEKLY" | "BIWEEKLY";
}) {
  const createdScheduleID = await generateUniqueId("SCH");
  const recurringScheduleID = input.recurring
    ? await generateUniqueId("REC")
    : null;

  const allSchedules: any[] = [];

  const makeOne = async (
    eventStart: Date,
    eventEnd: Date,
    employeeID?: string | null
  ) => {
    return createScheduleAndVisit({
      ...input.baseSchedule,
      eventDate: eventStart,
      startTime: eventStart,
      endTime: eventEnd,
      recurring: !!input.recurring,
      recurringFrequency: input.recurringFrequency ?? null,
      createdScheduleID,
      recurringScheduleID,
      groupVisit: input.groupVisit,
      employeeID: employeeID ?? null,
      employeeIDs: undefined,
    });
  };

  // Generate base schedules for the first range
  const baseDates: { start: Date; end: Date }[] = [];

  for (const dateString of input.selectedDates) {
    const date = new Date(dateString);
    const start = new Date(date);
    start.setHours(
      new Date(input.baseSchedule.startTime).getHours(),
      new Date(input.baseSchedule.startTime).getMinutes(),
      0,
      0
    );

    const end = new Date(date);
    end.setHours(
      new Date(input.baseSchedule.endTime).getHours(),
      new Date(input.baseSchedule.endTime).getMinutes(),
      0,
      0
    );

    baseDates.push({ start, end });

    // Create schedules for the base week
    if (
      input.baseSchedule.scheduleType !== "visit" &&
      input.employeeIDs?.length
    ) {
      for (const empId of input.employeeIDs) {
        allSchedules.push(await makeOne(start, end, empId));
      }
    } else if (
      input.baseSchedule.scheduleType === "visit" &&
      input.employeeIDs?.length
    ) {
      for (const empId of input.employeeIDs) {
        allSchedules.push(
          await createScheduleAndVisit({
            ...input.baseSchedule,
            eventDate: start,
            startTime: start,
            endTime: end,
            recurring: !!input.recurring,
            recurringFrequency: input.recurringFrequency ?? null,
            createdScheduleID,
            recurringScheduleID,
            groupVisit: input.groupVisit,
            employeeID: empId,
            employeeIDs: [empId],
          })
        );
      }
    } else {
      allSchedules.push(
        await createScheduleAndVisit({
          ...input.baseSchedule,
          eventDate: start,
          startTime: start,
          endTime: end,
          recurring: !!input.recurring,
          recurringFrequency: input.recurringFrequency ?? null,
          createdScheduleID,
          recurringScheduleID,
          groupVisit: input.groupVisit,
          employeeIDs: input.employeeIDs,
        })
      );
    }
  }

  // Apply recurrence after processing all base week dates
  if (input.recurring && input.recurringFrequency) {
    const offsetDays = input.recurringFrequency === "BIWEEKLY" ? 14 : 7;

    for (const { start, end } of baseDates) {
      const nextStart = new Date(start);
      nextStart.setDate(start.getDate() + offsetDays);
      const nextEnd = new Date(end);
      nextEnd.setDate(end.getDate() + offsetDays);

      if (
        input.baseSchedule.scheduleType !== "visit" &&
        input.employeeIDs?.length
      ) {
        for (const empId of input.employeeIDs) {
          allSchedules.push(await makeOne(nextStart, nextEnd, empId));
        }
      } else if (
        input.baseSchedule.scheduleType === "visit" &&
        input.groupVisit &&
        input.employeeIDs?.length
      ) {
        for (const empId of input.employeeIDs) {
          allSchedules.push(
            await createScheduleAndVisit({
              ...input.baseSchedule,
              eventDate: nextStart,
              startTime: nextStart,
              endTime: nextEnd,
              recurring: true,
              recurringFrequency: input.recurringFrequency,
              createdScheduleID,
              recurringScheduleID,
              groupVisit: true,
              employeeID: empId,
              employeeIDs: [empId],
            })
          );
        }
      } else {
        allSchedules.push(
          await createScheduleAndVisit({
            ...input.baseSchedule,
            eventDate: nextStart,
            startTime: nextStart,
            endTime: nextEnd,
            recurring: true,
            recurringFrequency: input.recurringFrequency,
            createdScheduleID,
            recurringScheduleID,
            groupVisit: input.groupVisit,
            employeeID:
              input.employeeIDs && input.employeeIDs.length === 1
                ? input.employeeIDs[0]
                : null,
          })
        );
      }
    }
  }

  return allSchedules;
}

export const getAllSchedules = async () => {
  const schedules = await prisma.schedule.findMany({
    include: {
      client: true,
      employee: true,
      service: true,
    },
    orderBy: { eventDate: "desc" },
  });

  return schedules.map((s) => ({
    ...s,
    startTime: s.startTime?.toISOString() ?? null,
    endTime: s.endTime?.toISOString() ?? null,
    eventDate: s.eventDate?.toISOString() ?? null,
  }));
};

export async function getScheduleById(id: string) {
  return prisma.schedule.findUnique({
    where: { id },
    include: {
      client: { select: { name: true } },
      employee: { select: { name: true } },
      service: { select: { name: true } },
    },
  });
}

export async function createScheduleAndVisit(
  input: CreateScheduleInput & {
    groupVisit?: boolean;
    employeeIDs?: string[];
    createdScheduleID?: string;
    recurringScheduleID?: string;
  }
) {
  return await prisma.$transaction(async (tx) => {
    if (input.endTime <= input.startTime)
      throw new Error("End time must be after start time");

    const createdScheduleID =
      input.createdScheduleID ||
      `SCH-${Math.floor(100000 + Math.random() * 900000)}`;

    const recurringScheduleID =
      input.recurring && !input.recurringScheduleID
        ? `REC-${Math.floor(100000 + Math.random() * 900000)}`
        : input.recurringScheduleID ?? null;

    const scheduledHours =
      (input.endTime.getTime() - input.startTime.getTime()) / 3600000;

    // Handle office/facility multi-employee case
    if (input.scheduleType !== "visit" && input.employeeIDs?.length) {
      const schedules = [];
      for (const empId of input.employeeIDs) {
        const schedule = await tx.schedule.create({
          data: {
            // required core fields
            scheduleType: input.scheduleType,
            eventDate: input.eventDate,
            startTime: input.startTime,
            endTime: input.endTime,
            authorizationBillUnitType: input.authorizationBillUnitType,
            eventStatus: input.eventStatus,
            agencyID: input.agencyID,
            eventCode: input.eventCode,
            dates: input.dates ?? [],

            // office/facility specifics
            employeeID: empId,
            officeReason: input.officeReason ?? null,
            comments: input.comments ?? null,

            // ids for grouping/recurrence (optional but nice to persist consistently)
            createdScheduleID:
              input.createdScheduleID ||
              `SCH-${Math.floor(100000 + Math.random() * 900000)}`,
            recurring: !!input.recurring,
            recurringFrequency: input.recurringFrequency ?? null,

            // explicitly null-out visit-only fields
            clientID: null,
            clientMedicaidId: null,
            serviceId: null,
          },
        });

        schedules.push(schedule);
      }
      return { schedules };
    }

    const schedule = await tx.schedule.create({
      data: {
        scheduleType: input.scheduleType,
        clientID: input.clientID ?? null,
        clientMedicaidId: input.clientMedicaidId ?? null,
        authorizations: input.authorizations ?? undefined,
        authorizationNumber: input.authorizationNumber ?? undefined,
        serviceId: input.serviceId ?? undefined,
        officeReason: input.officeReason ?? undefined,
        eventCode: input.eventCode,
        authorizationBillUnitType: input.authorizationBillUnitType,
        eventStatus: input.eventStatus,
        eventDate: input.eventDate,
        startTime: input.startTime,
        endTime: input.endTime,
        employeeID: input.employeeID ?? undefined,
        recurring: input.recurring,
        recurringFrequency: input.recurringFrequency ?? null,
        createdScheduleID,
        recurringScheduleID,
        dates: input.dates ?? [],
        comments: input.comments ?? undefined,
        agencyID: input.agencyID,
      },
    });

    // Only Visits → create Visit rows
    if (input.scheduleType !== "visit") {
      return { schedule, createdScheduleID, recurringScheduleID };
    }

    // Visit-related
    const service = input.serviceId
      ? await tx.service.findUnique({ where: { id: input.serviceId } })
      : null;

    const employees =
      input.groupVisit && input.employeeIDs?.length
        ? await tx.employee.findMany({
            where: { id: { in: input.employeeIDs } },
          })
        : input.employeeID
        ? await tx.employee.findMany({ where: { id: input.employeeID } })
        : [];

    const groupVisitCode = input.groupVisit
      ? input.groupVisitCode ||
        `GV-${Math.floor(100000 + Math.random() * 900000)}`
      : null;

    for (const emp of employees) {
      const scheduleID = await generateUniqueScheduleId(input.agencyID);
      await createVisit({
        agencyID: input.agencyID,
        clientId: input.clientID,
        employeeId: emp.id,
        scheduledTimeIn: input.startTime,
        scheduledTimeOut: input.endTime,
        scheduledHours,
        serviceId: input.serviceId,
        service: service ? `${service.code} - ${service.name}` : undefined,
        timeZone: "EST",
        location: "Schedule Created",
        source: "schedule",
        scheduleID,
        groupVisitCode,
      });
    }

    return { schedule, createdScheduleID, recurringScheduleID };
  });
}

export const updateSchedule = async (id: string, data: any) => {
  if (
    data.endTime &&
    data.startTime &&
    new Date(data.endTime) <= new Date(data.startTime)
  ) {
    throw new Error("End time must be after start time");
  }

  return prisma.schedule.update({
    where: { id },
    data: {
      scheduleType: data.type,
      eventDate: data.dateFrom,
      startTime: data.startTime,
      endTime: data.endTime,
      recurring: data.recurring,
      employee: data.employee
        ? { connect: { id: data.employee } }
        : { disconnect: true },
      client: data.client ? { connect: { id: data.client } } : undefined,
      service: data.service
        ? { connect: { id: data.service } }
        : { disconnect: true },
    },
  });
};

export async function getSchedulesByAgency(agencyId: string) {
  return prisma.schedule.findMany({
    where: { agencyID: agencyId },
    include: {
      client: { select: { id: true, name: true, medicaidID: true } },
      employee: { select: { id: true, name: true } },
      service: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "desc" },
  });
}

/**
 * Auto-generate next recurring schedules after the last ones have passed.
 * Run this via cron daily.
 */
export async function generateNextRecurringSchedules() {
  const now = new Date();

  // Find distinct recurring sets (groups) that are active
  const groups = await prisma.schedule.groupBy({
    by: ["recurringScheduleID", "recurringFrequency"],
    where: {
      recurring: true,
      recurringScheduleID: { not: null },
    },
    _max: { eventDate: true }, // last date in that group
  });

  for (const g of groups) {
    const recurringScheduleID = g.recurringScheduleID;
    const freq = g.recurringFrequency;

    if (!recurringScheduleID || !freq) continue;
    // Only roll forward after the latest event has passed
    const lastEventDate = g._max.eventDate;
    if (!lastEventDate || lastEventDate >= now) continue;

    // Cycle gap: always 14d for WEEKLY, 28d for BIWEEKLY (your “2/4 weeks ahead” rule)
    const cycleOffsetDays = freq === "BIWEEKLY" ? 28 : 14;

    // Pull the last cycle (we'll replicate its pattern forward)
    const lastCycle = await prisma.schedule.findMany({
      where: { recurringScheduleID },
      orderBy: { eventDate: "asc" },
    });

    if (!lastCycle.length) continue;

    // Compute the candidate next cycle date for each schedule in the group
    for (const s of lastCycle) {
      const newEventDate = new Date(s.eventDate);
      newEventDate.setDate(newEventDate.getDate() + cycleOffsetDays);

      const newStartTime = new Date(s.startTime);
      newStartTime.setDate(newStartTime.getDate() + cycleOffsetDays);

      const newEndTime = new Date(s.endTime);
      newEndTime.setDate(newEndTime.getDate() + cycleOffsetDays);

      // Dedup: skip if we already generated this one (same group, same employee/date)
      const already = await prisma.schedule.findFirst({
        where: {
          recurringScheduleID,
          eventDate: newEventDate,
          employeeID: s.employeeID ?? null,
          scheduleType: s.scheduleType,
        },
      });
      if (already) continue;

      // Build the safe input for createScheduleAndVisit (no nulls where undefined is expected)
      await createScheduleAndVisit({
        scheduleType: s.scheduleType as "office" | "visit" | "facility",

        clientID: s.clientID ?? undefined,
        clientMedicaidId: s.clientMedicaidId ?? undefined,

        serviceId: s.serviceId ?? undefined,
        authorizations: s.authorizations ?? undefined,
        authorizationNumber: s.authorizationNumber ?? undefined,

        officeReason: s.officeReason ?? undefined,
        eventCode: s.eventCode,
        authorizationBillUnitType: s.authorizationBillUnitType as
          | "Hourly"
          | "Unit"
          | "Visit",
        eventStatus: s.eventStatus as "Hold" | "Confirmed" | "Pending",

        eventDate: newEventDate,
        startTime: newStartTime,
        endTime: newEndTime,

        employeeID: s.employeeID ?? undefined,

        recurring: true,
        recurringFrequency: s.recurringFrequency ?? undefined,
        recurringScheduleID: s.recurringScheduleID ?? undefined,

        // new createdScheduleID for the new set
        createdScheduleID: await generateUniqueId("SCH"),

        dates: s.dates ?? [],
        comments: s.comments ?? undefined,
        billingOverride: s.billingOverride ?? undefined,
        rate: s.rate ?? undefined,
        copay: s.copay ?? undefined,
        billAmount: s.billAmount ?? undefined,

        agencyID: s.agencyID,
      });
    }
  }

  console.log("✅ Recurring schedule regeneration completed.");
}

export async function getGroupedSchedules(
  agencyID: string,
  from?: string,
  to?: string
) {
  const dateFilter =
    from && to
      ? {
          eventDate: {
            gte: new Date(from),
            lte: new Date(to),
          },
        }
      : {};

  const schedules = await prisma.schedule.findMany({
    where: {
      agencyID,
      ...dateFilter,
    },
    include: {
      client: { select: { id: true, name: true } },
      employee: { select: { id: true, name: true } },
      service: { select: { id: true, name: true } },
    },
    orderBy: { eventDate: "asc" },
  });

  // Group by createdScheduleID (shared across multi-day/employee schedules)
  const grouped = Object.values(
    schedules.reduce((acc, s) => {
      const key = s.createdScheduleID ?? s.id;
      if (!acc[key]) {
        acc[key] = {
          createdScheduleID: key,
          recurringScheduleID: s.recurringScheduleID,
          scheduleType: s.scheduleType,
          eventCode: s.eventCode,
          agencyID: s.agencyID,
          recurring: s.recurring,
          recurringFrequency: s.recurringFrequency,
          startDate: s.eventDate,
          endDate: s.eventDate,
          startTime: s.startTime,
          endTime: s.endTime,
          client: s.client,
          service: s.service,
          employees: [],
          weekdays: new Set<string>(),
        };
      }
      acc[key].employees.push(s.employee);
      const dayName = new Date(s.eventDate).toLocaleDateString("en-US", {
        weekday: "long",
      });
      acc[key].weekdays.add(dayName);

      if (new Date(s.eventDate) < new Date(acc[key].startDate))
        acc[key].startDate = s.eventDate;
      if (new Date(s.eventDate) > new Date(acc[key].endDate))
        acc[key].endDate = s.eventDate;

      return acc;
    }, {} as Record<string, any>)
  ).map((g) => ({
    ...g,
    weekdays: Array.from(g.weekdays),
  }));

  return grouped;
}

/**
 * Fetch all schedules in a createdScheduleID group
 */
export async function getSchedulesByGroup(createdScheduleID: string) {
  return prisma.schedule.findMany({
    where: { createdScheduleID },
    include: {
      client: { select: { id: true, name: true, medicaidID: true } },
      employee: { select: { id: true, name: true } },
      service: { select: { id: true, name: true } },
    },
    orderBy: { eventDate: "asc" },
  });
}

/**
 * Update all schedules in a group (multi-employee / multi-date)
 */
export async function updateScheduleGroup(
  createdScheduleID: string,
  data: any
) {
  const now = new Date();
  const group = await prisma.schedule.findMany({
    where: { createdScheduleID },
  });

  if (!group.length) throw new Error("No schedules found for this group.");

  for (const s of group) {
    // Only allow full edits for future schedules; past ones only toggle recurring
    if (s.eventDate < now) {
      await prisma.schedule.update({
        where: { id: s.id },
        data: { recurring: data.recurring ?? s.recurring },
      });
      continue;
    }

    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      if (end <= start) throw new Error("End time must be after start time");
    }

    await prisma.schedule.update({
      where: { id: s.id },
      data: {
        startTime: data.startTime ? new Date(data.startTime) : s.startTime,
        endTime: data.endTime ? new Date(data.endTime) : s.endTime,
        recurring: data.recurring ?? s.recurring,
        recurringFrequency: data.recurring
          ? data.recurringFrequency ?? null
          : null,
        officeReason: data.officeReason ?? s.officeReason,
        serviceId: data.serviceId ?? s.serviceId,
        employeeID: data.employeeID ?? s.employeeID,
        comments: data.comments ?? s.comments,
      },
    });
  }

  return { message: "Schedules updated successfully", count: group.length };
}

/**
 * Safely delete a schedule
 */
export async function deleteScheduleSafe(id: string) {
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: { client: true, service: true },
  });
  if (!schedule) throw new Error("Schedule not found.");

  const now = new Date();
  if (schedule.eventDate < now) {
    throw new Error("Cannot delete schedules whose date has already passed.");
  }

  // For visits: keep the visit record intact
  if (schedule.scheduleType === "visit") {
    await prisma.schedule.delete({ where: { id } });
    return {
      deleted: true,
      warning: "Visit records will remain (not deleted).",
    };
  }

  await prisma.schedule.delete({ where: { id } });
  return { deleted: true };
}
