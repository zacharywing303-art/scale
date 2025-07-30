import { Request, Response } from "express";
import * as agencyService from "../services/agency.service";

export const getAllAgenciesController = async (
  _req: Request,
  res: Response
) => {
  const agencies = await agencyService.getAllAgencies();
  res.json(agencies);
};

export const getAgencyByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const agency = await agencyService.getAgencyById(id);
  if (!agency) return res.status(404).json({ message: "Agency not found" });
  res.json(agency);
};

export const createAgencyController = async (req: Request, res: Response) => {
  console.log("🔥 POST /api/agencies hit");
  const data = req.body;
  const agency = await agencyService.createAgency(data);
  res.status(201).json(agency);
};

export const updateAgencyController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await agencyService.updateAgency(id, data);
  res.json(updated);
};

export const deleteAgencyController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await agencyService.deleteAgency(id);
  res.status(204).send();
};
