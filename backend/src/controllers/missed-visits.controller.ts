import { Request, Response } from "express";
import {
  deleteMissedVisit,
  listMissedVisits,
  resolveMissedVisit,
} from "../services/missed-visits.service";

export async function getMissedVisits(req: Request, res: Response) {
  const agencyID = (req.query.agencyID as string) ?? "UNITY124";
  const items = await listMissedVisits(agencyID);
  res.json(items);
}

export async function removeMissedVisit(req: Request, res: Response) {
  const { id } = req.params;
  await deleteMissedVisit(id);
  res.status(204).end();
}

export async function rescheduleMissedVisit(req: Request, res: Response) {
  const { id } = req.params;
  // We may upscale toaccept a payload to create a new schedule+visit here,
  // then pass its Schedule.id to mark a link before deleting.
  await resolveMissedVisit(id);
  res.status(200).json({ ok: true });
}
