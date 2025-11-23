import prisma from "../lib/db";
import {
  subDays,
  subMonths,
  subQuarters,
  subYears,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import { Response } from "express";

interface GenerateAuditInput {
  agencyId: string;
  frequency:
    | "WEEKLY"
    | "MONTHLY"
    | "QUARTERLY"
    | "YEARLY"
    | "DAILY"
    | "SPECIFIC_DATE";
  customStart?: string;
  customEnd?: string;
  unityTaskId?: string;
  createdById: string;
}

function calculateRange(
  frequency: string,
  customStart?: string,
  customEnd?: string
) {
  const today = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (frequency) {
    case "DAILY":
      startDate = subDays(today, 1);
      endDate = subDays(today, 1);
      break;
    case "WEEKLY":
      startDate = startOfWeek(subDays(today, 7), { weekStartsOn: 0 });
      endDate = endOfWeek(subDays(today, 7), { weekStartsOn: 0 });
      break;
    case "MONTHLY":
      startDate = startOfMonth(subMonths(today, 1));
      endDate = endOfMonth(subMonths(today, 1));
      break;
    case "QUARTERLY":
      startDate = startOfQuarter(subQuarters(today, 1));
      endDate = endOfQuarter(subQuarters(today, 1));
      break;
    case "YEARLY":
      startDate = startOfYear(subYears(today, 1));
      endDate = endOfYear(subYears(today, 1));
      break;
    case "SPECIFIC_DATE":
      startDate = new Date(customStart!);
      endDate = new Date(customEnd!);
      break;
    default:
      throw new Error("Invalid frequency");
  }

  return { startDate, endDate };
}

export async function generateAudit({
  agencyId,
  frequency,
  customStart,
  customEnd,
  unityTaskId,
  createdById,
}: GenerateAuditInput) {
  const { startDate, endDate } =
    frequency === "SPECIFIC_DATE" && customStart && customEnd
      ? { startDate: new Date(customStart), endDate: new Date(customEnd) }
      : calculateRange(frequency, customStart, customEnd);

  const existing = await prisma.timelyAudit.findFirst({
    where: { agencyId, frequency, startDate, endDate },
  });

  if (existing) return { audit: existing, alreadyExists: true };

  try {
    const visits = await prisma.visit.findMany({
      where: {
        agencyID: agencyId,
        OR: [
          { scheduledTimeIn: { gte: startDate, lte: endDate } },
          { callIn: { gte: startDate, lte: endDate } },
        ],
      },
    });

    const totalVisits = visits.length;
    const evvAutoCount = visits.filter((v) => v.callType === "Auto").length;
    const evvCompliance = totalVisits ? (evvAutoCount / totalVisits) * 100 : 0;

    const gpsExceptions = visits.filter(
      (v) =>
        (v.gpsInMilesFromClient && v.gpsInMilesFromClient > 1) ||
        (v.gpsOutMilesFromClient && v.gpsOutMilesFromClient > 1)
    ).length;

    const exceptionCount = visits.filter(
      (v) => (v.totalCurrentExceptions ?? 0) > 0
    ).length;

    const audit = await prisma.timelyAudit.create({
      data: {
        agencyId,
        startDate,
        endDate,
        frequency,
        unityTaskId: unityTaskId ?? null,
        createdById,
        totalVisits,
        evvCompliance,
        gpsExceptions,
        exceptionCount,
      },
    });

    return { audit, alreadyExists: false };
  } catch (err: any) {
    if (err.code === "P2002") {
      const existing = await prisma.timelyAudit.findFirst({
        where: { agencyId, frequency, startDate, endDate },
      });
      return { audit: existing, alreadyExists: true };
    }
    throw err;
  }
}

export async function getAgencyAudits(agencyId: string) {
  return prisma.timelyAudit.findMany({
    where: { agencyId },
    include: { unityTask: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAuditDetail(id: string) {
  return prisma.timelyAudit.findUnique({
    where: { id },
    include: { unityTask: true, agency: true },
  });
}

export async function markAuditComplete(id: string) {
  return prisma.timelyAudit.update({
    where: { id },
    data: { completed: true },
  });
}

export async function getAuditWithVisits(auditId: string) {
  const audit = await prisma.timelyAudit.findUnique({
    where: { id: auditId },
    include: { agency: true, unityTask: true },
  });
  if (!audit) throw new Error("Audit not found");

  const visits = await prisma.visit.findMany({
    where: {
      agencyID: audit.agencyId,
      OR: [
        { scheduledTimeIn: { gte: audit.startDate, lte: audit.endDate } },
        { callIn: { gte: audit.startDate, lte: audit.endDate } },
      ],
    },
  });

  return { audit, visits };
}

export async function exportAuditReport(
  auditId: string,
  format: "xlsx" | "pdf",
  res: Response
) {
  const { audit, visits } = await getAuditWithVisits(auditId);

  const summary = [
    ["Agency", audit.agency.name],
    ["Frequency", audit.frequency],
    ["Start Date", audit.startDate.toISOString().split("T")[0]],
    ["End Date", audit.endDate.toISOString().split("T")[0]],
    ["Total Visits", audit.totalVisits ?? visits.length],
    ["EVV Compliance (%)", audit.evvCompliance?.toFixed(2)],
    ["GPS Exceptions", audit.gpsExceptions ?? 0],
    ["Exception Count", audit.exceptionCount ?? 0],
  ];

  if (format === "xlsx") {
    const wb = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    const visitData = visits.map((v) => ({
      VisitID: v.id,
      Client: v.clientName,
      Employee: v.employeeName,
      Service: v.serviceName,
      Status: v.visitStatus,
      CallType: v.callType,
      CallIn: v.callIn,
      CallOut: v.callOut,
      GPSInMiles: v.gpsInMilesFromClient,
      GPSOutMiles: v.gpsOutMilesFromClient,
      Exceptions: v.totalCurrentExceptions,
    }));

    const visitSheet = XLSX.utils.json_to_sheet(visitData);
    XLSX.utils.book_append_sheet(wb, visitSheet, "Visits");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Timely_Audit_${auditId}.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.send(buffer);
  }

  const doc = new PDFDocument({ margin: 40 });
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Timely_Audit_${auditId}.pdf"`
  );
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  doc.fontSize(18).text("Timely Audit Report", { align: "center" }).moveDown(1);
  doc.fontSize(12);

  summary.forEach(([label, value]) => doc.text(`${label}: ${value}`));

  doc.moveDown(1).fontSize(14).text("Visits Summary", { underline: true });
  doc.fontSize(10);

  visits.slice(0, 40).forEach((v) => {
    doc.text(
      `• ${v.clientName || "Unknown"} (${v.serviceName || "—"}) - ${
        v.visitStatus
      } | GPS Ex: ${v.gpsInMilesFromClient || 0}`
    );
  });

  if (visits.length > 40) {
    doc.moveDown().text(`(${visits.length - 40} more visits not displayed)`);
  }

  doc.end();
}
// import prisma from "../lib/db";
// import {
//   subDays,
//   subMonths,
//   subQuarters,
//   subYears,
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   startOfQuarter,
//   endOfQuarter,
//   startOfYear,
//   endOfYear,
// } from "date-fns";
// import * as XLSX from "xlsx";
// import PDFDocument from "pdfkit";
// import { Response } from "express";

// interface GenerateAuditInput {
//   agencyId: string;
//   frequency:
//     | "WEEKLY"
//     | "MONTHLY"
//     | "QUARTERLY"
//     | "YEARLY"
//     | "DAILY"
//     | "SPECIFIC_DATE";
//   customStart?: string;
//   customEnd?: string;
//   unityTaskId?: string;
//   createdById: string;
// }

// /**
//  * Helper to determine date range based on frequency.
//  */
// function calculateRange(
//   frequency: string,
//   customStart?: string,
//   customEnd?: string
// ) {
//   const today = new Date();
//   let startDate: Date;
//   let endDate: Date;

//   switch (frequency) {
//     case "DAILY":
//       startDate = subDays(today, 1);
//       endDate = subDays(today, 1);
//       break;
//     case "WEEKLY":
//       startDate = startOfWeek(subDays(today, 7), { weekStartsOn: 0 });
//       endDate = endOfWeek(subDays(today, 7), { weekStartsOn: 0 });
//       break;
//     case "MONTHLY":
//       startDate = startOfMonth(subMonths(today, 1));
//       endDate = endOfMonth(subMonths(today, 1));
//       break;
//     case "QUARTERLY":
//       startDate = startOfQuarter(subQuarters(today, 1));
//       endDate = endOfQuarter(subQuarters(today, 1));
//       break;
//     case "YEARLY":
//       startDate = startOfYear(subYears(today, 1));
//       endDate = endOfYear(subYears(today, 1));
//       break;
//     case "SPECIFIC_DATE":
//       startDate = new Date(customStart!);
//       endDate = new Date(customEnd!);
//       break;
//     default:
//       throw new Error("Invalid frequency");
//   }

//   return { startDate, endDate };
// }

// /**
//  * Generate a new audit and compute metrics from Visit table.
//  */
// export async function generateAudit({
//   agencyId,
//   frequency,
//   customStart,
//   customEnd,
//   unityTaskId,
//   createdById,
// }: GenerateAuditInput) {
//   const { startDate, endDate } =
//     frequency === "SPECIFIC_DATE" && customStart && customEnd
//       ? { startDate: new Date(customStart), endDate: new Date(customEnd) }
//       : calculateRange(frequency, customStart, customEnd);

//   // Step 1: look for existing record (idempotence)
//   const existing = await prisma.timelyAudit.findFirst({
//     where: {
//       agencyId,
//       frequency,
//       startDate,
//       endDate,
//     },
//   });
//   if (existing) {
//     return { audit: existing, alreadyExists: true };
//   }

//   // Step 2: attempt to create
//   try {
//     const visits = await prisma.visit.findMany({
//       where: {
//         agencyID: agencyId,
//         scheduledTimeIn: { gte: startDate, lte: endDate },
//       },
//     });

//     const totalVisits = visits.length;
//     const evvAutoCount = visits.filter((v) => v.callType === "Auto").length;
//     const evvCompliance = totalVisits ? (evvAutoCount / totalVisits) * 100 : 0;

//     const gpsExceptions = visits.filter(
//       (v) =>
//         (v.gpsInMilesFromClient && v.gpsInMilesFromClient > 1) ||
//         (v.gpsOutMilesFromClient && v.gpsOutMilesFromClient > 1)
//     ).length;

//     const exceptionCount = visits.filter(
//       (v) => v.totalCurrentExceptions && v.totalCurrentExceptions > 0
//     ).length;

//     const audit = await prisma.timelyAudit.create({
//       data: {
//         agencyId,
//         startDate,
//         endDate,
//         frequency,
//         unityTaskId,
//         createdById,
//         totalVisits,
//         evvCompliance,
//         gpsExceptions,
//         exceptionCount,
//       },
//     });

//     return { audit, alreadyExists: false };
//   } catch (err: any) {
//     // Step 3: if conflict, return existing
//     if (err.code === "P2002") {
//       const existing = await prisma.timelyAudit.findFirst({
//         where: { agencyId, frequency, startDate, endDate },
//       });
//       return { audit: existing, alreadyExists: true };
//     }
//     throw err;
//   }
// }

// /**
//  * Get all audits for an agency.
//  */
// export async function getAgencyAudits(agencyId: string) {
//   return prisma.timelyAudit.findMany({
//     where: { agencyId },
//     include: { unityTask: true },
//     orderBy: { createdAt: "desc" },
//   });
// }

// /**
//  * Get a single audit with related task and agency.
//  */
// export async function getAuditDetail(id: string) {
//   return prisma.timelyAudit.findUnique({
//     where: { id },
//     include: { unityTask: true, agency: true },
//   });
// }

// /**
//  * Mark audit as completed manually.
//  */
// export async function markAuditComplete(id: string) {
//   return prisma.timelyAudit.update({
//     where: { id },
//     data: { completed: true },
//   });
// }

// /**
//  * Fetch audit with associated visits for export
//  */
// export async function getAuditWithVisits(auditId: string) {
//   const audit = await prisma.timelyAudit.findUnique({
//     where: { id: auditId },
//     include: { agency: true, unityTask: true },
//   });
//   if (!audit) throw new Error("Audit not found");

//   const visits = await prisma.visit.findMany({
//     where: {
//       agencyID: audit.agencyId,
//       scheduledTimeIn: { gte: audit.startDate, lte: audit.endDate },
//     },
//   });

//   return { audit, visits };
// }

// /**
//  * Generate Excel or PDF and stream to response
//  */
// export async function exportAuditReport(
//   auditId: string,
//   format: "xlsx" | "pdf",
//   res: Response
// ) {
//   const { audit, visits } = await getAuditWithVisits(auditId);

//   // ✅ Build structured summary
//   const summary = [
//     ["Agency", audit.agency.name],
//     ["Frequency", audit.frequency],
//     ["Start Date", audit.startDate.toISOString().split("T")[0]],
//     ["End Date", audit.endDate.toISOString().split("T")[0]],
//     ["Total Visits", audit.totalVisits ?? visits.length],
//     ["EVV Compliance (%)", audit.evvCompliance?.toFixed(2)],
//     ["GPS Exceptions", audit.gpsExceptions ?? 0],
//     ["Exception Count", audit.exceptionCount ?? 0],
//   ];

//   if (format === "xlsx") {
//     // Create Excel workbook
//     const wb = XLSX.utils.book_new();
//     const summarySheet = XLSX.utils.aoa_to_sheet(summary);
//     XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

//     const visitData = visits.map((v) => ({
//       VisitID: v.id,
//       Client: v.clientName,
//       Employee: v.employeeName,
//       Service: v.serviceName,
//       Status: v.visitStatus,
//       CallType: v.callType,
//       CallIn: v.callIn,
//       CallOut: v.callOut,
//       GPSInMiles: v.gpsInMilesFromClient,
//       GPSOutMiles: v.gpsOutMilesFromClient,
//       Exceptions: v.totalCurrentExceptions,
//     }));

//     const visitSheet = XLSX.utils.json_to_sheet(visitData);
//     XLSX.utils.book_append_sheet(wb, visitSheet, "Visits");

//     const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="Timely_Audit_${auditId}.xlsx"`
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     return res.send(buffer);
//   }

//   if (format === "pdf") {
//     const doc = new PDFDocument({ margin: 40 });
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="Timely_Audit_${auditId}.pdf"`
//     );
//     res.setHeader("Content-Type", "application/pdf");
//     doc.pipe(res);

//     // Header
//     doc
//       .fontSize(18)
//       .text("Timely Audit Report", { align: "center" })
//       .moveDown(1);
//     doc.fontSize(12);

//     // Summary Section
//     summary.forEach(([label, value]) => {
//       doc.text(`${label}: ${value}`);
//     });

//     doc
//       .moveDown(1)
//       .fontSize(14)
//       .text("Visits Summary", { underline: true })
//       .moveDown(0.5);
//     doc.fontSize(10);

//     visits.slice(0, 40).forEach((v) => {
//       doc.text(
//         `• ${v.clientName || "Unknown"} (${v.serviceName || "—"}) - ${
//           v.visitStatus
//         } | GPS Ex: ${v.gpsInMilesFromClient || 0}`
//       );
//     });

//     if (visits.length > 40) {
//       doc.moveDown().text(`(${visits.length - 40} more visits not displayed)`);
//     }

//     doc.end();
//   }
// }
