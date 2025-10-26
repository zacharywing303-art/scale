import { Router } from "express";
import {
  getSchedulesController,
  createScheduleController,
  updateScheduleController,
  getScheduleByIdController,
  getSchedulesByAgencyController,
  createScheduleBatchController,
} from "../controllers/schedule.controller";

const router = Router();

// GET /api/schedules
router.get("/", getSchedulesController);
router.post("/", createScheduleController);
router.put("/:id", updateScheduleController);
router.get("/:id", getScheduleByIdController);
router.get("/agency/:agencyId", getSchedulesByAgencyController);
router.post("/batch", createScheduleBatchController);

export default router;
