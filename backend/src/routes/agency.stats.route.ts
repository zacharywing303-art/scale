import { Router } from "express";
import { systemStatsController } from "../controllers/agency.stats.controller";

const router = Router();
router.get("/stats", systemStatsController);

export default router;
