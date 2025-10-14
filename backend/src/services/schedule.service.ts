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
  recurring: boolean;
  dates: string[];
  comments?: string | null;
  billingOverride?: boolean;
  rate?: number | null;
  copay?: number | null;
  billAmount?: number | null;
  agencyID: string; // pass the agency code you track, e.g., "UNITY124"
};

export const getAllSchedules = async () => {
  const schedules = await prisma.schedule.findMany({
    include: {
      client: true,
      employee: true,
      service: true,
    },
  });

  return schedules.map((s) => ({
    ...s,
    startTime: s.startTime ? new Date(s.startTime).toISOString() : null,
    endTime: s.endTime ? new Date(s.endTime).toISOString() : null,
    eventDate: s.eventDate ? new Date(s.eventDate).toISOString() : null,
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

export async function createScheduleAndVisit(input: CreateScheduleInput) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Validation
    if (input.endTime <= input.startTime) {
      throw new Error("End time must be after start time");
    }

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

    // 2) Get related data for visit
    const client = await tx.client.findUnique({
      where: { id: input.clientID },
      select: { name: true, medicaidID: true },
    });

    const employee = input.employeeID
      ? await tx.employee.findUnique({
          where: { id: input.employeeID },
          select: { name: true },
        })
      : null;

    const service = input.serviceId
      ? await tx.service.findUnique({
          where: { id: input.serviceId },
          select: { code: true, name: true },
        })
      : null;

    const scheduledHours =
      (input.endTime.getTime() - input.startTime.getTime()) / 1000 / 60 / 60;

    // 3) Create Visit
    await tx.visit.create({
      data: {
        agencyID: input.agencyID,
        scheduledTimeIn: input.startTime,
        scheduledTimeOut: input.endTime,
        scheduledHours,
        visitStatus: "Scheduled",
        clientID: input.clientID ? Number(input.clientID) : undefined,
        clientMedicaidID: client?.medicaidID ?? input.clientMedicaidId,
        clientName: client?.name,
        employeeID: input.employeeID ? Number(input.employeeID) : undefined,
        employeeName: employee?.name,
        service: service ? `${service.code} - ${service.name}` : undefined,
        payEqualsSch: true,
        memo: input.comments ?? undefined,
      },
    });

    return schedule;
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
