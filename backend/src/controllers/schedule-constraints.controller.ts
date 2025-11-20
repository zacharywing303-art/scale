import { Request, Response } from "express";
import * as constraintService from "../services/schedule-constraints.service";

export async function checkConstraints(req: Request, res: Response) {
  try {
    const { agencyId, employeeIds, date, startTime, endTime } = req.body;

    if (!agencyId || !employeeIds || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const conflicts = await constraintService.getSchedulingConflicts({
      agencyId,
      employeeIds,
      date,
      startTime,
      endTime,
    });

    // Transform conflicts into hardBlocks messages
    const hardBlocks = (conflicts || []).map((c: any) => {
      if (c.reason === "TimeOff" || c.reason === "Sick") {
        const [from, to] = c.details?.range || [];
        return `Employee ${c.employeeId} has approved ${c.reason} from ${from} to ${to}.`;
      }

      if (c.reason === "Availability") {
        return `Employee ${c.employeeId} is not available for the requested window.`;
      }

      return `Employee ${c.employeeId} has a scheduling conflict.`;
    });

    const response = {
      canSchedule: hardBlocks.length === 0,
      hardBlocks,
      softWarnings: [] as string[],
    };

    return res.json(response);
  } catch (err) {
    console.error("Error checking constraints:", err);
    res.status(500).json({ error: "Server error" });
  }
}
