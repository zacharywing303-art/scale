import { Request, Response } from "express";
import * as serviceService from "../services/services.service";

export const getServices = async (_req: Request, res: Response) => {
  const services = await serviceService.getAllServices();
  res.json(services);
};

export const getService = async (req: Request, res: Response) => {
  const service = await serviceService.getServiceById(req.params.id);
  if (!service) return res.status(404).json({ message: "Service not found" });
  res.json(service);
};

export const createService = async (req: Request, res: Response) => {
  const service = await serviceService.createService(req.body);
  res.status(201).json(service);
};

export const updateService = async (req: Request, res: Response) => {
  const service = await serviceService.updateService(req.params.id, req.body);
  res.json(service);
};

export const deleteService = async (req: Request, res: Response) => {
  await serviceService.deleteService(req.params.id);
  res.status(204).send();
};
