import { Router } from "express";
import * as visitController from "../controllers/visit.controller";

const router = Router();

router.get("/agency/:agencyId", visitController.getVisitsByAgency);
router.get("/:id", visitController.getVisitById);
router.post("/", visitController.createVisit);
router.patch("/:id", visitController.updateVisit);
router.delete("/:id", visitController.deleteVisit);

export default router;
