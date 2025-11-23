import { Router } from "express";
import * as billingController from "../controllers/billing.controller";

const router = Router();

router.get("/review", billingController.reviewBilling);
router.get("/export", billingController.exportBilling);

export default router;
