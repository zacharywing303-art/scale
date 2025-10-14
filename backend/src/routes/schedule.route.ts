import { Router } from "express";
import {
  getSchedulesController,
  createScheduleController,
  updateScheduleController,
  getScheduleByIdController,
} from "../controllers/schedule.controller";

const router = Router();

// GET /api/schedules
router.get("/", getSchedulesController);
router.post("/", createScheduleController);
router.put("/:id", updateScheduleController);
router.get("/:id", getScheduleByIdController);

export default router;
