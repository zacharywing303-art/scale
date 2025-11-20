import { Router } from "express";
import * as ctrl from "../controllers/employee-request.controller";

const router = Router();

router.post("/timeoff", ctrl.submitTimeOff);
router.post("/availability", ctrl.submitAvailabilityChange);
router.post("/status", ctrl.submitStatusChange);

router.get("/pending/:agencyId", ctrl.getPending);

router.post("/:id/approve", ctrl.approve);
router.post("/:id/decline", ctrl.decline);

export default router;
