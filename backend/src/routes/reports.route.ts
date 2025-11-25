// src/routes/reports.route.ts
import { Router } from "express";
import * as ctrl from "../controllers/reports.controller";

const router = Router();

// Load dropdown filters: clients, employees, services, payers, programs, agency
router.get("/:agencyId/filters", ctrl.getFilters);

// EVV Compliance report
router.post("/:agencyId/evv-compliance", ctrl.evvCompliance);

export default router;
