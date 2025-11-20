import { Request, Response } from "express";
import * as constraintService from "../services/schedule-constraints.service";

export async function checkConstraints(req: Request, res: Response) {
  try {
    const { agencyId, employeeIds, date, startTime, endTime } = req.body;

    if (!agencyId || !employeeIds || !date || !startTime || !endTime)
      return res.status(400).json({ error: "Missing required fields" });

    const conflicts = await constraintService.getSchedulingConflicts({
      agencyId,
      employeeIds,
      date,
      startTime,
      endTime,
    });

    res.json({ unavailable: conflicts });
  } catch (err) {
    console.error("Error checking constraints:", err);
    res.status(500).json({ error: "Server error" });
  }
}
