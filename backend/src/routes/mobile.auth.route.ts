// Example: routes/mobile.auth.routes.ts
import { Router } from "express";
import { mobileLogin } from "../controllers/mobile.auth.controller";

const router = Router();

router.post("/login", mobileLogin);

export default router;
