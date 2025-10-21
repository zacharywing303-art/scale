import prisma from "../lib/db";
import { addDays, addMonths, addQuarters, addYears } from "date-fns";

export const createTask = async (data: any) => {
  const {
    name,
    description,
    agencyId,
    assignedRoleIds,
    dueDate,
    recurring,
    frequency,
    unityTask,
  } = data;

  const task = await prisma.task.create({
    data: {
      name,
      description,
      agencyId,
      dueDate: new Date(dueDate),
      recurring,
      frequency,
      unityTask,
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

export const completeTask = async (taskId: string) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  // ✅ If already complete → revert to incomplete
  if (task.isDone) {
    return prisma.task.update({
      where: { id: taskId },
      data: {
        isDone: false,
        isActive: true,
        completedAt: null, // reset timestamp
      },
    });
  }

  // ✅ If marking complete now
  if (task.recurring && task.frequency) {
    let newDueDate = new Date();
    switch (task.frequency) {
      case "DAILY":
        newDueDate = addDays(new Date(), 1);
        break;
      case "WEEKLY":
        newDueDate = addDays(new Date(), 7);
        break;
      case "MONTHLY":
        newDueDate = addMonths(new Date(), 1);
        break;
      case "QUARTERLY":
        newDueDate = addQuarters(new Date(), 1);
        break;
      case "YEARLY":
        newDueDate = addYears(new Date(), 1);
        break;
    }

    // Move forward one period and stay active
    return prisma.task.update({
      where: { id: taskId },
      data: {
        dueDate: newDueDate,
        isDone: false,
        isActive: true,
        completedAt: null,
      },
    });
  }

  // ✅ Non-recurring → mark as complete
  return prisma.task.update({
    where: { id: taskId },
    data: {
      isDone: true,
      isActive: false,
      completedAt: new Date(),
    },
  });
};

export async function getTasksForUser(user: {
  id: string;
  agencyId: string;
  role: string;
  roleTypeId?: string;
}) {
  if (user.role === "AGENCY_ADMIN") {
    // Admins see all tasks in agency
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

  // Regular users see tasks assigned to their role type
  return prisma.task.findMany({
    where: {
      assignedRoles: {
        some: {
          roleId: user.roleTypeId ?? "", // must match their roleType
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
    },
  });
}

export async function deleteTask(taskId: string) {
  return prisma.task.delete({
    where: { id: taskId },
  });
}
