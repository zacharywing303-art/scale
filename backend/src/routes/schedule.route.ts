import { Router } from "express";
import {
  getSchedulesController,
  createScheduleController,
  updateScheduleController,
  getScheduleByIdController,
  getSchedulesByAgencyController,
  createScheduleBatchController,
  getGroupedSchedulesController,
  getScheduleGroupController,
  updateScheduleGroupController,
  deleteScheduleSafeController,
} from "../controllers/schedule.controller";

const router = Router();

router.get("/", getSchedulesController);
router.get("/agency/:agencyId/grouped", getGroupedSchedulesController);
router.post("/", createScheduleController);
router.put("/:id", updateScheduleController);
router.get("/:id", getScheduleByIdController);
router.get("/agency/:agencyId", getSchedulesByAgencyController);
router.post("/batch", createScheduleBatchController);
router.get("/group/:createdScheduleID", getScheduleGroupController);
router.put("/group/:createdScheduleID", updateScheduleGroupController);
router.delete("/:id/safe", deleteScheduleSafeController);

export default router;
