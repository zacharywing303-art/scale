import { Router } from "express";
import { previewPayroll, runPayroll } from "../controllers/payroll.controller";

const router = Router();

router.get("/preview", previewPayroll);
router.post("/run", runPayroll);

export default router;
