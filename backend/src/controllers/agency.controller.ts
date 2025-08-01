import { Request, Response } from "express";
import {
  getAllAgencies,
  getAgencyById,
  createAgencyWithAdmin,
  deleteAgency,
  updateAgency,
  updateAgencySettings,
} from "../services/agency.service";
import prisma from "../lib/db";
import bcrypt from "bcryptjs";

export const getAllAgenciesController = async (
  _req: Request,
  res: Response
) => {
  const agencies = await getAllAgencies();
  res.json(agencies);
};

export const getAgencyByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const agency = await getAgencyById(id);
  if (!agency) return res.status(404).json({ message: "Agency not found" });
  res.json(agency);
};

export const createAgencyController = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, contactPerson, santraxID } = req.body;

    if (!name || !email || !phone || !contactPerson || !santraxID) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user with contact email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    const agency = await createAgencyWithAdmin({
      name,
      email,
      phone,
      contactPerson,
      santraxID,
      passwordHash: hashedPassword,
    });

    res.status(201).json({ message: "Agency created", agencyId: agency.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAgencyController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await updateAgency(id, data);
  res.json(updated);
};

export const deleteAgencyController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteAgency(id);
  res.status(204).send();
};

export const updateAgencySettingsController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { allowEvv, status, state, subscriptionPlan } = req.body;

  if (typeof allowEvv !== "boolean" || !status || !state || !subscriptionPlan) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const agency = await updateAgencySettings(
      id,
      allowEvv,
      status,
      state,
      subscriptionPlan
    );
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    return res.json({ message: "Agency settings updated", agency });
  } catch (err) {
    console.error("Failed to update agency settings:", err);
    return res.status(500).json({ error: "Failed to update settings" });
  }
};
