import { Request, Response } from "express";
import {
  getDashboardSummary,
  getDailySchedules,
} from "../services/dashboard.service";

export async function getSummary(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const data = await getDashboardSummary(start, end);
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
}

export async function fetchDailySchedules(req: Request, res: Response) {
  try {
    const { agencyID, date } = req.query;

    if (!agencyID || !date) {
      return res
        .status(400)
        .json({ message: "agencyID and date are required" });
    }

    const schedules = await getDailySchedules(
      agencyID as string,
      date as string
    );

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching daily schedules:", error);
    res.status(500).json({ message: "Failed to fetch schedules" });
  }
}
