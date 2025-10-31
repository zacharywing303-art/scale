// Example: routes/mobile.auth.routes.ts
import { Router } from "express";
import {
  mobileLogin,
  getMobileProfile,
} from "../controllers/mobile.auth.controller";
import { verifyMobileToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", mobileLogin);
router.get("/me", verifyMobileToken, getMobileProfile);

export default router;
