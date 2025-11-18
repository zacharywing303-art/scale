import { Router } from "express";
import {
  getSuggestedPeriod,
  previewPayroll,
  runPayroll,
  listHistory,
  getHistory,
  approvePayroll,
  rejectPayroll,
  exportPayroll,
} from "../controllers/payroll.controller";

const router = Router();

// Suggested period based on PayrollSettings
router.get("/period/suggested", getSuggestedPeriod);

// Preview and run
router.get("/preview", previewPayroll);
router.post("/run", runPayroll);

// History + approvals
router.get("/history", listHistory);
router.get("/history/:id", getHistory);
router.post("/history/:id/approve", approvePayroll);
router.post("/history/:id/reject", rejectPayroll);

// Exports
router.get("/history/:id/export", exportPayroll);

export default router;
