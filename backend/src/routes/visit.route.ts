import { Router } from "express";
import * as visitController from "../controllers/visit.controller";

const router = Router();

router.get("/agency/:agencyId", visitController.getVisitsByAgency);
router.get("/:id", visitController.getVisitById);
router.post("/", visitController.createVisit);
router.patch("/:id", visitController.updateVisit);
router.delete("/:id", visitController.deleteVisit);
router.post("/:id/tasks", visitController.addVisitTask);
router.patch("/:id/tasks/:taskId", visitController.updateVisitTask);
router.delete("/:id/tasks/:taskId", visitController.deleteVisitTask);
router.get(
  "/gps-exceptions/:agencyId",
  visitController.getGpsExceptions // list + filters + pagination
);
router.get(
  "/gps-exceptions/:agencyId/summary",
  visitController.getGpsExceptionSummary
);
router.patch("/gps-exceptions/:id/review", visitController.reviewGpsException);

export default router;
