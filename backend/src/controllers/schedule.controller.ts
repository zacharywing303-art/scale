import { Request, Response } from "express";
import {
  getAllSchedules,
  createScheduleAndVisit,
  updateSchedule,
  getScheduleById,
} from "../services/schedule.service";

export const getSchedulesController = async (req: Request, res: Response) => {
  try {
    const schedules = await getAllSchedules();
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
};

export async function createScheduleController(req: Request, res: Response) {
  try {
    const body = req.body;
    // TODO: pull agency from auth/session; using fallback for now
    const agencyID = body.agencyID ?? "UNITY124";

    const schedule = await createScheduleAndVisit({
      ...body,
      agencyID,
      eventDate: new Date(body.eventDate),
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    });

    res.status(201).json(schedule);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message ?? "Failed to create schedule" });
  }
}

export const updateScheduleController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updated = await updateSchedule(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating schedule:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export async function getScheduleByIdController(req: Request, res: Response) {
  try {
    const schedule = await getScheduleById(req.params.id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });
    res.json(schedule);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
}
