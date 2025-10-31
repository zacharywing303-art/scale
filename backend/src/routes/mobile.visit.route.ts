import { Router } from "express";
import {
  searchClientByClientID,
  startVisit,
  createManualEntry,
} from "../controllers/mobile.visit.controller";
import { verifyMobileToken } from "../middleware/auth.middleware";

const router = Router();

// Protected
router.get(
  "/search-client/:clientID",
  verifyMobileToken,
  searchClientByClientID
);
router.post("/start", verifyMobileToken, startVisit);
router.post("/manual-entry", verifyMobileToken, createManualEntry);

export default router;
