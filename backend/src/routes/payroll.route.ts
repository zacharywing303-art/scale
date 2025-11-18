import { Router } from "express";
import * as payrollController from "../controllers/payroll.controller";

const router = Router();

// GET /api/payroll/preview?agencyId=...&periodFrom=...&periodTo=...&taskId=...
router.get("/preview", payrollController.getPayrollPreview);

// POST /api/payroll/run
router.post("/run", payrollController.runPayroll);

export default router;
