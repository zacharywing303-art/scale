import { Request, Response } from "express";
import {
  createSystemAdminUser,
  deleteUser,
  getAllUsers,
  getSystemAdminUsers,
  getSystemAdminUsersById,
  getUserById,
} from "../services/users.service";
import prisma from "../lib/db";
import bcrypt from "bcryptjs";

export const getAllUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getSystemAdminUsersController = async (
  _req: Request,
  res: Response
) => {
  try {
    const users = await getSystemAdminUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSystemAdminUsersByIdController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const user = await getSystemAdminUsersById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await deleteUser(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
export const createSystemAdminUserController = async (
  req: Request,
  res: Response
) => {
  const { email, password, name, isActive } = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, password, and name are required",
      });
    }
    const user = await createSystemAdminUser({
      email,
      password,
      name,
      isActive,
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateSystemAdminUserController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { name, email, isActive } = req.body;

  try {
    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required",
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        isActive,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
