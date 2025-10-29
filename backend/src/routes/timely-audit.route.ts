import { Router } from "express";
import * as timelyAuditController from "../controllers/timely-audit.controller";

const router = Router();

router.post("/", timelyAuditController.createAudit);
router.get("/agency/:agencyId", timelyAuditController.getAgencyAudits);
router.get("/:id", timelyAuditController.getAuditDetail);
router.patch("/:id/complete", timelyAuditController.markAuditComplete);
router.get("/:id/export", timelyAuditController.exportAuditReport);

export default router;
