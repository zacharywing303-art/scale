import { Router } from "express";
import {
  getSchedulesController,
  createScheduleController,
  updateScheduleController,
  getScheduleByIdController,
  getSchedulesByAgencyController,
} from "../controllers/schedule.controller";

const router = Router();

// GET /api/schedules
router.get("/", getSchedulesController);
router.post("/", createScheduleController);
router.put("/:id", updateScheduleController);
router.get("/:id", getScheduleByIdController);
router.get("/agency/:agencyId", getSchedulesByAgencyController);

export default router;
