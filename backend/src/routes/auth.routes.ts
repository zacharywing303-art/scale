import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller";

const prisma = new PrismaClient();
const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);

export default router;
