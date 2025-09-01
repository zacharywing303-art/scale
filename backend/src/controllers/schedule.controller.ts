import { Request, Response } from "express";
import {
  getAllSchedules,
  createScheduleAndVisit,
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
