import { Request, Response } from "express";
import {
  getAllSchedules,
  createScheduleAndVisit,
  updateSchedule,
  getScheduleById,
  getSchedulesByAgency,
  createScheduleAndVisitBatch,
  getGroupedSchedules,
  getSchedulesByGroup,
  updateScheduleGroup,
  deleteScheduleSafe,
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

export const getSchedulesByAgencyController = async (
  req: Request,
  res: Response
) => {
  try {
    const { agencyId } = req.params;
    const schedules = await getSchedulesByAgency(agencyId);
    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules by agency:", error);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
};

export const createScheduleBatchController = async (
  req: Request,
  res: Response
) => {
  try {
    const body = req.body;

    const agencyID = body.baseSchedule?.agencyID ?? "UNITY124";
    const result = await createScheduleAndVisitBatch({
      ...body,
      baseSchedule: {
        ...body.baseSchedule,
        agencyID,
      },
    });

    res.status(201).json({
      message: "✅ Schedules created successfully",
      count: result.length,
      schedules: result,
    });
  } catch (err: any) {
    console.error("❌ Error creating batch schedules:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to create batch schedules" });
  }
};

export const getGroupedSchedulesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { agencyId } = req.params;
    const { from, to } = req.query as { from?: string; to?: string };

    if (!agencyId) {
      return res.status(400).json({ error: "Agency ID is required" });
    }

    const grouped = await getGroupedSchedules(agencyId, from, to);
    res.status(200).json(grouped);
  } catch (error) {
    console.error("❌ Error fetching grouped schedules:", error);
    res.status(500).json({ error: "Failed to fetch grouped schedules" });
  }
};

export const getScheduleGroupController = async (
  req: Request,
  res: Response
) => {
  try {
    const { createdScheduleID } = req.params;
    const schedules = await getSchedulesByGroup(createdScheduleID);
    res.json(schedules);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch schedule group" });
  }
};

export const updateScheduleGroupController = async (
  req: Request,
  res: Response
) => {
  try {
    const { createdScheduleID } = req.params;
    const result = await updateScheduleGroup(createdScheduleID, req.body);
    res.json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: error.message || "Failed to update schedule group" });
  }
};

export const deleteScheduleSafeController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const result = await deleteScheduleSafe(id);
    res.json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: error.message || "Failed to delete schedule" });
  }
};
