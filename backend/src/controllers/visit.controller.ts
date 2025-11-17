import * as visitService from "../services/visit.service";
import { Request, Response } from "express";
import prisma from "../lib/db";

export const getVisitsByAgency = async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;
    const visits = await visitService.getVisitsByAgency(agencyId);
    return res.json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    return res.status(500).json({ message: "Failed to fetch visits" });
  }
};

export const getVisitById = async (req: Request, res: Response) => {
  try {
    const visit = await visitService.getVisitById(Number(req.params.id));
    if (!visit) return res.status(404).json({ message: "Visit not found" });
    return res.json(visit);
  } catch (error) {
    console.error("Error fetching visit:", error);
    return res.status(500).json({ message: "Failed to fetch visit" });
  }
};

export const createVisit = async (req: Request, res: Response) => {
  try {
    const newVisit = await visitService.createVisit(req.body);
    return res.json(newVisit);
  } catch (error) {
    console.error("Error creating visit:", error);
    return res.status(500).json({ message: "Failed to create visit" });
  }
};

export const updateVisit = async (req: Request, res: Response) => {
  try {
    const updated = await visitService.updateVisit(
      Number(req.params.id),
      req.body
    );
    return res.json(updated);
  } catch (error) {
    console.error("Error updating visit:", error);
    return res.status(500).json({ message: "Failed to update visit" });
  }
};

export const deleteVisit = async (req: Request, res: Response) => {
  try {
    await visitService.deleteVisit(Number(req.params.id));
    return res.json({ message: "Visit deleted" });
  } catch (error) {
    console.error("Error deleting visit:", error);
    return res.status(500).json({ message: "Failed to delete visit" });
  }
};

export async function addVisitTask(req: Request, res: Response) {
  try {
    const visitId = Number(req.params.id);
    const { name } = req.body;
    if (!name) return res.status(400).send("Name is required");
    const created = await visitService.addVisitTask(visitId, name);
    res.json(created);
  } catch (e: any) {
    res.status(400).send(e.message || "Failed to add task");
  }
}

export async function updateVisitTask(req: Request, res: Response) {
  try {
    const visitId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    const { completed } = req.body;
    const updated = await visitService.updateVisitTask(
      visitId,
      taskId,
      !!completed
    );
    res.json(updated);
  } catch (e: any) {
    res.status(400).send(e.message || "Failed to update task");
  }
}

export async function deleteVisitTask(req: Request, res: Response) {
  try {
    const visitId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    const out = await visitService.deleteVisitTask(visitId, taskId);
    res.json(out);
  } catch (e: any) {
    res.status(400).send(e.message || "Failed to delete task");
  }
}

export const getGpsExceptions = async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;
    const { unreviewed, from, to } = req.query;

    const dateFilter =
      from && to
        ? {
            createdAt: {
              gte: new Date(from as string),
              lte: new Date(to as string),
            },
          }
        : {};

    const exceptions = await prisma.gPSException.findMany({
      where: {
        visit: { agencyID: agencyId },
        ...dateFilter,
      },
      include: {
        visit: {
          select: {
            id: true,
            callIn: true,
            callOut: true,
            clientName: true,
            employeeName: true,
            gpsInMilesFromClient: true,
            gpsOutMilesFromClient: true,
            clientID: true,
            employeeID: true,
            latitudeIn: true,
            longitudeIn: true,
            latitudeOut: true,
            longitudeOut: true,
            callInAddress: true,
            callOutAddress: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(exceptions);
  } catch (err: any) {
    console.error("getGpsExceptions error:", err);
    res.status(500).json({ message: "Failed to fetch GPS exceptions" });
  }
};
