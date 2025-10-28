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
  recurringScheduleID?: string | null;
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

  // 1️⃣ Generate base schedules for the first range
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

    // create schedules for the base week
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

  // 2️⃣ Apply recurrence after processing all base week dates
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

// export async function createScheduleAndVisitBatch(input: {
//   baseSchedule: any;
//   selectedDates: string[];
//   groupVisit?: boolean;
//   employeeIDs?: string[];
//   recurring?: boolean;
//   recurringFrequency?: "WEEKLY" | "BIWEEKLY";
// }) {
//   const createdScheduleID = await generateUniqueId("SCH");
//   const recurringScheduleID = input.recurring
//     ? await generateUniqueId("REC")
//     : null;

//   const allSchedules: any[] = [];

//   const makeOne = async (
//     eventStart: Date,
//     eventEnd: Date,
//     employeeID?: string | null
//   ) => {
//     return createScheduleAndVisit({
//       ...input.baseSchedule,
//       eventDate: eventStart,
//       startTime: eventStart,
//       endTime: eventEnd,
//       recurring: !!input.recurring,
//       recurringFrequency: input.recurringFrequency ?? null,
//       createdScheduleID,
//       recurringScheduleID,
//       groupVisit: input.groupVisit,
//       employeeID: employeeID ?? null,
//       employeeIDs: undefined, // not needed here (we loop ourselves)
//     });
//   };

//   for (const dateString of input.selectedDates) {
//     const date = new Date(dateString);

//     const start = new Date(date);
//     start.setHours(
//       new Date(input.baseSchedule.startTime).getHours(),
//       new Date(input.baseSchedule.startTime).getMinutes(),
//       0,
//       0
//     );

//     const end = new Date(date);
//     end.setHours(
//       new Date(input.baseSchedule.endTime).getHours(),
//       new Date(input.baseSchedule.endTime).getMinutes(),
//       0,
//       0
//     );

//     // Non-visit: create one Schedule PER employee (no visits)
//     if (
//       input.baseSchedule.scheduleType !== "visit" &&
//       input.employeeIDs?.length
//     ) {
//       for (const empId of input.employeeIDs) {
//         allSchedules.push(await makeOne(start, end, empId));
//       }
//     } // Visit: make separate schedules per employee if groupVisit
//     else if (
//       input.baseSchedule.scheduleType === "visit" &&
//       input.employeeIDs?.length
//     ) {
//       for (const empId of input.employeeIDs) {
//         allSchedules.push(
//           await createScheduleAndVisit({
//             ...input.baseSchedule,
//             eventDate: start,
//             startTime: start,
//             endTime: end,
//             recurring: !!input.recurring,
//             recurringFrequency: input.recurringFrequency ?? null,
//             createdScheduleID,
//             recurringScheduleID,
//             groupVisit: input.groupVisit,
//             employeeID: empId,
//             employeeIDs: [empId],
//           })
//         );
//       }
//     } else {
//       allSchedules.push(
//         await createScheduleAndVisit({
//           ...input.baseSchedule,
//           eventDate: start,
//           startTime: start,
//           endTime: end,
//           recurring: !!input.recurring,
//           recurringFrequency: input.recurringFrequency ?? null,
//           createdScheduleID,
//           recurringScheduleID,
//           groupVisit: input.groupVisit,
//           employeeIDs: input.employeeIDs,
//         })
//       );
//     }

//     // Recurrence (second set only, as per your current logic)
//     // Recurrence handling
//     if (input.recurring && input.recurringFrequency) {
//       const addDaysCount = input.recurringFrequency === "BIWEEKLY" ? 14 : 7;
//       const nextStart = new Date(start);
//       nextStart.setDate(start.getDate() + addDaysCount);
//       const nextEnd = new Date(end);
//       nextEnd.setDate(end.getDate() + addDaysCount);

//       // Office/facility multi-employee recurrence
//       if (
//         input.baseSchedule.scheduleType !== "visit" &&
//         input.employeeIDs?.length
//       ) {
//         for (const empId of input.employeeIDs) {
//           allSchedules.push(await makeOne(nextStart, nextEnd, empId));
//         }
//       }
//       // Visit group recurrence (❗ now loops per employee)
//       else if (
//         input.baseSchedule.scheduleType === "visit" &&
//         input.groupVisit &&
//         input.employeeIDs?.length
//       ) {
//         for (const empId of input.employeeIDs) {
//           allSchedules.push(
//             await createScheduleAndVisit({
//               ...input.baseSchedule,
//               eventDate: nextStart,
//               startTime: nextStart,
//               endTime: nextEnd,
//               recurring: true,
//               recurringFrequency: input.recurringFrequency,
//               createdScheduleID,
//               recurringScheduleID,
//               groupVisit: true,
//               employeeID: empId,
//               employeeIDs: [empId],
//             })
//           );
//         }
//       }
//       // Visit single-employee recurrence
//       else {
//         allSchedules.push(
//           await createScheduleAndVisit({
//             ...input.baseSchedule,
//             eventDate: nextStart,
//             startTime: nextStart,
//             endTime: nextEnd,
//             recurring: true,
//             recurringFrequency: input.recurringFrequency,
//             createdScheduleID,
//             recurringScheduleID,
//             groupVisit: input.groupVisit,
//             employeeID:
//               input.employeeIDs && input.employeeIDs.length === 1
//                 ? input.employeeIDs[0]
//                 : null,
//           })
//         );
//       }
//     }
//   }

//   return allSchedules;
// }

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

    // Create the schedule

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

            // 🔴 these two were missing and are required by your schema
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

  // Fetch all recurring schedules whose last event has passed
  const recurringSets = await prisma.schedule.findMany({
    where: {
      recurring: true,
      eventDate: { lt: now },
    },
    distinct: ["recurringScheduleID"],
    orderBy: { eventDate: "desc" },
  });

  for (const schedule of recurringSets) {
    if (!schedule.recurringScheduleID || !schedule.recurringFrequency) continue;

    const freq = schedule.recurringFrequency;
    const offsetDays = freq === "BIWEEKLY" ? 28 : 14; // double cycle gap
    const newStart = new Date(schedule.eventDate);
    newStart.setDate(newStart.getDate() + offsetDays);

    // Skip if future recurrence already exists
    const existing = await prisma.schedule.findFirst({
      where: {
        recurringScheduleID: schedule.recurringScheduleID,
        eventDate: newStart,
      },
    });
    if (existing) continue;

    // Find all schedules in this recurrence group (same week pattern)
    const sameGroup = await prisma.schedule.findMany({
      where: { recurringScheduleID: schedule.recurringScheduleID },
    });

    for (const s of sameGroup) {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      const startDiff = start.getDate() - s.eventDate.getDate();
      const newEventDate = new Date(s.eventDate);
      newEventDate.setDate(s.eventDate.getDate() + offsetDays);
      const newStartTime = new Date(s.startTime);
      newStartTime.setDate(newStartTime.getDate() + offsetDays);
      const newEndTime = new Date(s.endTime);
      newEndTime.setDate(newEndTime.getDate() + offsetDays);

      await createScheduleAndVisit({
        ...s,
        eventDate: newEventDate,
        startTime: newStartTime,
        endTime: newEndTime,
        recurring: true,
        recurringFrequency: s.recurringFrequency,
        recurringScheduleID: s.recurringScheduleID,
        createdScheduleID: await generateUniqueId("SCH"),
      });
    }
  }

  console.log(`✅ Recurring schedule regeneration completed.`);
}
