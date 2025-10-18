import { Router } from "express";
import * as taskController from "../controllers/task.controller";

const router = Router();

router.post("/", taskController.createTask);
router.get("/agency/:agencyId", taskController.getAgencyTasks);
router.get("/agency/:agencyId/role/:roleId", taskController.getTasksByRole);
router.patch("/:id/complete", taskController.completeTask);

export default router;
