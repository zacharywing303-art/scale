import { Request, Response } from "express";
import * as authService from "../services/authorizations.service";

export async function getAuthsForClient(req: Request, res: Response) {
  const auths = await authService.getAuthsForClient(req.params.clientId);
  res.json(auths);
}

export async function createAuthorization(req: Request, res: Response) {
  const auth = await authService.createAuthorization(req.body);
  res.status(201).json(auth);
}

export async function updateAuthorization(req: Request, res: Response) {
  const auth = await authService.updateAuthorization(req.params.id, req.body);
  res.json(auth);
}

export async function deleteAuthorization(req: Request, res: Response) {
  await authService.deleteAuthorization(req.params.id);
  res.status(204).send();
}
