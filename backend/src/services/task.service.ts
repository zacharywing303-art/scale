import prisma from "../lib/db";
import {
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  startOfDay,
} from "date-fns";

/** safety caps */
const REPEAT_CAPS: Record<string, number> = {
  DAILY: 30,
  WEEKLY: 20,
  MONTHLY: 10,
  QUARTERLY: 5,
  YEARLY: 2,
};

/** calculate next due date from completion date */
function computeNextDueDate(
  completedAt: Date,
  frequency?: string | null
): Date {
  switch (frequency) {
    case "DAILY":
      return addDays(completedAt, 1);
    case "WEEKLY":
      return addWeeks(completedAt, 1);
    case "MONTHLY":
      return addMonths(completedAt, 1);
    case "QUARTERLY":
      return addQuarters(completedAt, 1);
    case "YEARLY":
      return addYears(completedAt, 1);
    default:
      return addWeeks(completedAt, 1);
  }
}

export const createTask = async (data: any) => {
  const {
    name,
    description,
    agencyId,
    assignedRoleIds = [],
    dueDate,
    recurring = false,
    frequency,
    unityTask = false,

    repeatCount,
    repeatRemaining,
    repeatForever = false,

    taskType,
    icon,
    color,
  } = data;

  if (!agencyId) throw new Error("agencyId is required");
  if (!dueDate) throw new Error("dueDate is required");

  const due = new Date(dueDate);
  const today = startOfDay(new Date());

  if (due < today) {
    throw new Error("Due date cannot be before today.");
  }

  // enforce caps if recurring
  if (recurring && !repeatForever && repeatCount) {
    const cap = REPEAT_CAPS[frequency] ?? 10;
    if (repeatCount > cap) {
      throw new Error(`Repeat count exceeds max of ${cap} for ${frequency}`);
    }
  }

  const task = await prisma.task.create({
    data: {
      name,
      description,
      agencyId,
      dueDate: due,
      recurring: !!recurring,
      frequency,
      unityTask,

      repeatCount: repeatCount ?? null,
      repeatRemaining: repeatRemaining ?? repeatCount ?? null,
      repeatForever: !!repeatForever,

      taskType: taskType ?? null,
      icon: icon ?? null,
      color: color ?? null,

      assignedRoles: {
        create: assignedRoleIds.map((roleId: string) => ({ roleId })),
      },
    },
    include: { assignedRoles: { include: { role: true } } },
  });

  return task;
};

export const getAgencyTasks = async (agencyId: string) => {
  return prisma.task.findMany({
    where: { agencyId, isActive: true },
    include: { assignedRoles: { include: { role: true } } },
    orderBy: { dueDate: "asc" },
  });
};

export const getTasksByRole = async (agencyId: string, roleId: string) => {
  return prisma.task.findMany({
    where: {
      agencyId,
      isActive: true,
      OR: [
        { assignedRoles: { some: { roleId } } },
        { assignedRoles: { some: { role: { name: "AGENCY_ADMIN" } } } },
      ],
    },
    include: { assignedRoles: { include: { role: true } } },
    orderBy: { dueDate: "asc" },
  });
};

/**
 * COMPLETE TASK (NEW ENGINE)
 * - If already complete: revert to incomplete (no chain rollback)
 * - If recurring:
 *     1) complete current task
 *     2) create next instance (Option A)
 *     3) decrement repeatRemaining (unless forever)
 */
export const completeTask = async (taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignedRoles: true },
  });
  if (!task) throw new Error("Task not found");

  // If already complete → revert to incomplete
  if (task.isDone) {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        isDone: false,
        isActive: true,
        completedAt: null,
      },
    });
    return { updatedTask };
  }

  const completedAt = new Date();

  // Mark current task complete
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      isDone: true,
      isActive: false,
      completedAt,
    },
  });

  // If recurring, generate next task
  if (task.recurring && task.frequency) {
    const remaining = task.repeatForever
      ? null
      : task.repeatRemaining ?? task.repeatCount ?? null;

    // if not forever and no remaining → stop
    if (!task.repeatForever && (!remaining || remaining <= 1)) {
      return { updatedTask };
    }

    const nextRemaining = task.repeatForever
      ? null
      : Math.max((remaining ?? 2) - 1, 0);

    const nextDueDate = computeNextDueDate(completedAt, task.frequency);

    const nextTask = await prisma.task.create({
      data: {
        name: task.name,
        description: task.description,
        agencyId: task.agencyId,
        assignedDate: completedAt, // ✅ Option A
        dueDate: nextDueDate,
        recurring: task.recurring,
        frequency: task.frequency,
        unityTask: task.unityTask,

        repeatCount: task.repeatCount,
        repeatRemaining: nextRemaining,
        repeatForever: task.repeatForever,

        taskType: task.taskType,
        icon: task.icon,
        color: task.color,

        assignedRoles: {
          create: task.assignedRoles.map((r) => ({
            roleId: r.roleId,
          })),
        },
      },
      include: { assignedRoles: { include: { role: true } } },
    });

    return { updatedTask, nextTask };
  }

  return { updatedTask };
};

export async function getTasksForUser(user: {
  id: string;
  agencyId: string;
  role: string;
  roleTypeId?: string;
}) {
  if (user.role === "AGENCY_ADMIN") {
    return prisma.task.findMany({
      where: {
        agencyId: user.agencyId,
        isActive: true,
      },
      include: {
        assignedRoles: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.task.findMany({
    where: {
      assignedRoles: {
        some: {
          roleId: user.roleTypeId ?? "",
        },
      },
      isActive: true,
    },
    include: {
      assignedRoles: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTask(taskId: string, data: any) {
  return prisma.task.update({
    where: { id: taskId },
    data: {
      name: data.name,
      frequency: data.frequency,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      description: data.description,

      // allow edits for visual fields too
      taskType: data.taskType ?? undefined,
      icon: data.icon ?? undefined,
      color: data.color ?? undefined,
    },
  });
}

export async function deleteTask(taskId: string) {
  return prisma.task.delete({
    where: { id: taskId },
  });
}
// import prisma from "../lib/db";
// import { addDays, addMonths, addQuarters, addYears } from "date-fns";

// export const createTask = async (data: any) => {
//   const {
//     name,
//     description,
//     agencyId,
//     assignedRoleIds,
//     dueDate,
//     recurring,
//     frequency,
//     unityTask,
//   } = data;

//   if (dueDate && new Date(dueDate) < new Date()) {
//     throw new Error("Due date cannot be before today.");
//   }

//   const task = await prisma.task.create({
//     data: {
//       name,
//       description,
//       agencyId,
//       dueDate: new Date(dueDate),
//       recurring,
//       frequency,
//       unityTask,
//       assignedRoles: {
//         create: assignedRoleIds.map((roleId: string) => ({ roleId })),
//       },
//     },
//     include: { assignedRoles: { include: { role: true } } },
//   });

//   return task;
// };

// export const getAgencyTasks = async (agencyId: string) => {
//   return prisma.task.findMany({
//     where: { agencyId, isActive: true },
//     include: { assignedRoles: { include: { role: true } } },
//     orderBy: { dueDate: "asc" },
//   });
// };

// export const getTasksByRole = async (agencyId: string, roleId: string) => {
//   return prisma.task.findMany({
//     where: {
//       agencyId,
//       isActive: true,
//       OR: [
//         { assignedRoles: { some: { roleId } } },
//         { assignedRoles: { some: { role: { name: "AGENCY_ADMIN" } } } },
//       ],
//     },
//     include: { assignedRoles: { include: { role: true } } },
//     orderBy: { dueDate: "asc" },
//   });
// };

// export const completeTask = async (taskId: string) => {
//   const task = await prisma.task.findUnique({ where: { id: taskId } });
//   if (!task) throw new Error("Task not found");

//   // If already complete → revert to incomplete
//   if (task.isDone) {
//     return prisma.task.update({
//       where: { id: taskId },
//       data: {
//         isDone: false,
//         isActive: true,
//         completedAt: null, // reset timestamp
//       },
//     });
//   }

//   // If marking complete now
//   if (task.recurring && task.frequency) {
//     let newDueDate = new Date();
//     switch (task.frequency) {
//       case "DAILY":
//         newDueDate = addDays(new Date(), 1);
//         break;
//       case "WEEKLY":
//         newDueDate = addDays(new Date(), 7);
//         break;
//       case "MONTHLY":
//         newDueDate = addMonths(new Date(), 1);
//         break;
//       case "QUARTERLY":
//         newDueDate = addQuarters(new Date(), 1);
//         break;
//       case "YEARLY":
//         newDueDate = addYears(new Date(), 1);
//         break;
//     }

//     // Move forward one period and stay active
//     return prisma.task.update({
//       where: { id: taskId },
//       data: {
//         dueDate: newDueDate,
//         isDone: false,
//         isActive: true,
//         completedAt: null,
//       },
//     });
//   }

//   // Non-recurring → mark as complete
//   return prisma.task.update({
//     where: { id: taskId },
//     data: {
//       isDone: true,
//       isActive: false,
//       completedAt: new Date(),
//     },
//   });
// };

// export async function getTasksForUser(user: {
//   id: string;
//   agencyId: string;
//   role: string;
//   roleTypeId?: string;
// }) {
//   if (user.role === "AGENCY_ADMIN") {
//     // Admins see all tasks in agency
//     return prisma.task.findMany({
//       where: {
//         agencyId: user.agencyId,
//         isActive: true,
//       },
//       include: {
//         assignedRoles: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });
//   }

//   // Regular users see tasks assigned to their role type
//   return prisma.task.findMany({
//     where: {
//       assignedRoles: {
//         some: {
//           roleId: user.roleTypeId ?? "", // must match their roleType
//         },
//       },
//       isActive: true,
//     },
//     include: {
//       assignedRoles: true,
//     },
//     orderBy: { createdAt: "desc" },
//   });
// }

// export async function updateTask(taskId: string, data: any) {
//   return prisma.task.update({
//     where: { id: taskId },
//     data: {
//       name: data.name,
//       frequency: data.frequency,
//       dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
//       description: data.description,
//     },
//   });
// }

// export async function deleteTask(taskId: string) {
//   return prisma.task.delete({
//     where: { id: taskId },
//   });
// }
