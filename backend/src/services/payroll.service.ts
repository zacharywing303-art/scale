// src/services/payroll.service.ts
import prisma from "../lib/db";
import { startOfWeek, endOfWeek, addDays, addWeeks, addMonths } from "date-fns";

// -----------------------------------------
// PAYROLL SETTINGS HELPERS
// -----------------------------------------

export async function getOrCreatePayrollSettings(agencyId: string) {
  let settings = await prisma.payrollSettings.findUnique({
    where: { agencyId },
  });

  if (!settings) {
    settings = await prisma.payrollSettings.create({
      data: {
        agencyId,
        cycle: "WEEKLY", // default
        customDays: null,
        lastPeriodFrom: null,
        lastPeriodTo: null,
      },
    });
  }

  return settings;
}

export function calculateNextPeriod(settings: any) {
  const now = new Date();

  // First time: last full week
  if (!settings.lastPeriodFrom || !settings.lastPeriodTo) {
    return {
      from: startOfWeek(now, { weekStartsOn: 0 }),
      to: endOfWeek(now, { weekStartsOn: 0 }),
    };
  }

  const lastFrom = new Date(settings.lastPeriodFrom);
  const lastTo = new Date(settings.lastPeriodTo);

  switch (settings.cycle) {
    case "WEEKLY":
      return {
        from: addWeeks(lastFrom, 1),
        to: addWeeks(lastTo, 1),
      };
    case "BIWEEKLY":
      return {
        from: addWeeks(lastFrom, 2),
        to: addWeeks(lastTo, 2),
      };
    case "MONTHLY":
      return {
        from: addMonths(lastFrom, 1),
        to: addMonths(lastTo, 1),
      };
    case "CUSTOM": {
      const days = settings.customDays || 14;
      return {
        from: addDays(lastFrom, days),
        to: addDays(lastTo, days),
      };
    }
    default:
      return {
        from: startOfWeek(now, { weekStartsOn: 0 }),
        to: endOfWeek(now, { weekStartsOn: 0 }),
      };
  }
}

// -----------------------------------------
// OVERTIME ENGINE (by state)
// -----------------------------------------

type VisitLike = {
  callIn: Date | null;
  callOut: Date | null;
  payHours: number | null;
  callHours: number | null;
};

export function computeOvertimeForEmployee(params: {
  visits: VisitLike[];
  state: string | null;
  periodFrom: Date;
  periodTo: Date;
}) {
  const { visits, state } = params;

  // Base hours
  let totalHours = 0;

  // For CA, we will track daily totals
  const dailyMap = new Map<string, number>();

  for (const v of visits) {
    let hours = 0;
    if (v.payHours != null) hours = v.payHours;
    else if (v.callHours != null) hours = v.callHours;
    else if (v.callIn && v.callOut) {
      hours =
        (new Date(v.callOut).getTime() - new Date(v.callIn).getTime()) /
        (1000 * 60 * 60);
    }

    if (!hours) continue;
    totalHours += hours;

    if (state === "CA" && v.callIn) {
      const dayKey = new Date(v.callIn).toISOString().split("T")[0];
      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + hours);
    }
  }

  let overtimeHours = 0;

  switch (state) {
    case "CA": {
      // Very simplified CA logic:
      // > 8 hrs/day is overtime
      for (const [, dayHours] of dailyMap) {
        if (dayHours > 8) {
          overtimeHours += dayHours - 8;
        }
      }
      break;
    }

    // MA and most states → weekly > 40hrs overtime
    case "MA":
    default: {
      if (totalHours > 40) {
        overtimeHours = totalHours - 40;
      }
      break;
    }
  }

  return {
    totalHours,
    overtimeHours,
  };
}

// -----------------------------------------
// GET PAYROLL PREVIEW
// -----------------------------------------

export async function getPayrollPreview(params: {
  agencyId: string;
  periodFrom: string;
  periodTo: string;
}) {
  const { agencyId, periodFrom, periodTo } = params;

  const from = new Date(periodFrom);
  const to = new Date(periodTo);

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { state: true },
  });

  const state = agency?.state ?? null;

  // Visits in period
  const visits = await prisma.visit.findMany({
    where: {
      agencyID: agencyId,
      callIn: { gte: from },
      callOut: { lte: to },
    },
  });

  // Employees and their employment info
  const employees = await prisma.employee.findMany({
    where: { agencyID: agencyId },
    include: { employmentInfo: true },
  });

  const rows = employees.map((emp) => {
    // Visit.employeeID holds employee.employeeID (external code), not emp.id
    const empVisits = visits.filter(
      (v) => v.employeeID && v.employeeID === emp.employeeID
    );

    const { totalHours, overtimeHours } = computeOvertimeForEmployee({
      visits: empVisits,
      state,
      periodFrom: from,
      periodTo: to,
    });

    const mileage = empVisits.reduce((sum, v) => sum + (v.mileage ?? 0), 0);

    return {
      employeeId: emp.id,
      employeeCode: emp.employeeID,
      name: emp.name,

      visitHours: Number(totalHours.toFixed(2)), // editable
      facilityHours: 0, // manual entry
      officeHours: 0, // manual entry

      mileage: Number(mileage.toFixed(2)), // editable
      overtimeHours: Number(overtimeHours.toFixed(2)),

      visitRate: emp.employmentInfo?.visitPayRate ?? 0,
      facilityRate: emp.employmentInfo?.facilityPayRate ?? 0,
      officeRate: emp.employmentInfo?.officePayRate ?? 0,
      mileageRate: emp.employmentInfo?.mileagePayRate ?? 0,
    };
  });

  return rows;
}

// -----------------------------------------
// RUN PAYROLL
// -----------------------------------------

export async function runPayroll(params: {
  agencyId: string;
  periodFrom: string;
  periodTo: string;
  runByUserId: string;
  employees: any[]; // final rows (after edits)
  taskId?: string;
  updateRates?: {
    [employeeId: string]: {
      visitRate?: number;
      facilityRate?: number;
      officeRate?: number;
      mileageRate?: number;
    };
  };
}) {
  const {
    agencyId,
    periodFrom,
    periodTo,
    runByUserId,
    employees,
    taskId,
    updateRates,
  } = params;

  const from = new Date(periodFrom);
  const to = new Date(periodTo);

  return prisma.$transaction(async (tx) => {
    // 1) Update rates if requested
    if (updateRates) {
      for (const empId in updateRates) {
        const payload = updateRates[empId];
        await tx.employmentInfo.updateMany({
          where: { employeeID: empId }, // note: employeeID or id depending how you call it
          data: payload,
        });
      }
    }

    // 2) Compute total payroll amount
    const totalAmount = employees.reduce((sum, emp) => {
      const visitPay = (emp.visitHours || 0) * (emp.visitRate || 0);
      const facilityPay = (emp.facilityHours || 0) * (emp.facilityRate || 0);
      const officePay = (emp.officeHours || 0) * (emp.officeRate || 0);
      const mileagePay = (emp.mileage || 0) * (emp.mileageRate || 0);
      const overtimePay = (emp.overtimeHours || 0) * (emp.visitRate || 0) * 1.5;
      return (
        sum + visitPay + facilityPay + officePay + mileagePay + overtimePay
      );
    }, 0);

    // 3) Save PayrollHistory
    const history = await tx.payrollHistory.create({
      data: {
        agencyId,
        runBy: runByUserId,
        periodFrom: from,
        periodTo: to,
        employees,
        totalAmount,
        unityTaskId: taskId ?? null,
        status: "PENDING",
      },
    });

    // 4) Update PayrollSettings to remember last period
    await tx.payrollSettings.update({
      where: { agencyId },
      data: {
        lastPeriodFrom: from,
        lastPeriodTo: to,
      },
    });

    // 5) Mark Unity Task complete if provided
    let updatedTask: any = null;
    if (taskId) {
      updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          isDone: true,
          isActive: false,
          completedAt: new Date(),
        },
      });
    }

    return {
      history,
      updatedTask,
    };
  });
}

// -----------------------------------------
// HISTORY + APPROVALS + EXPORTS
// -----------------------------------------

export async function listPayrollHistory(agencyId: string) {
  return prisma.payrollHistory.findMany({
    where: { agencyId },
    orderBy: { runAt: "desc" },
  });
}

export async function getPayrollHistoryById(id: string) {
  return prisma.payrollHistory.findUnique({
    where: { id },
  });
}

export async function approvePayroll(id: string, approverId: string) {
  return prisma.payrollHistory.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedBy: approverId,
      approvedAt: new Date(),
    },
  });
}

export async function rejectPayroll(
  id: string,
  approverId: string,
  notes?: string
) {
  return prisma.payrollHistory.update({
    where: { id },
    data: {
      status: "REJECTED",
      approvedBy: approverId,
      approvedAt: new Date(),
      notes: notes ?? null,
    },
  });
}

// ---------- EXPORT HELPERS ----------

function toCsv(rows: any[], columns: string[]) {
  const header = columns.join(",");
  const data = rows
    .map((r) =>
      columns
        .map((c) => {
          const val = r[c] ?? "";
          if (typeof val === "string" && val.includes(",")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    )
    .join("\n");
  return `${header}\n${data}`;
}

export async function exportPayroll(id: string, format: string) {
  const history = await prisma.payrollHistory.findUnique({
    where: { id },
  });
  if (!history) throw new Error("Payroll history not found");

  const employees = (history.employees as any[]) || [];

  switch (format) {
    case "csv": {
      const columns = [
        "employeeCode",
        "name",
        "visitHours",
        "visitRate",
        "facilityHours",
        "facilityRate",
        "officeHours",
        "officeRate",
        "mileage",
        "mileageRate",
        "overtimeHours",
      ];
      const csv = toCsv(employees, columns);
      return {
        mime: "text/csv",
        filename: `payroll_${id}.csv`,
        content: csv,
      };
    }

    case "adp": {
      // Example ADP-style CSV (you can adjust to ADP spec)
      const columns = [
        "employeeCode",
        "visitHours",
        "visitRate",
        "overtimeHours",
      ];
      const csv = toCsv(employees, columns);
      return {
        mime: "text/csv",
        filename: `payroll_adp_${id}.csv`,
        content: csv,
      };
    }

    case "quickbooks": {
      // Example QuickBooks-style CSV (adapt as needed)
      const columns = [
        "employeeCode",
        "name",
        "visitHours",
        "facilityHours",
        "officeHours",
        "mileage",
      ];
      const csv = toCsv(employees, columns);
      return {
        mime: "text/csv",
        filename: `payroll_quickbooks_${id}.csv`,
        content: csv,
      };
    }

    case "pdf": {
      // Simple pseudo-PDF via text for now
      // If you want real PDF, plug in pdfkit or similar
      const lines: string[] = [];
      lines.push(`Payroll ID: ${history.id}`);
      lines.push(
        `Period: ${history.periodFrom.toISOString().split("T")[0]} - ${
          history.periodTo.toISOString().split("T")[0]
        }`
      );
      lines.push(`Total Amount: ${history.totalAmount ?? 0}`);
      lines.push("");
      for (const e of employees) {
        lines.push(
          `${e.employeeCode} - ${e.name} | Visit: ${e.visitHours} x ${e.visitRate}`
        );
      }
      const text = lines.join("\n");
      return {
        mime: "application/pdf",
        filename: `payroll_${id}.pdf`,
        // In a real PDF implementation you’d return binary;
        // here we just return text and you can swap in pdfkit later.
        content: text,
      };
    }

    default:
      throw new Error("Unsupported format");
  }
}

// Helper to expose current/next period based on settings
export async function getSuggestedPeriod(agencyId: string) {
  const settings = await getOrCreatePayrollSettings(agencyId);
  const { from, to } = calculateNextPeriod(settings);
  return { from, to };
}
// import prisma from "../lib/db";
// import { differenceInHours } from "date-fns";
// import {
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   subWeeks,
//   subMonths,
//   subQuarters,
//   startOfQuarter,
//   endOfQuarter,
//   subYears,
//   startOfYear,
//   endOfYear,
// } from "date-fns";
// import * as taskService from "./task.service";

// type Frequency =
//   | "DAILY"
//   | "WEEKLY"
//   | "MONTHLY"
//   | "QUARTERLY"
//   | "YEARLY"
//   | "SPECIFIC_DATE";

// function getPeriodFromTask(task: any): { from: Date; to: Date } {
//   const due = task.dueDate ? new Date(task.dueDate) : new Date();
//   let from: Date;
//   let to: Date;

//   switch (task.frequency as Frequency) {
//     case "WEEKLY": {
//       const prevWeekStart = startOfWeek(subWeeks(due, 1), { weekStartsOn: 0 });
//       const prevWeekEnd = endOfWeek(subWeeks(due, 1), { weekStartsOn: 0 });
//       from = prevWeekStart;
//       to = prevWeekEnd;
//       break;
//     }
//     case "MONTHLY": {
//       const prevMonth = subMonths(due, 1);
//       from = startOfMonth(prevMonth);
//       to = endOfMonth(prevMonth);
//       break;
//     }
//     case "QUARTERLY": {
//       const prevQuarter = subQuarters(due, 1);
//       from = startOfQuarter(prevQuarter);
//       to = endOfQuarter(prevQuarter);
//       break;
//     }
//     case "YEARLY": {
//       const prevYear = subYears(due, 1);
//       from = startOfYear(prevYear);
//       to = endOfYear(prevYear);
//       break;
//     }
//     case "DAILY":
//     case "SPECIFIC_DATE":
//     default: {
//       // Fallback: single-day period
//       from = new Date(due);
//       from.setHours(0, 0, 0, 0);
//       to = new Date(due);
//       to.setHours(23, 59, 59, 999);
//       break;
//     }
//   }

//   return { from, to };
// }

// function toDateOrThrow(value: string | undefined, name: string): Date {
//   if (!value) throw new Error(`Missing ${name}`);
//   const d = new Date(value);
//   if (isNaN(d.getTime())) throw new Error(`Invalid date for ${name}`);
//   return d;
// }

// // --- Core payroll preview logic ---
// export async function getPayrollPreview(params: {
//   agencyId: string;
//   periodFrom?: string;
//   periodTo?: string;
//   taskId?: string;
// }) {
//   const { agencyId, periodFrom, periodTo, taskId } = params;

//   let from: Date;
//   let to: Date;
//   let task: any | null = null;

//   if (taskId) {
//     task = await prisma.task.findUnique({ where: { id: taskId } });
//     if (!task) throw new Error("Task not found");
//   }

//   if (periodFrom && periodTo) {
//     from = toDateOrThrow(periodFrom, "periodFrom");
//     to = toDateOrThrow(periodTo, "periodTo");
//   } else if (task) {
//     const period = getPeriodFromTask(task);
//     from = period.from;
//     to = period.to;
//   } else {
//     // default: previous week
//     const now = new Date();
//     from = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
//     to = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
//   }

//   // Has payroll already been run for this period?
//   const existingRun = await prisma.payrollHistory.findFirst({
//     where: {
//       agencyId,
//       periodFrom: from,
//       periodTo: to,
//     },
//   });

//   // Load employees + rates
//   const employees = await prisma.employee.findMany({
//     where: { agencyID: agencyId },
//     include: {
//       employmentInfo: true,
//     },
//   });

//   // Load visits within period
//   const visits = await prisma.visit.findMany({
//     where: {
//       agencyID: agencyId,
//       callIn: { gte: from },
//       callOut: { lte: to },
//     },
//   });

//   // Build per-employee aggregates
//   const payrollEmployees = employees.map((emp) => {
//     const empVisits = visits.filter((v) => v.employeeID === emp.id);

//     const visitHours = empVisits.reduce((sum, v) => {
//       // Prefer payHours → callHours → diff(callIn, callOut)
//       if (v.payHours != null) return sum + (v.payHours || 0);
//       if (v.callHours != null) return sum + (v.callHours || 0);
//       if (v.callIn && v.callOut) {
//         const hours =
//           (new Date(v.callOut).getTime() - new Date(v.callIn).getTime()) /
//           (1000 * 60 * 60);
//         return sum + hours;
//       }
//       return sum;
//     }, 0);

//     const mileage = empVisits.reduce((sum, v) => sum + (v.mileage || 0), 0);

//     // Naive overtime: > 40 hrs
//     const overtimeHours = visitHours > 40 ? visitHours - 40 : 0;

//     const officeRate = emp.employmentInfo?.officePayRate || 0;
//     const facilityRate = emp.employmentInfo?.facilityPayRate || 0;
//     const visitRate = emp.employmentInfo?.visitPayRate || 0;
//     const mileageRate = emp.employmentInfo?.mileagePayRate || 0;

//     // For now, we only count "visitHours" from EVV.
//     // officeHours/facilityHours could be derived from Schedule.scheduleType later.
//     const officeHours = 0;
//     const facilityHours = 0;

//     return {
//       id: emp.id,
//       name: emp.name,
//       visitHours: Number(visitHours.toFixed(2)),
//       visitRate,
//       facilityHours,
//       facilityRate,
//       officeHours,
//       officeRate,
//       mileage: Number(mileage.toFixed(2)),
//       mileageRate,
//       overtimeHours: Number(overtimeHours.toFixed(2)),
//     };
//   });

//   const totalPayroll = payrollEmployees.reduce((sum, emp) => {
//     const base =
//       emp.visitHours * emp.visitRate +
//       emp.facilityHours * emp.facilityRate +
//       emp.officeHours * emp.officeRate +
//       emp.mileage * emp.mileageRate +
//       emp.overtimeHours * emp.visitRate * 1.5;
//     return sum + base;
//   }, 0);

//   return {
//     periodFrom: from,
//     periodTo: to,
//     employees: payrollEmployees,
//     totalPayroll,
//     alreadyRan: !!existingRun,
//     payrollRun: existingRun || null,
//   };
// }

// // --- Run Payroll & link to Unity Task ---
// export async function runPayroll(params: {
//   agencyId: string;
//   periodFrom: string;
//   periodTo: string;
//   runByUserId: string;
//   taskId?: string;
//   notes?: string;
// }) {
//   const { agencyId, periodFrom, periodTo, runByUserId, taskId, notes } = params;

//   const from = toDateOrThrow(periodFrom, "periodFrom");
//   const to = toDateOrThrow(periodTo, "periodTo");

//   const preview = await getPayrollPreview({
//     agencyId,
//     periodFrom,
//     periodTo,
//     taskId,
//   });

//   // If already ran, just return that
//   const existingRun = await prisma.payrollHistory.findFirst({
//     where: { agencyId, periodFrom: from, periodTo: to },
//   });

//   let payrollRun;
//   if (existingRun) {
//     payrollRun = existingRun;
//   } else {
//     payrollRun = await prisma.payrollHistory.create({
//       data: {
//         agencyId,
//         periodFrom: from,
//         periodTo: to,
//         runBy: runByUserId,
//         notes: notes || null,
//         unityTaskId: taskId || null,
//       },
//     });
//   }

//   // If tied to a Unity Task → mark task complete using existing task logic
//   let updatedTask: any = null;
//   if (taskId) {
//     try {
//       updatedTask = await taskService.completeTask(taskId);
//     } catch (err) {
//       console.error("Failed to auto-complete payroll task:", err);
//     }
//   }

//   return {
//     payrollRun,
//     preview,
//     updatedTask,
//   };
// }

// // --- Helper: auto-complete task if payroll already exists for that period (when landing on page) ---
// export async function autoCompletePayrollTaskIfRun(params: {
//   agencyId: string;
//   taskId: string;
// }) {
//   const task = await prisma.task.findUnique({ where: { id: params.taskId } });
//   if (!task) return null;

//   const period = getPeriodFromTask(task);

//   const existingRun = await prisma.payrollHistory.findFirst({
//     where: {
//       agencyId: params.agencyId,
//       periodFrom: period.from,
//       periodTo: period.to,
//     },
//   });

//   if (!existingRun) return null;

//   // If payroll already exists → move task to next period via existing logic
//   const updatedTask = await taskService.completeTask(task.id);
//   return { existingRun, updatedTask, period };
// }
