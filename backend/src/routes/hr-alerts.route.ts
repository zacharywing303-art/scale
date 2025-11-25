import { Router } from "express";
import * as hrAlertController from "../controllers/hr-alerts.controller";

const router = Router();

router.get("/:agencyId", hrAlertController.getHRAlerts);

export default router;
