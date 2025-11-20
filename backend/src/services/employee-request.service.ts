import prisma from "../lib/db";

export async function createTimeOffRequest(data: {
  employeeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  timeOffType: "PTO" | "Sick" | "Vacation" | "Personal" | "Unpaid";
}) {
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

export async function createAvailabilityChangeRequest(data: {
  employeeId: string;
  availabilityChanges: any; // [{weekday,start,end}]
  reason?: string;
}) {
  return prisma.employeeRequest.create({
    data: {
      type: "AvailabilityChange",
      employeeId: data.employeeId,
      availabilityChanges: data.availabilityChanges,
      reason: data.reason ?? null,
    },
  });
}

export async function createStatusChangeRequest(data: {
  employeeId: string;
  newStatus: string; // e.g. "Vacation"
  reason?: string;
}) {
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
      // wipe existing windows for involved weekdays
      await prisma.employeeAvailability.deleteMany({
        where: { employeeId: req.employeeId },
      });

      // recreate new windows
      const list = req.availabilityChanges as any[];
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
