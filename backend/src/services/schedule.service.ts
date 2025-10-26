import prisma from "../lib/db";
import { addMinutes } from "date-fns";
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
};

async function generateUniqueScheduleId(agencyID: string): Promise<string> {
  let unique = false;
  let scheduleID = "";

  while (!unique) {
    scheduleID = Math.floor(1000000 + Math.random() * 9000000).toString(); // 7 digits

    const existing = await prisma.visit.findFirst({
      where: { agencyID, scheduleID },
      select: { id: true },
    });

    if (!existing) unique = true;
  }

  return scheduleID;
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
    employeeIDs?: string[]; // for group visits
  }
) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (input.endTime <= input.startTime)
      throw new Error("End time must be after start time");

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
        dates: input.dates,
        comments: input.comments ?? undefined,
        billingOverride: input.billingOverride ?? false,
        rate: input.rate ?? undefined,
        copay: input.copay ?? undefined,
        billAmount: input.billAmount ?? undefined,
        agencyID: input.agencyID,
      },
    });

    // related data
    const service = input.serviceId
      ? await tx.service.findUnique({ where: { id: input.serviceId } })
      : null;

    const groupVisitCode = input.groupVisit
      ? `GV-${Math.floor(100000 + Math.random() * 900000)}`
      : null;

    const employees =
      input.groupVisit && input.employeeIDs?.length
        ? await tx.employee.findMany({
            where: { id: { in: input.employeeIDs } },
          })
        : input.employeeID
        ? await tx.employee.findMany({ where: { id: input.employeeID } })
        : [];

    // create visit(s)
    for (const emp of employees) {
      const scheduleID = await generateUniqueScheduleId(input.agencyID);
      await createVisit({
        agencyID: input.agencyID,
        clientId: input.clientID,
        employeeId: emp.id,
        scheduledTimeIn: input.startTime,
        scheduledTimeOut: input.endTime,
        serviceId: input.serviceId,
        service: service ? `${service.code} - ${service.name}` : undefined,
        timeZone: "EST",
        location: "Schedule Created",
        source: "schedule",
        scheduleID,
        groupVisitCode,
      });
    }

    return schedule;
  });
}
// export async function createScheduleAndVisit(input: CreateScheduleInput) {
//   return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
//     // Validation
//     if (input.endTime <= input.startTime) {
//       throw new Error("End time must be after start time");
//     }

//     // 1) Create Schedule
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

//     // 2) Get related data for visit
//     const client = await tx.client.findUnique({
//       where: { id: input.clientID },
//       select: { name: true, medicaidID: true },
//     });

//     const employee = input.employeeID
//       ? await tx.employee.findUnique({
//           where: { id: input.employeeID },
//           select: { name: true },
//         })
//       : null;

//     const service = input.serviceId
//       ? await tx.service.findUnique({
//           where: { id: input.serviceId },
//           select: { code: true, name: true },
//         })
//       : null;

//     const scheduledHours =
//       (input.endTime.getTime() - input.startTime.getTime()) / 1000 / 60 / 60;

//     // 3️⃣ Generate unique schedule ID for visit
//     const scheduleID = await generateUniqueScheduleId(input.agencyID);

//     // 3) Create Visit
//     await createVisit({
//       agencyID: input.agencyID,
//       clientId: input.clientID,
//       employeeId: input.employeeID,
//       scheduledTimeIn: input.startTime,
//       scheduledTimeOut: input.endTime,
//       service: service ? `${service.code} - ${service.name}` : undefined,
//       timeZone: "EST",
//       location: "Schedule Created",
//       source: "schedule",
//       scheduleID,
//     });

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
