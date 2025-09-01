// import prisma from "../lib/db";

// export const getAllSchedules = async () => {
//   return prisma.schedule.findMany({
//     include: {
//       client: true,
//       employee: true,
//       service: true,
//     },
//   });
// };

// export const createSchedule = async (data: any) => {
//   // Validate required fields
//   if (!data.scheduleType) throw new Error("scheduleType is required");
//   if (!data.startTime || !data.endTime)
//     throw new Error("start/end time required");

//   // Different logic depending on type
//   if (data.scheduleType === "office") {
//     if (!data.officeReason) throw new Error("Office schedules require reason");
//   }

//   if (data.scheduleType === "visit") {
//     if (!data.clientID || !data.serviceId) {
//       throw new Error("Visit requires client and service");
//     }
//   }

//   if (data.scheduleType === "facility") {
//     // ⚡️ Define rules later (maybe facilityID?)
//   }

//   return prisma.schedule.create({
//     data: {
//       scheduleType: data.scheduleType,
//       clientID: data.clientID,
//       clientMedicaidId: data.clientMedicaidId,
//       authorizations: data.authorizations,
//       authorizationNumber: data.authorizationNumber,
//       serviceId: data.serviceId,
//       officeReason: data.officeReason,
//       eventCode: data.eventCode,
//       authorizationBillUnitType: data.authorizationBillUnitType,
//       eventStatus: data.eventStatus,
//       eventDate: new Date(data.eventDate),
//       startTime: new Date(data.startTime),
//       endTime: new Date(data.endTime),
//       employeeID: data.employeeID,
//       repeatedEvent: data.repeatedEvent,
//       dates: data.dates || [],
//       comments: data.comments,
//       billingOverride: data.billingOverride || false,
//       rate: data.rate,
//       copay: data.copay,
//       billAmount: data.billAmount,
//     },
//   });
// };
import prisma from "../lib/db";
import { addMinutes } from "date-fns";

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
  repeatedEvent: boolean;
  dates: string[];
  comments?: string | null;
  billingOverride?: boolean;
  rate?: number | null;
  copay?: number | null;
  billAmount?: number | null;
  agencyID: string; // pass the agency code you track, e.g., "UNITY124"
};

export const getAllSchedules = async () => {
  return prisma.schedule.findMany({
    include: {
      client: true,
      employee: true,
      service: true,
    },
  });
};

export async function createScheduleAndVisit(input: CreateScheduleInput) {
  return await prisma.$transaction(async (tx) => {
    // 1) Create Schedule
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
        repeatedEvent: input.repeatedEvent,
        dates: input.dates,
        comments: input.comments ?? undefined,
        billingOverride: input.billingOverride ?? false,
        rate: input.rate ?? undefined,
        copay: input.copay ?? undefined,
        billAmount: input.billAmount ?? undefined,
        agencyID: input.agencyID,
      },
    });

    // 2) Create the matching Visit
    // Initial status = Scheduled (enum default). We’ll let the worker update status later.
    const scheduledHours =
      (input.endTime.getTime() - input.startTime.getTime()) / 1000 / 60 / 60;

    await tx.visit.create({
      data: {
        agencyID: input.agencyID,
        scheduledTimeIn: input.startTime,
        scheduledTimeOut: input.endTime,
        scheduledHours,
        visitStatus: "Scheduled",
        clientID: undefined, // you’re using string IDs elsewhere; keep visit’s client references as descriptive
        clientMedicaidID: input.clientMedicaidId,
        clientName: (
          await tx.client.findUnique({
            where: { id: input.clientID },
            select: { name: true },
          })
        )?.name,
        employeeID: undefined, // visit has Int? in schema; keep informative fields instead
        employeeName: input.employeeID
          ? (
              await tx.employee.findUnique({
                where: { id: input.employeeID },
                select: { name: true },
              })
            )?.name
          : undefined,
        service: input.serviceId
          ? (await tx.service.findUnique({
              where: { id: input.serviceId },
              select: { code: true, name: true },
            })) && "ok"
          : undefined, // keep as string for now per schema; if you prefer "CODE - NAME", build that string

        payEqualsSch: true, // aligns with “use scheduled hours” default
        memo: input.comments ?? undefined,
      },
    });

    return schedule;
  });
}
