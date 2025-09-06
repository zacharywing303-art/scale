import { Router } from "express";
import {
  getSchedulesController,
  createScheduleController,
  updateScheduleController,
} from "../controllers/schedule.controller";

const router = Router();

// GET /api/schedules
router.get("/", getSchedulesController);
router.post("/", createScheduleController);
router.put("/:id", updateScheduleController);

export default router;
