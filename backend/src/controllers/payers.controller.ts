import { Request, Response } from "express";
import * as payerService from "../services/payers.service";

export async function getPayersForAgency(req: Request, res: Response) {
  const items = await payerService.getPayersForAgency(req.params.agencyId);
  res.json(items);
}

export async function createPayer(req: Request, res: Response) {
  const payer = await payerService.createPayer(req.body);
  res.status(201).json(payer);
}

export async function updatePayer(req: Request, res: Response) {
  const payer = await payerService.updatePayer(req.params.id, req.body);
  res.json(payer);
}

export async function deletePayer(req: Request, res: Response) {
  await payerService.deletePayer(req.params.id);
  res.status(204).send();
}
