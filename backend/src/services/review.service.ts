import prisma from "../lib/db";
import { startOfDay, endOfDay } from "date-fns";

function safeDateRange(from?: string, to?: string) {
  if (!from || !to) return null;
  const start = startOfDay(new Date(from));
  const end = endOfDay(new Date(to));
  return { start, end };
}

function computeVisitHours(v: any) {
  if (typeof v.callHours === "number") return v.callHours;
  if (v.callIn && v.callOut) {
    const diffMs = new Date(v.callOut).getTime() - new Date(v.callIn).getTime();
    return diffMs / (1000 * 60 * 60);
  }
  if (v.scheduledTimeIn && v.scheduledTimeOut) {
    const diffMs =
      new Date(v.scheduledTimeOut).getTime() -
      new Date(v.scheduledTimeIn).getTime();
    return diffMs / (1000 * 60 * 60);
  }
  return 0;
}

function countExceptionFlags(v: any) {
  const flags = [
    v.unknownClientException,
    v.unknownEmployeeException,
    v.visitWithoutInCallException,
    v.visitWithoutOutCallException,
    v.unmatchedClientPhoneException,
    v.missingServiceException,
    v.unauthorizedServiceException,
    v.missingPayerException,
    v.shortVisitException,
    v.noShowException,
    v.visitVerificationException,
    v.clientSignatureException,
    v.serviceVerificationException,
    v.missingLocationException,
  ];
  return flags.filter(Boolean).length;
}

function exceptionBreakdown(visits: any[]) {
  const map: Record<string, number> = {};
  visits.forEach((v) => {
    const keys = [
      ["Unknown Client", v.unknownClientException],
      ["Unknown Employee", v.unknownEmployeeException],
      ["Missing In Call", v.visitWithoutInCallException],
      ["Missing Out Call", v.visitWithoutOutCallException],
      ["Unmatched Client Phone", v.unmatchedClientPhoneException],
      ["Missing Service", v.missingServiceException],
      ["Unauthorized Service", v.unauthorizedServiceException],
      ["Missing Payer", v.missingPayerException],
      ["Short Visit", v.shortVisitException],
      ["No Show", v.noShowException],
      ["Visit Verification", v.visitVerificationException],
      ["Client Signature", v.clientSignatureException],
      ["Service Verification", v.serviceVerificationException],
      ["Missing Location", v.missingLocationException],
    ] as const;

    keys.forEach(([label, val]) => {
      if (!val) return;
      map[label] = (map[label] ?? 0) + 1;
    });
  });
  return map;
}

function percent(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 1000) / 10; // ← one decimal
}

/** ===========================
 * EMPLOYEE REVIEW DATA
 * =========================== */
export async function getEmployeeReviewData(opts: {
  agencyId: string;
  employeeId: string;
  from?: string;
  to?: string;
}) {
  const range = safeDateRange(opts.from, opts.to);

  const visits = await prisma.visit.findMany({
    where: {
      agencyID: opts.agencyId,
      employeeID: opts.employeeId,
      ...(range
        ? {
            OR: [
              { callIn: { gte: range.start, lte: range.end } },
              { scheduledTimeIn: { gte: range.start, lte: range.end } },
            ],
          }
        : {}),
    },
    include: {
      GPSException: true,
      service: true,
      client: true,
    } as any,
  });

  if (visits.length === 0) {
    return { employeeId: opts.employeeId, analytics: null };
  }

  const totalVisits = visits.length;
  const totalHours = visits.reduce((sum, v) => sum + computeVisitHours(v), 0);

  const totalExceptionVisits = visits.filter(
    (v) => (v.totalCurrentExceptions ?? 0) > 0 || countExceptionFlags(v) > 0
  ).length;

  const totalExceptions = visits.reduce(
    (sum, v) => sum + (v.totalCurrentExceptions ?? 0) + countExceptionFlags(v),
    0
  );

  const gpsExceptionVisits = visits.filter(
    (v) => v.GPSException?.length > 0
  ).length;
  const gpsExceptionCount = visits.reduce(
    (sum, v) => sum + (v.GPSException?.length ?? 0),
    0
  );

  const mileageAvg =
    totalVisits > 0
      ? visits.reduce((s, v) => s + (v.mileage ?? 0), 0) / totalVisits
      : 0;

  // Breakdown by client
  const clientCounts: Record<string, number> = {};
  visits.forEach((v) => {
    const name = v.clientName || "Unknown Client";
    clientCounts[name] = (clientCounts[name] ?? 0) + 1;
  });

  // Breakdown by services
  const serviceCounts: Record<string, number> = {};
  visits.forEach((v) => {
    const svc = v.serviceName || "Unknown Service";
    serviceCounts[svc] = (serviceCounts[svc] ?? 0) + 1;
  });

  const topClient = Object.entries(clientCounts).sort((a, b) => b[1] - a[1])[0];
  const topService = Object.entries(serviceCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Schedules breakdown
  const schedules = range
    ? await prisma.schedule.findMany({
        where: {
          agencyID: opts.agencyId,
          employeeID: opts.employeeId,
          startTime: { gte: range.start, lte: range.end },
        },
      })
    : await prisma.schedule.findMany({
        where: {
          agencyID: opts.agencyId,
          employeeID: opts.employeeId,
        },
      });

  const schedBreakdown: Record<string, number> = {};
  schedules.forEach((s) => {
    const t = s.scheduleType || "visit";
    schedBreakdown[t] = (schedBreakdown[t] ?? 0) + 1;
  });

  return {
    employeeId: opts.employeeId,
    analytics: {
      totalVisits,
      totalHours,
      totalScheduledShifts: schedules.length,
      scheduledBreakdown: schedBreakdown,
      totalExceptions,
      totalExceptionVisits,
      percentVisitsWithException: percent(totalExceptionVisits, totalVisits),
      gpsExceptionCount,
      gpsExceptionVisits,
      percentVisitsWithGpsException: percent(gpsExceptionVisits, totalVisits),
      clientsWorkedWith: Object.keys(clientCounts).length,
      visitsPerClient: Object.entries(clientCounts).map(([client, count]) => ({
        client,
        count,
        percent: percent(count, totalVisits),
      })),
      visitsPerService: Object.entries(serviceCounts).map(
        ([service, count]) => ({
          service,
          count,
          percent: percent(count, totalVisits),
        })
      ),
      exceptionBreakdown: exceptionBreakdown(visits),
      evvTrainingCompletionPercent: 100,
      topServiceProvided: topService?.[0] ?? null,
      topClientWorkedWith: topClient?.[0] ?? null,
      averageMileagePerVisit: Math.round(mileageAvg * 100) / 100,
    },
  };
}

export async function generateEmployeeReview(opts: {
  agencyId: string;
  employeeIds: string[];
  periodStart?: string;
  periodEnd?: string;
  frequency: string;
  createdById: string;
}) {
  const periodStart = opts.periodStart
    ? new Date(opts.periodStart)
    : new Date("1970-01-01");
  const periodEnd = opts.periodEnd ? new Date(opts.periodEnd) : new Date();

  const history = await prisma.employeeReviewHistory.create({
    data: {
      agencyId: opts.agencyId,
      employeeIds: opts.employeeIds,
      periodStart,
      periodEnd,
      frequency: opts.frequency,
      createdById: opts.createdById,
    },
  });

  const results = await Promise.all(
    opts.employeeIds.map((employeeId) =>
      getEmployeeReviewData({
        agencyId: opts.agencyId,
        employeeId,
        from: opts.periodStart,
        to: opts.periodEnd,
      })
    )
  );

  return {
    reviewId: history.id,
    periodStart,
    periodEnd,
    frequency: opts.frequency,
    employees: results,
  };
}

export async function getEmployeeReviewHistory(agencyId: string, limit = 10) {
  return prisma.employeeReviewHistory.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { createdBy: true, unityTask: true },
  });
}

export async function getEmployeeReviewById(reviewId: string) {
  const review = await prisma.employeeReviewHistory.findUnique({
    where: { id: reviewId },
  });
  if (!review) return null;

  const results = await Promise.all(
    review.employeeIds.map((employeeId: any) =>
      getEmployeeReviewData({
        agencyId: review.agencyId,
        employeeId,
        from: review.periodStart.toISOString(),
        to: review.periodEnd.toISOString(),
      })
    )
  );

  return { ...review, employees: results };
}

/** ===========================
 * CLIENT REVIEW DATA
 * =========================== */
export async function getClientReviewData(opts: {
  agencyId: string;
  clientId: string;
  from?: string;
  to?: string;
}) {
  const range = safeDateRange(opts.from, opts.to);

  const visits = await prisma.visit.findMany({
    where: {
      agencyID: opts.agencyId,
      clientID: opts.clientId,
      ...(range
        ? {
            OR: [
              { callIn: { gte: range.start, lte: range.end } },
              { scheduledTimeIn: { gte: range.start, lte: range.end } },
            ],
          }
        : {}),
    },
    include: {
      GPSException: true,
      service: true,
      employee: true,
    } as any,
  });

  if (visits.length === 0) {
    return { clientId: opts.clientId, analytics: null };
  }

  const totalVisits = visits.length;
  const totalHours = visits.reduce((sum, v) => sum + computeVisitHours(v), 0);

  const totalExceptionVisits = visits.filter(
    (v) => (v.totalCurrentExceptions ?? 0) > 0 || countExceptionFlags(v) > 0
  ).length;
  const totalExceptions = visits.reduce(
    (sum, v) => sum + (v.totalCurrentExceptions ?? 0) + countExceptionFlags(v),
    0
  );

  const gpsExceptionVisits = visits.filter(
    (v) => v.GPSException?.length > 0
  ).length;
  const gpsExceptionCount = visits.reduce(
    (sum, v) => sum + (v.GPSException?.length ?? 0),
    0
  );

  // Breakdown by employee
  const empCounts: Record<string, number> = {};
  visits.forEach((v) => {
    const name = v.employeeName || "Unknown Employee";
    empCounts[name] = (empCounts[name] ?? 0) + 1;
  });

  // Breakdown by service
  const serviceCounts: Record<string, number> = {};
  visits.forEach((v) => {
    const svc = v.serviceName || "Unknown Service";
    serviceCounts[svc] = (serviceCounts[svc] ?? 0) + 1;
  });

  const topEmployee = Object.entries(empCounts).sort((a, b) => b[1] - a[1])[0];
  const topService = Object.entries(serviceCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // ✅ authorized hours/units from Authorization
  const auths = await prisma.authorization.findMany({
    where: {
      assignedClients: { some: { id: opts.clientId } },
      voided: false,
      ...(range
        ? {
            startDate: { lte: range.end },
            endDate: { gte: range.start },
          }
        : {}),
    },
    include: { service: true },
  });

  const authorizedTotals = auths.map((a) => ({
    serviceName: a.service?.name ?? "Unknown Service",
    totalAuthorizedHours: a.totalAuthorizedHours ?? null,
    totalAuthorizedUnits: a.totalAuthorizedUnits ?? null,
    totalBillableAmount: a.totalBillableAmount ?? null,
  }));

  return {
    clientId: opts.clientId,
    analytics: {
      totalVisits,
      totalHours,
      totalExceptions,
      totalExceptionVisits,
      percentVisitsWithException: percent(totalExceptionVisits, totalVisits),
      gpsExceptionCount,
      gpsExceptionVisits,
      percentVisitsWithGpsException: percent(gpsExceptionVisits, totalVisits),
      employeesWorkedWith: Object.keys(empCounts).length,
      visitsPerEmployee: Object.entries(empCounts).map(([employee, count]) => ({
        employee,
        count,
        percent: percent(count, totalVisits),
      })),
      visitsPerService: Object.entries(serviceCounts).map(
        ([service, count]) => ({
          service,
          count,
          percent: percent(count, totalVisits),
        })
      ),
      exceptionBreakdown: exceptionBreakdown(visits),
      topServiceForVisit: topService?.[0] ?? null,
      topEmployeeWorkedWith: topEmployee?.[0] ?? null,
      authorizedTotals,
    },
  };
}

export async function generateClientReview(opts: {
  agencyId: string;
  clientIds: string[];
  periodStart?: string;
  periodEnd?: string;
  frequency: string;
  createdById: string;
}) {
  const periodStart = opts.periodStart
    ? new Date(opts.periodStart)
    : new Date("1970-01-01");
  const periodEnd = opts.periodEnd ? new Date(opts.periodEnd) : new Date();

  const history = await prisma.clientReviewHistory.create({
    data: {
      agencyId: opts.agencyId,
      clientIds: opts.clientIds,
      periodStart,
      periodEnd,
      frequency: opts.frequency,
      createdById: opts.createdById,
    },
  });

  const results = await Promise.all(
    opts.clientIds.map((clientId) =>
      getClientReviewData({
        agencyId: opts.agencyId,
        clientId,
        from: opts.periodStart,
        to: opts.periodEnd,
      })
    )
  );

  return {
    reviewId: history.id,
    periodStart,
    periodEnd,
    frequency: opts.frequency,
    clients: results,
  };
}

export async function getClientReviewHistory(agencyId: string, limit = 10) {
  return prisma.clientReviewHistory.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { createdBy: true, unityTask: true },
  });
}

export async function getClientReviewById(reviewId: string) {
  const review = await prisma.clientReviewHistory.findUnique({
    where: { id: reviewId },
  });
  if (!review) return null;

  const results = await Promise.all(
    review.clientIds.map((clientId: any) =>
      getClientReviewData({
        agencyId: review.agencyId,
        clientId,
        from: review.periodStart.toISOString(),
        to: review.periodEnd.toISOString(),
      })
    )
  );

  return { ...review, clients: results };
}
