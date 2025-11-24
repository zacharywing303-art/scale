import { Router } from "express";
import { reviewMileage } from "../controllers/mileage-review.controller";

const router = Router();

router.get("/review", reviewMileage);

export default router;
