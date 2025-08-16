import { Router } from "express";
import {
  getSummary,
  fetchDailySchedules,
} from "../controllers/dashboard.controller";

const router = Router();

router.get("/summary", getSummary);
router.get("/daily-schedules", fetchDailySchedules);

export default router;
