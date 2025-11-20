import { Router } from "express";
import * as ctrl from "../controllers/employee-request.controller";

const router = Router();

// Employee-submitted requests
router.post("/timeoff", ctrl.submitTimeOff);
router.post("/availability", ctrl.submitAvailabilityChange);
router.post("/status", ctrl.submitStatusChange);

// PTO usage for mobile (and web)
router.get("/pto/:employeeId", ctrl.getPtoUsage);

// Admin review
router.get("/pending/:agencyId", ctrl.getPending);
router.post("/:id/approve", ctrl.approve);
router.post("/:id/decline", ctrl.decline);

export default router;
