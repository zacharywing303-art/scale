import { Request, Response } from "express";
import * as taskService from "../services/task.service";
import prisma from "../lib/db";

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err: any) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAgencyTasks = async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;
    const tasks = await taskService.getAgencyTasks(agencyId);
    res.json(tasks);
  } catch (err: any) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTasksByRole = async (req: Request, res: Response) => {
  try {
    const { agencyId, roleId } = req.params;
    const tasks = await taskService.getTasksByRole(agencyId, roleId);
    res.json(tasks);
  } catch (err: any) {
    console.error("Error fetching tasks by role:", err);
    res.status(500).json({ error: err.message });
  }
};

export const completeTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await taskService.completeTask(id);
    res.json(task);
  } catch (err: any) {
    console.error("Error completing task:", err);
    res.status(500).json({ error: err.message });
  }
};

export async function getTasksForUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleType: true,
        agency: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const tasks = await prisma.task.findMany({
      where: {
        agencyId: user.agencyId || undefined,
        assignedRoles: user.roleType
          ? { some: { roleId: user.roleType.id } }
          : undefined,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (err) {
    console.error("Error getting tasks:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { frequency, dueDate, description } = req.body;

    const updatedTask = await taskService.updateTask(id, {
      frequency,
      dueDate,
      description,
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Failed to update task" });
  }
}
