import { Request, Response } from "express";
import prisma from "../lib/db";

export async function setClientProgram(req: Request, res: Response) {
  const { clientId } = req.params;
  const { programId } = req.body;
  const c = await prisma.client.update({
    where: { id: clientId },
    data: { programID: programId },
    include: { program: true },
  });
  res.json(c);
}

export async function addClientPayer(req: Request, res: Response) {
  const { clientId } = req.params;
  const { payerId } = req.body;
  const c = await prisma.client.update({
    where: { id: clientId },
    data: { payers: { connect: { id: payerId } } },
    include: { payers: true },
  });
  res.json(c);
}

export async function removeClientPayer(req: Request, res: Response) {
  const { clientId, payerId } = req.params;
  const c = await prisma.client.update({
    where: { id: clientId },
    data: { payers: { disconnect: { id: payerId } } },
    include: { payers: true },
  });
  res.json(c);
}

export async function addClientService(req: Request, res: Response) {
  const { clientId } = req.params;
  const { serviceId } = req.body;
  const c = await prisma.client.update({
    where: { id: clientId },
    data: { services: { connect: { id: serviceId } } },
    include: { services: true },
  });
  res.json(c);
}

export async function removeClientService(req: Request, res: Response) {
  const { clientId, serviceId } = req.params;
  const c = await prisma.client.update({
    where: { id: clientId },
    data: { services: { disconnect: { id: serviceId } } },
    include: { services: true },
  });
  res.json(c);
}
