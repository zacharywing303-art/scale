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

// export const updateClient = async (req: Request, res: Response) => {
//   const client = await clientService.updateClient(req.params.id, req.body);
//   res.json(client);
// };
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // 1️⃣ Remove non-updatable fields
    const {
      addresses,
      contacts,
      program,
      services,
      agency,
      createdAt,
      updatedAt,
      ...safeData
    } = data;

    // 2️⃣ Fetch current client
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Client not found" });

    // 3️⃣ Compute differences (basic shallow diff)
    const changedFields: Record<string, { old: any; new: any }> = {};
    Object.keys(safeData).forEach((key) => {
      if (safeData[key] !== (existing as any)[key]) {
        changedFields[key] = {
          old: (existing as any)[key],
          new: safeData[key],
        };
      }
    });

    // 4️⃣ Update client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: safeData,
    });

    // 5️⃣ Log to ClientHistory if anything changed
    if (Object.keys(changedFields).length > 0) {
      await prisma.clientHistory.create({
        data: {
          clientId: id,
          title: "Client Info Updated",
          reason: "General info change",
          changedBy: req.body.updatedBy || "System", // optional user tracking
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
