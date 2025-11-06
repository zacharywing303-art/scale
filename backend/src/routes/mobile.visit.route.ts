import { Router } from "express";
import {
  searchClientByClientID,
  startVisit,
  createManualEntry,
  clockOutVisit,
  recordMileage,
  getActiveVisit,
} from "../controllers/mobile.visit.controller";
import { verifyMobileToken } from "../middleware/auth.middleware";

const router = Router();

// Protected
router.get(
  "/search-client/:clientID",
  verifyMobileToken,
  searchClientByClientID
);
router.get("/active", verifyMobileToken, getActiveVisit);
router.post("/start", verifyMobileToken, startVisit);
router.post("/clock-out", verifyMobileToken, clockOutVisit);
router.post("/:id/mileage", verifyMobileToken, recordMileage);
router.post("/manual-entry", verifyMobileToken, createManualEntry);
// router.post("/mileage/:id", verifyMobileToken, recordMileage);

export default router;
