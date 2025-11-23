import { Request, Response } from "express";
import * as programService from "../services/programs.service";

export async function getProgramsForAgency(req: Request, res: Response) {
  const items = await programService.getProgramsForAgency(req.params.agencyId);
  res.json(items);
}

export async function createProgram(req: Request, res: Response) {
  const program = await programService.createProgram(req.body);
  res.status(201).json(program);
}

export async function updateProgram(req: Request, res: Response) {
  const program = await programService.updateProgram(req.params.id, req.body);
  res.json(program);
}

export async function deleteProgram(req: Request, res: Response) {
  await programService.deleteProgram(req.params.id);
  res.status(204).send();
}
