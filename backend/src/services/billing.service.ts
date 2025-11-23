import prisma from "../lib/db";
import { startOfDay, endOfDay, differenceInCalendarDays } from "date-fns";

type ReviewBillingOpts = {
  agencyId: string;
  clientId: string;
  serviceId: string;
  dateFrom: string;
  dateTo: string;
  programId?: string;
  payerId?: string;
};

function clamp7DaysOrThrow(from: Date, to: Date) {
  const days = differenceInCalendarDays(to, from);
  if (days > 7) {
    throw new Error("Date range cannot exceed 7 days.");
  }
}

export async function reviewBilling(opts: ReviewBillingOpts) {
  const from = startOfDay(new Date(opts.dateFrom));
  const to = endOfDay(new Date(opts.dateTo));
  clamp7DaysOrThrow(from, to);

  // Resolve program/payer names for filtering visits
  const program = opts.programId
    ? await prisma.program.findUnique({ where: { id: opts.programId } })
    : null;

  const payer = opts.payerId
    ? await prisma.payer.findUnique({ where: { id: opts.payerId } })
    : null;

  // 1) Visits for (client + service) in range
  const visits = await prisma.visit.findMany({
    where: {
      agencyID: opts.agencyId,
      clientID: opts.clientId,
      serviceId: opts.serviceId,
      callIn: { gte: from, lte: to },
      ...(program?.name ? { program: program.name } : {}),
      ...(payer?.payerName ? { payer: payer.payerName } : {}),
      doNotBill: false,
    },
    include: {
      client: true,
      service: true,
    },
    orderBy: { callIn: "asc" },
  });

  // 2) Find matching authorizations for this client + service overlapping range
  const auths = await prisma.authorization.findMany({
    where: {
      serviceID: opts.serviceId,
      voided: false,
      assignedClients: { some: { id: opts.clientId } },
      startDate: { lte: to },
      endDate: { gte: from },
      ...(opts.payerId ? { payerID: opts.payerId } : {}),
    },
    include: { payer: true, service: true },
    orderBy: { startDate: "desc" },
  });

  // choose the "best" auth per visit:
  function findAuthForVisit(v: any) {
    const t = v.callIn ?? v.scheduledTimeIn;
    if (!t) return null;
    return (
      auths.find(
        (a) =>
          new Date(a.startDate) <= new Date(t) &&
          new Date(a.endDate) >= new Date(t)
      ) ??
      auths[0] ??
      null
    );
  }

  const withAuth: any[] = [];
  const withoutAuth: any[] = [];

  for (const v of visits) {
    const units = v.units ?? 0;
    const auth = findAuthForVisit(v);
    const ratePerUnit = auth?.ratePerUnit ?? null;

    const baseRow = {
      visitId: v.id,
      date: v.callIn ?? v.scheduledTimeIn,
      clientId: v.clientID,
      clientName: v.clientName ?? v.client?.name ?? "Unknown Client",
      medicaidId: v.clientMedicaidID ?? v.client?.medicaidID ?? null,
      program: v.program ?? program?.name ?? null,
      payer: v.payer ?? auth?.payer?.payerName ?? payer?.payerName ?? null,
      serviceId: v.serviceId,
      serviceCode: v.service?.code ?? v.serviceName ?? "Unknown Service",
      serviceName: v.service?.name ?? v.serviceName ?? "Unknown Service",
      units,
    };

    if (auth) {
      const total = ratePerUnit ? units * ratePerUnit : 0;
      withAuth.push({
        ...baseRow,
        authorizationId: auth.id,
        authorizationNumber: auth.authorizationNumber,
        ratePerUnit,
        total,
        hasAuthorization: true,
      });
    } else {
      withoutAuth.push({
        ...baseRow,
        authorizationId: null,
        authorizationNumber: null,
        ratePerUnit: null, // editable on UI
        total: 0,
        hasAuthorization: false,
        reason: "Missing authorization",
      });
    }
  }

  const totals = {
    unitsWithAuth: withAuth.reduce((s, r) => s + (r.units ?? 0), 0),
    amountWithAuth: withAuth.reduce((s, r) => s + (r.total ?? 0), 0),
    unitsWithoutAuth: withoutAuth.reduce((s, r) => s + (r.units ?? 0), 0),
    amountWithoutAuth: withoutAuth.reduce((s, r) => s + (r.total ?? 0), 0),
  };

  return {
    withAuth,
    withoutAuth,
    totals: {
      ...totals,
      grandUnits: totals.unitsWithAuth + totals.unitsWithoutAuth,
      grandAmount: totals.amountWithAuth + totals.amountWithoutAuth,
    },
  };
}
