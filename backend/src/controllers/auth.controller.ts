// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { loginService, registerService } from "../services/auth.service";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password, agencyCode } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const result = await loginService(email, password, agencyCode);
    return res.status(200).json(result); // result contains user + token
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, password, agencyCode } = req.body;

    if (!name || !email || !password || !agencyCode) {
      return res.status(400).json({
        message: "Name, email, password, and agency code are required",
      });
    }

    const result = await registerService({
      name,
      email,
      password,
      agencyCode,
    });
    return res.status(201).json(result); // result contains new user
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
