import prisma from "../lib/db";
import { Prisma } from "@prisma/client";

export type TimeOffType = "PTO" | "Sick" | "Vacation" | "Personal" | "Unpaid";

export interface TimeOffRequestDTO {
  employeeId: string;
  startDate: string; // ISO
  endDate: string; // ISO
  reason?: string;
  timeOffType: TimeOffType;
}

export interface AvailabilityChangeWindowDTO {
  weekday: number; // 0–6 (Sun–Sat)
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface AvailabilityChangeDTO {
  employeeId: string;
  availabilityChanges: AvailabilityChangeWindowDTO[];
  reason?: string;
}

export interface StatusChangeDTO {
  employeeId: string;
  newStatus: string; // e.g. "Vacation", "Sick"
  reason?: string;
}

export interface PtoUsageSummary {
  employeeId: string;
  approvedDays: number;
  usedDays: number;
  remainingDays: number;
}

export async function createTimeOffRequest(data: TimeOffRequestDTO) {
  return prisma.employeeRequest.create({
    data: {
      type: "TimeOff",
      employeeId: data.employeeId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
      timeOffType: data.timeOffType,
    },
  });
}

export async function createAvailabilityChangeRequest(
  data: AvailabilityChangeDTO
) {
  return prisma.employeeRequest.create({
    data: {
      type: "AvailabilityChange",
      employeeId: data.employeeId,
      availabilityChanges:
        data.availabilityChanges as unknown as Prisma.JsonArray,
      reason: data.reason ?? null,
    },
  });
}

export async function createStatusChangeRequest(data: StatusChangeDTO) {
  return prisma.employeeRequest.create({
    data: {
      type: "StatusChange",
      employeeId: data.employeeId,
      newStatus: data.newStatus,
      reason: data.reason,
    },
  });
}

export async function getPendingRequests(agencyId: string) {
  return prisma.employeeRequest.findMany({
    where: {
      employee: { agencyID: agencyId },
      status: "Pending",
    },
    include: {
      employee: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function approveRequest(requestId: string, adminUserId: string) {
  const req = await prisma.employeeRequest.findUnique({
    where: { id: requestId },
  });

  if (!req) throw new Error("Request not found");

  switch (req.type) {
    case "TimeOff":
      await prisma.employeeTimeOff.create({
        data: {
          employeeId: req.employeeId,
          startDate: req.startDate!,
          endDate: req.endDate!,
          type: req.timeOffType!,
          createdById: adminUserId,
        },
      });
      break;

    case "AvailabilityChange":
      // wipe existing windows
      await prisma.employeeAvailability.deleteMany({
        where: { employeeId: req.employeeId },
      });

      // recreate new windows from JSON
      {
        const list = (req.availabilityChanges as any[]) || [];
        for (const a of list) {
          await prisma.employeeAvailability.create({
            data: {
              employeeId: req.employeeId,
              weekday: a.weekday,
              startTime: a.start,
              endTime: a.end,
            },
          });
        }
      }
      break;

    case "StatusChange":
      if (req.newStatus == null) {
        throw new Error("Status change request missing new status");
      }
      await prisma.employee.update({
        where: { id: req.employeeId },
        data: { status: req.newStatus },
      });
      break;
  }

  return prisma.employeeRequest.update({
    where: { id: requestId },
    data: { status: "Approved" },
  });
}

export async function declineRequest(requestId: string) {
  return prisma.employeeRequest.update({
    where: { id: requestId },
    data: { status: "Declined" },
  });
}

/**
 * PTO usage summary for a given employee.
 * Requires Employee.ptoDaysAllowed Int @default(14) in schema.
 */
export async function getPtoUsage(
  employeeId: string
): Promise<PtoUsageSummary> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // @ts-ignore – ptoDaysAllowed should be added to Employee model
  const approvedDays: number = (employee as any).ptoDaysAllowed ?? 14;

  const ptoRecords = await prisma.employeeTimeOff.findMany({
    where: {
      employeeId,
      type: "PTO",
      status: "Approved",
    },
  });

  const usedDays = ptoRecords.reduce((sum: any, rec: any) => {
    const start = rec.startDate;
    const end = rec.endDate;
    const diffMs = end.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return sum + Math.max(days, 0);
  }, 0);

  const remainingDays = Math.max(approvedDays - usedDays, 0);

  return {
    employeeId,
    approvedDays,
    usedDays,
    remainingDays,
  };
}
