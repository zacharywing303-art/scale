import { Router } from "express";
import * as ctrl from "../controllers/hr-alerts.controller";

const router = Router();

router.get("/:agencyId", ctrl.getAlerts);
router.post("/:agencyId/dismiss", ctrl.dismiss);

export default router;
