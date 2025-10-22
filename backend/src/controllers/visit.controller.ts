import * as visitService from "../services/visit.service";
import { Request, Response } from "express";

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
