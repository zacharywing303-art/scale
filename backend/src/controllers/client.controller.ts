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
  try {
    if (!req.body.agencyID) {
      return res.status(400).json({ message: "Missing agencyID" });
    }
    const client = await clientService.createClient(req.body);
    res.status(201).json(client);
  } catch (error: any) {
    console.error("Error creating client:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create client" });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // 💡 Map frontend field names to actual Prisma columns
    const safeData: Record<string, any> = {
      ssn: data.ssn,
      name: data.name,
      title: data.title,
      middleInitial: data.middleInitial,
      suffix: data.suffix,
      gender: data.gender,
      email: data.email,
      mainPhone: data.mainPhone,
      phone2: data.phone2,
      phone3: data.phone3,
      phone4: data.phone4,
      languages: Array.isArray(data.languages) ? data.languages : [],
      dateOfBirth: data.dateOfBirth,
      updatedAt: new Date(),
    };

    // Remove undefined/null
    Object.keys(safeData).forEach((key) => {
      if (safeData[key] === undefined) delete safeData[key];
    });

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Client not found" });

    const changedFields: Record<string, { old: any; new: any }> = {};
    for (const key of Object.keys(safeData)) {
      if (safeData[key] !== (existing as any)[key]) {
        changedFields[key] = {
          old: (existing as any)[key],
          new: safeData[key],
        };
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: safeData,
    });

    if (Object.keys(changedFields).length > 0) {
      await prisma.clientHistory.create({
        data: {
          clientId: id,
          title: "Client Info Updated",
          reason: "General info change",
          changedBy: req.body.updatedBy || "System",
          changes: changedFields,
        },
      });
    }

    res.json(updatedClient);
  } catch (error: any) {
    console.error("Error updating client:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to update client" });
  }
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
      select: {
        id: true,
        name: true,
        medicaidID: true,
        supervisor: true,
        clientID: true,
        status: true,
        startDate: true,
        endDate: true,
        program: { select: { name: true } },
        languages: true,
      },
      orderBy: { name: "asc" },
    });
    res.json(clients);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};

export const getClientHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await prisma.clientHistory.findMany({
      where: { clientId: id },
      orderBy: { changedAt: "desc" },
    });
    res.json(history);
  } catch (error: any) {
    console.error("Error fetching client history:", error);
    res.status(500).json({ message: "Failed to fetch client history" });
  }
};
