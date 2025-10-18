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
    return prisma.task.update({
      where: { id: taskId },
      data: { dueDate: newDueDate, isDone: false },
    });
  } else {
    // non-recurring -> mark inactive
    return prisma.task.update({
      where: { id: taskId },
      data: { isDone: true, isActive: false },
    });
  }
};
