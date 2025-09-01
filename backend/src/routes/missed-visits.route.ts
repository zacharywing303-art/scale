import { Router } from "express";
import {
  getMissedVisits,
  removeMissedVisit,
  rescheduleMissedVisit,
} from "../controllers/missed-visits.controller";

const router = Router();
router.get("/", getMissedVisits);
router.delete("/:id", removeMissedVisit);
router.post("/:id/reschedule", rescheduleMissedVisit);

export default router;
