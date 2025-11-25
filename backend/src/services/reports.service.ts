// src/services/reports.service.ts
import prisma from "../lib/db";

const VisitStatus = {
  Scheduled: "Scheduled",
  InProcess: "InProcess",
  Omitted: "Omitted",
  Incomplete: "Incomplete",
  Verified: "Verified",
  Processed: "Processed",
} as const;

type VisitStatus = (typeof VisitStatus)[keyof typeof VisitStatus];

type EvvComplianceRequest = {
  agencyId: string;
  from: string; // ISO string
  to: string; // ISO string
  employeeId?: string;
  clientId?: string;
  medicaidId?: string;
};

export async function getReportFilters(agencyId: string) {
  const [agency, clients, employees, services, payers, programs] =
    await Promise.all([
      prisma.agency.findUnique({
        where: { id: agencyId },
        select: { id: true, name: true, code: true },
      }),
      prisma.client.findMany({
        where: { agencyID: agencyId },
        select: { id: true, name: true, clientID: true, medicaidID: true },
        orderBy: { name: "asc" },
      }),
      prisma.employee.findMany({
        where: { agencyID: agencyId },
        select: {
          id: true,
          employeeID: true,
          firstName: true,
          lastName: true,
          name: true,
        },
        orderBy: { firstName: "asc" },
      }),
      prisma.service.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      }),
      prisma.payer.findMany({
        select: { id: true, payerName: true, medicaidID: true },
        orderBy: { payerName: "asc" },
      }),
      prisma.program.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

  return {
    agency,
    clients,
    employees,
    services,
    payers,
    programs,
  };
}

export async function getEvvComplianceReport(params: EvvComplianceRequest) {
  const { agencyId, from, to, employeeId, clientId, medicaidId } = params;

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { id: true, name: true, code: true },
  });

  if (!agency) {
    throw new Error("Agency not found");
  }

  const where: any = {
    agencyID: agencyId,
    callIn: { gte: fromDate },
    callOut: { lte: toDate },
    visitStatus: { not: VisitStatus.Omitted },
    callType: { in: ["Manual", "MANUAL", "Auto", "AUTO"] },
  };

  if (employeeId) {
    where.employeeID = employeeId;
  }
  if (clientId) {
    where.clientID = clientId;
  }
  if (medicaidId) {
    where.clientMedicaidID = medicaidId;
  }

  const visits = await prisma.visit.findMany({
    where,
    orderBy: [{ callIn: "asc" }, { id: "asc" }],
    select: {
      id: true,
      callType: true,
      scheduledTimeIn: true,
      scheduledTimeOut: true,
      callIn: true,
      callOut: true,
      clientName: true,
      clientMedicaidID: true,
      clientID: true,
      employeeName: true,
      employeeID: true,
    },
  });

  const total = visits.length;

  const autoVisits = visits.filter(
    (v) =>
      v.callType?.toLowerCase() === "auto" ||
      v.callType?.toLowerCase() === "automatic"
  );
  const manualVisits = visits.filter(
    (v) => v.callType?.toLowerCase() === "manual"
  );

  const autoCount = autoVisits.length;
  const manualCount = manualVisits.length;

  const pct = (n: number, d: number) => (d === 0 ? 0 : (n / d) * 100);

  const compliancePct = pct(autoCount, total);
  const autoPct = pct(autoCount, total);
  const manualPct = pct(manualCount, total);

  return {
    agency,
    meta: {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      generatedAt: new Date().toISOString(),
    },
    summary: {
      totalVisits: total,
      autoCount,
      autoPct,
      manualCount,
      manualPct,
      compliancePct,
    },
    rows: visits,
  };
}
