import { Router } from "express";
import { previewPayroll } from "../controllers/payroll.controller";

const router = Router();

router.get("/preview", previewPayroll);

export default router;
