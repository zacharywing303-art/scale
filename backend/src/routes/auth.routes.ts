// import { Router } from "express";
// import {
//   loginController,
//   registerController,
// } from "../controllers/auth.controller";

// const router = Router();

// // POST /api/auth/login
// router.post("/login", loginController);

// // POST /api/auth/register
// router.post("/register", registerController);

// export default router;
import { Router } from "express";
import { PrismaClient } from "../generated/prisma";
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
