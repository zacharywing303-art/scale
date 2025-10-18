import { Request, Response } from "express";
import * as taskService from "../services/task.service";

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

    const tasks = await taskService.getTasksForUser(userId);

    res.json(tasks);
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: error.message });
  }
}
