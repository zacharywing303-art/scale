import prisma from "../lib/db";

async function getExceptionsCount(start?: Date, end?: Date) {
  const where: any = {};

  if (start && end) {
    // Backend safeguard: normalize to full days
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    where.date = { gte: s, lte: e }; // Use 'date' field instead of 'createdAt'
  } else if (start) {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    where.date = { gte: s };
  } else if (end) {
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    where.date = { lte: e };
  }

  const total = await prisma.visitException.count({ where });

  const grouped = await prisma.visitException.groupBy({
    by: ["exceptionType"],
    _count: { exceptionType: true },
    where,
  });

  return {
    total,
    types: grouped.map((g) => ({
      type: g.exceptionType,
      count: g._count.exceptionType,
    })),
  };
}

async function getStatusesSummary(start?: Date, end?: Date) {
  const where: any = {};

  if (start && end) {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    where.visitFromDate = { gte: s, lte: e }; // normalize full day
  } else if (start) {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    where.visitFromDate = { gte: s };
  } else if (end) {
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    where.visitFromDate = { lte: e };
  }

  const totalVisits = await prisma.visit.count({ where });

  const groupedStatuses = await prisma.visit.groupBy({
    by: ["visitStatus"],
    _count: { visitStatus: true },
    where,
  });

  return {
    total: totalVisits,
    statuses: groupedStatuses.map((g) => ({
      status: g.visitStatus,
      count: g._count.visitStatus,
    })),
  };
}

export async function getDashboardSummary(start?: Date, end?: Date) {
  const [exceptions, statuses] = await Promise.all([
    getExceptionsCount(start, end),
    getStatusesSummary(start, end),
  ]);

  return { exceptions, statuses };
}

export async function getDailySchedules(agencyID: string, date: string) {
  // Convert date string to start/end of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const schedules = await prisma.schedule.findMany({
    where: {
      agencyID,
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      client: {
        select: {
          name: true,
        },
      },
      employee: {
        select: {
          name: true,
        },
      },
      service: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return schedules.map((sch) => ({
    id: sch.id,
    scheduleType: sch.scheduleType,
    title: sch.scheduleType?.toLowerCase() === "office" ? "Office" : "Visit",
    time: sch.startTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    employeeName: `${sch.employee?.name || ""}`.trim(),
    clientName: sch.client ? `${sch.client.name || ""}`.trim() : undefined,
    detail:
      sch.scheduleType === "Office"
        ? sch.officeReason || "N/A"
        : sch.service?.name || "N/A",
  }));
}
