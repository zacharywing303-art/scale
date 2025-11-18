import prisma from "../lib/db";
import {
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  addMonths,
  differenceInHours,
} from "date-fns";
import * as taskService from "./task.service";

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

  // First time: default to last week
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

    case "CUSTOM":
      const days = settings.customDays || 14;
      return {
        from: addDays(lastFrom, days),
        to: addDays(lastTo, days),
      };

    default:
      return {
        from: startOfWeek(now, { weekStartsOn: 0 }),
        to: endOfWeek(now, { weekStartsOn: 0 }),
      };
  }
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

  // 1. Load visits
  const visits = await prisma.visit.findMany({
    where: {
      agencyID: agencyId,
      callIn: { gte: from },
      callOut: { lte: to },
    },
  });

  // 2. Load employees + pay rates
  const employees = await prisma.employee.findMany({
    where: { agencyID: agencyId },
    include: { employmentInfo: true },
  });

  // 3. Aggregate
  const rows = employees.map((emp) => {
    const empVisits = visits.filter((v) => v.employeeID === emp.id);

    // Visit hours (auto)
    let visitHours = empVisits.reduce((sum, v) => {
      if (v.payHours != null) return sum + v.payHours;
      if (v.callHours != null) return sum + v.callHours;
      if (v.callIn && v.callOut) {
        const hours =
          (new Date(v.callOut).getTime() - new Date(v.callIn).getTime()) /
          (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    // Mileage
    let mileage = empVisits.reduce((sum, v) => sum + (v.mileage ?? 0), 0);

    return {
      employeeId: emp.id,
      name: emp.name,

      visitHours: Number(visitHours.toFixed(2)),
      facilityHours: 0, // always manual entry
      officeHours: 0, // always manual entry

      mileage: Number(mileage.toFixed(2)),

      visitRate: emp.employmentInfo?.visitPayRate ?? 0,
      facilityRate: emp.employmentInfo?.facilityPayRate ?? 0,
      officeRate: emp.employmentInfo?.officePayRate ?? 0,
      mileageRate: emp.employmentInfo?.mileagePayRate ?? 0,

      overtimeHours: visitHours > 40 ? visitHours - 40 : 0,
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
  employees: any[]; // FULL payroll rows after user edits
  taskId?: string;
  updateRates?: {
    // optional map of employeeId → fields to update
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

  // 1. Update EmploymentInfo for employees who confirmed rate changes
  if (updateRates) {
    for (const empId in updateRates) {
      await prisma.employmentInfo.updateMany({
        where: { employeeId: empId },
        data: updateRates[empId],
      });
    }
  }

  // 2. Save payroll snapshot
  const history = await prisma.payrollHistory.create({
    data: {
      agencyId,
      runBy: runByUserId,
      periodFrom: from,
      periodTo: to,
      employees: employees,
      unityTaskId: taskId ?? null,
    },
  });

  // 3. Update payroll settings period
  await prisma.payrollSettings.update({
    where: { agencyId },
    data: {
      lastPeriodFrom: from,
      lastPeriodTo: to,
    },
  });

  // 4. Complete Unity Task if exists
  let updatedTask = null;
  if (taskId) {
    updatedTask = await taskService.completeTask(taskId);
  }

  return {
    history,
    updatedTask,
  };
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
