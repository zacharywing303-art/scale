import { Request, Response } from "express";
import * as clientService from "../services/client.service";

export const getClients = async (_req: Request, res: Response) => {
  const clients = await clientService.getAllClients();
  res.json(clients);
};

export const getClient = async (req: Request, res: Response) => {
  const client = await clientService.getClientById(req.params.id);
  if (!client) return res.status(404).json({ message: "Client not found" });
  res.json(client);
};

export const createClient = async (req: Request, res: Response) => {
  const client = await clientService.createClient(req.body);
  res.status(201).json(client);
};

export const updateClient = async (req: Request, res: Response) => {
  const client = await clientService.updateClient(req.params.id, req.body);
  res.json(client);
};

export const deleteClient = async (req: Request, res: Response) => {
  await clientService.deleteClient(req.params.id);
  res.status(204).send();
};
