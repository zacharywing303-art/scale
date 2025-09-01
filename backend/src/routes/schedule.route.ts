import { Router } from "express";
import {
  getSchedulesController,
  createScheduleController,
} from "../controllers/schedule.controller";

const router = Router();

// GET /api/schedules
router.get("/", getSchedulesController);
router.post("/", createScheduleController);

export default router;
