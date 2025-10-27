import prisma from "../lib/db";
import { addMinutes } from "date-fns";
import { addDays } from "date-fns";
import { createVisit } from "./visit.service";

type CreateScheduleInput = {
  scheduleType: "office" | "visit" | "facility";
  clientID: string;
  clientMedicaidId: string;
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

/**
 * Create multiple schedules + visits (supports multi-day + recurrence)
 */
export async function createScheduleAndVisitBatch(input: {
  baseSchedule: any; // Reuse CreateScheduleInput
  selectedDates: string[]; // ISO strings
  groupVisit?: boolean;
  employeeIDs?: string[];
  recurring?: boolean;
  recurringFrequency?: "WEEKLY" | "BIWEEKLY";
}) {
  const createdScheduleID = await generateUniqueId("SCH");
  const recurringScheduleID = input.recurring
    ? await generateUniqueId("REC")
    : null;

  const allSchedules = [];

  for (const dateString of input.selectedDates) {
    const date = new Date(dateString);
    const start = new Date(date);
    const end = new Date(date);

    // Align start/end times with base
    start.setHours(
      new Date(input.baseSchedule.startTime).getHours(),
      new Date(input.baseSchedule.startTime).getMinutes(),
      0,
      0
    );
    end.setHours(
      new Date(input.baseSchedule.endTime).getHours(),
      new Date(input.baseSchedule.endTime).getMinutes(),
      0,
      0
    );

    const schedule = await createScheduleAndVisit({
      ...input.baseSchedule,
      eventDate: start,
      startTime: start,
      endTime: end,
      recurring: input.recurring ?? false,
      recurringFrequency: input.recurringFrequency ?? null,
      createdScheduleID,
      recurringScheduleID,
      groupVisit: input.groupVisit,
      employeeIDs: input.employeeIDs,
    });

    allSchedules.push(schedule);

    // If recurring, add next-week or biweekly versions
    if (input.recurring && input.recurringFrequency) {
      const addDaysCount = input.recurringFrequency === "BIWEEKLY" ? 14 : 7;

      const nextStart = addDays(start, addDaysCount);
      const nextEnd = addDays(end, addDaysCount);

      const nextSchedule = await createScheduleAndVisit({
        ...input.baseSchedule,
        eventDate: nextStart,
        startTime: nextStart,
        endTime: nextEnd,
        recurring: true,
        recurringFrequency: input.recurringFrequency,
        createdScheduleID,
        recurringScheduleID,
        groupVisit: input.groupVisit,
        employeeIDs: input.employeeIDs,
      });

      allSchedules.push(nextSchedule);
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

import type { Prisma } from "@prisma/client";

export async function createScheduleAndVisit(
  input: CreateScheduleInput & {
    groupVisit?: boolean;
    employeeIDs?: string[];
    createdScheduleID?: string;
    recurringScheduleID?: string;
  }
) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
      (input.endTime.getTime() - input.startTime.getTime()) / 1000 / 60 / 60;

    // 1️⃣ Create Schedule record
    const schedule = await tx.schedule.create({
      data: {
        scheduleType: input.scheduleType,
        clientID: input.clientID,
        clientMedicaidId: input.clientMedicaidId,
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

    // 2️⃣ Related data for visits
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

    // 3️⃣ Create visit(s)
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

    return {
      schedule,
      createdScheduleID,
      recurringScheduleID,
    };
  });
}

// export async function createScheduleAndVisit(
//   input: CreateScheduleInput & {
//     groupVisit?: boolean;
//     employeeIDs?: string[]; // for group visits
//   }
// ) {
//   return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
//     if (input.endTime <= input.startTime)
//       throw new Error("End time must be after start time");

//     const schedule = await tx.schedule.create({
//       data: {
//         scheduleType: input.scheduleType,
//         clientID: input.clientID,
//         clientMedicaidId: input.clientMedicaidId,
//         authorizations: input.authorizations ?? undefined,
//         authorizationNumber: input.authorizationNumber ?? undefined,
//         serviceId: input.serviceId ?? undefined,
//         officeReason: input.officeReason ?? undefined,
//         eventCode: input.eventCode,
//         authorizationBillUnitType: input.authorizationBillUnitType,
//         eventStatus: input.eventStatus,
//         eventDate: input.eventDate,
//         startTime: input.startTime,
//         endTime: input.endTime,
//         employeeID: input.employeeID ?? undefined,
//         recurring: input.recurring,
//         dates: input.dates,
//         comments: input.comments ?? undefined,
//         billingOverride: input.billingOverride ?? false,
//         rate: input.rate ?? undefined,
//         copay: input.copay ?? undefined,
//         billAmount: input.billAmount ?? undefined,
//         agencyID: input.agencyID,
//       },
//     });

//     // related data
//     const service = input.serviceId
//       ? await tx.service.findUnique({ where: { id: input.serviceId } })
//       : null;

//     const groupVisitCode = input.groupVisit
//       ? `GV-${Math.floor(100000 + Math.random() * 900000)}`
//       : null;

//     const employees =
//       input.groupVisit && input.employeeIDs?.length
//         ? await tx.employee.findMany({
//             where: { id: { in: input.employeeIDs } },
//           })
//         : input.employeeID
//         ? await tx.employee.findMany({ where: { id: input.employeeID } })
//         : [];

//     // create visit(s)
//     for (const emp of employees) {
//       const scheduleID = await generateUniqueScheduleId(input.agencyID);
//       await createVisit({
//         agencyID: input.agencyID,
//         clientId: input.clientID,
//         employeeId: emp.id,
//         scheduledTimeIn: input.startTime,
//         scheduledTimeOut: input.endTime,
//         serviceId: input.serviceId,
//         service: service ? `${service.code} - ${service.name}` : undefined,
//         timeZone: "EST",
//         location: "Schedule Created",
//         source: "schedule",
//         scheduleID,
//         groupVisitCode,
//       });
//     }

//     return schedule;
//   });
// }

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
