import prisma from "../lib/db";
import {
  startOfDay,
  endOfDay,
  differenceInCalendarDays,
  isValid,
} from "date-fns";

type ReviewBillingOpts = {
  agencyId: string;
  clientId: string; // cuid of Client
  serviceId: string; // cuid of Service
  dateFrom: string; // ISO
  dateTo: string; // ISO
  programId?: string; // cuid of Program
  payerId?: string; // cuid of Payer
};

function clamp7DaysOrThrow(from: Date, to: Date) {
  const days = differenceInCalendarDays(to, from);
  if (days > 7) throw new Error("Date range cannot exceed 7 days.");
}

function parseServiceName(input?: string | null) {
  if (!input) return { code: "Unknown", name: "Unknown Service" };
  const [code, ...rest] = input.split(" - ");
  return {
    code: (code || "").trim() || "Unknown",
    name: rest.join(" - ").trim() || "Unknown Service",
  };
}

export async function reviewBilling(opts: ReviewBillingOpts) {
  const from = startOfDay(new Date(opts.dateFrom));
  const to = endOfDay(new Date(opts.dateTo));
  if (!isValid(from) || !isValid(to)) throw new Error("Invalid date range.");
  clamp7DaysOrThrow(from, to);

  // Resolve program/payer names (Visit.program / Visit.payer are strings)
  const [program, payer] = await Promise.all([
    opts.programId
      ? prisma.program.findUnique({
          where: { id: opts.programId },
          select: { id: true, name: true },
        })
      : Promise.resolve(null),
    opts.payerId
      ? prisma.payer.findUnique({
          where: { id: opts.payerId },
          select: { id: true, payerName: true },
        })
      : Promise.resolve(null),
  ]);

  // 1) Visits are DENORMALIZED: filter by Visit.clientID?
  // Your Visit.clientID is a STRING (Sandata/client code), not cuid.
  // But UI/API sends cuid clientId. We match visits by:
  //   - clientID == Client.clientID (code)
  //   - OR clientName fallback if you ever used manual visits.
  const client = await prisma.client.findUnique({
    where: { id: opts.clientId },
    select: { id: true, clientID: true, name: true, medicaidID: true },
  });
  if (!client) throw new Error("Client not found.");

  const visits = await prisma.visit.findMany({
    where: {
      agencyID: opts.agencyId,
      serviceId: opts.serviceId,
      doNotBill: false,
      ...(program?.name ? { program: program.name } : {}),
      ...(payer?.payerName ? { payer: payer.payerName } : {}),
      AND: [
        // visit time range uses callIn if present; scheduledTimeIn also ok for scheduled billing review
        {
          OR: [
            { callIn: { gte: from, lte: to } },
            { scheduledTimeIn: { gte: from, lte: to } },
          ],
        },
        // match denormalized client fields
        {
          OR: [{ clientID: client.clientID }, { clientName: client.name }],
        },
      ],
    },
    include: {
      service: true, // safe to include; Visit→Service relation exists
    },
    orderBy: { callIn: "asc" },
  });

  // 2) Matching authorizations for client + service overlapping range
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

  function findAuthForVisit(v: any) {
    const t = v.callIn ?? v.scheduledTimeIn;
    if (!t) return null;
    const time = new Date(t);
    return (
      auths.find(
        (a) => new Date(a.startDate) <= time && new Date(a.endDate) >= time
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

    const parsed = parseServiceName(v.serviceName);
    const baseRow = {
      visitId: v.id,
      date: v.callIn ?? v.scheduledTimeIn,
      clientId: v.clientID ?? null, // denormalized code
      clientName: v.clientName ?? client.name ?? "Unknown Client",
      medicaidId: v.clientMedicaidID ?? client.medicaidID ?? null,
      program: v.program ?? program?.name ?? null,
      payer: v.payer ?? auth?.payer?.payerName ?? payer?.payerName ?? null,
      serviceId: v.serviceId,
      serviceCode: parsed.code,
      serviceName: parsed.name,

      // if service relation loaded, override parsed
      ...(v.service && {
        serviceCode: v.service.code,
        serviceName: v.service.name,
      }),

      units,
      ratePerUnit,
      total: 0,
      hasAuthorization: !!auth,
    };

    if (auth) {
      const total = ratePerUnit ? units * ratePerUnit : 0;
      withAuth.push({
        ...baseRow,
        authorizationId: auth.id,
        authorizationNumber: auth.authorizationNumber,
        total,
      });
    } else {
      withoutAuth.push({
        ...baseRow,
        authorizationId: null,
        authorizationNumber: null,
        ratePerUnit: null, // editable in UI if desired
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
// import prisma from "../lib/db";
// import { startOfDay, endOfDay, differenceInCalendarDays } from "date-fns";

// type ReviewBillingOpts = {
//   agencyId: string;
//   clientId: string;
//   serviceId: string;
//   dateFrom: string;
//   dateTo: string;
//   programId?: string;
//   payerId?: string;
// };

// function clamp7DaysOrThrow(from: Date, to: Date) {
//   const days = differenceInCalendarDays(to, from);
//   if (days > 7) {
//     throw new Error("Date range cannot exceed 7 days.");
//   }
// }

// function parseServiceName(input?: string) {
//   if (!input) return { code: "Unknown", name: "Unknown Service" };

//   const [code, ...rest] = input.split(" - ");
//   return {
//     code: code?.trim() ?? "Unknown",
//     name: rest.join(" - ").trim() || "Unknown Service",
//   };
// }

// export async function reviewBilling(opts: ReviewBillingOpts) {
//   const from = startOfDay(new Date(opts.dateFrom));
//   const to = endOfDay(new Date(opts.dateTo));
//   clamp7DaysOrThrow(from, to);

//   // Resolve program/payer names for filtering visits
//   const program = opts.programId
//     ? await prisma.program.findUnique({ where: { id: opts.programId } })
//     : null;

//   const payer = opts.payerId
//     ? await prisma.payer.findUnique({ where: { id: opts.payerId } })
//     : null;

//   // 1) Visits for (client + service) in range
//   const visits = await prisma.visit.findMany({
//     where: {
//       agencyID: opts.agencyId,
//       clientID: opts.clientId,
//       serviceId: opts.serviceId,
//       callIn: { gte: from, lte: to },
//       ...(program?.name ? { program: program.name } : {}),
//       ...(payer?.payerName ? { payer: payer.payerName } : {}),
//       doNotBill: false,
//     },
//     include: {
//       service: true,
//     },
//     orderBy: { callIn: "asc" },
//   });

//   // 2) Find matching authorizations for this client + service overlapping range
//   const auths = await prisma.authorization.findMany({
//     where: {
//       serviceID: opts.serviceId,
//       voided: false,
//       assignedClients: { some: { id: opts.clientId } },
//       startDate: { lte: to },
//       endDate: { gte: from },
//       ...(opts.payerId ? { payerID: opts.payerId } : {}),
//     },
//     include: { payer: true, service: true },
//     orderBy: { startDate: "desc" },
//   });

//   // choose the "best" auth per visit:
//   function findAuthForVisit(v: any) {
//     const t = v.callIn ?? v.scheduledTimeIn;
//     if (!t) return null;
//     return (
//       auths.find(
//         (a) =>
//           new Date(a.startDate) <= new Date(t) &&
//           new Date(a.endDate) >= new Date(t)
//       ) ??
//       auths[0] ??
//       null
//     );
//   }

//   const withAuth: any[] = [];
//   const withoutAuth: any[] = [];

//   for (const v of visits) {
//     const units = v.units ?? 0;
//     const auth = findAuthForVisit(v);
//     const ratePerUnit = auth?.ratePerUnit ?? null;
//     const parsed = parseServiceName(v.serviceName);

//     const baseRow = {
//       visitId: v.id,
//       date: v.callIn ?? v.scheduledTimeIn,
//       clientId: v.clientID,
//       clientName: v.clientName ?? "Unknown Client",
//       medicaidId: v.clientMedicaidID ?? null,
//       program: v.program ?? program?.name ?? null,
//       payer: v.payer ?? auth?.payer?.payerName ?? payer?.payerName ?? null,
//       serviceId: v.serviceId,
//       serviceCode: parsed.code ?? "Unknown Service",
//       serviceName: parsed.name ?? "Unknown Service",

//       // If relation was loaded, override parsed version
//       ...(v.service && {
//         serviceCode: v.service.code,
//         serviceName: v.service.name,
//       }),

//       units: v.units ?? 0,
//       rate: null, // you’ll compute based on authorization next
//       amount: 0, // units * rate
//     };

//     if (auth) {
//       const total = ratePerUnit ? units * ratePerUnit : 0;
//       withAuth.push({
//         ...baseRow,
//         authorizationId: auth.id,
//         authorizationNumber: auth.authorizationNumber,
//         ratePerUnit,
//         total,
//         hasAuthorization: true,
//       });
//     } else {
//       withoutAuth.push({
//         ...baseRow,
//         authorizationId: null,
//         authorizationNumber: null,
//         ratePerUnit: null, // editable on UI
//         total: 0,
//         hasAuthorization: false,
//         reason: "Missing authorization",
//       });
//     }
//   }

//   const totals = {
//     unitsWithAuth: withAuth.reduce((s, r) => s + (r.units ?? 0), 0),
//     amountWithAuth: withAuth.reduce((s, r) => s + (r.total ?? 0), 0),
//     unitsWithoutAuth: withoutAuth.reduce((s, r) => s + (r.units ?? 0), 0),
//     amountWithoutAuth: withoutAuth.reduce((s, r) => s + (r.total ?? 0), 0),
//   };

//   return {
//     withAuth,
//     withoutAuth,
//     totals: {
//       ...totals,
//       grandUnits: totals.unitsWithAuth + totals.unitsWithoutAuth,
//       grandAmount: totals.amountWithAuth + totals.amountWithoutAuth,
//     },
//   };
// }
