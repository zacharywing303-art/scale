import { Router } from "express";
import * as reviewController from "../controllers/review.controller";

const router = Router();

// EMPLOYEES
router.get("/employees/history/:agencyId", reviewController.getEmployeeHistory);
router.post("/employees/generate", reviewController.generateEmployeeReview);
router.get("/employees/:id", reviewController.getEmployeeReview);

// CLIENTS
router.get("/clients/history/:agencyId", reviewController.getClientHistory);
router.post("/clients/generate", reviewController.generateClientReview);
router.get("/clients/:id", reviewController.getClientReview);

export default router;
