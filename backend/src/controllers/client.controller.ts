import { Request, Response } from "express";
import * as clientService from "../services/client.service";
import prisma from "../lib/db";

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

export const getClientsByAgency = async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;
    const clients = await prisma.client.findMany({
      where: { agencyID: agencyId },
      select: { id: true, name: true, medicaidID: true, supervisor: true },
    });
    res.json(clients);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};
