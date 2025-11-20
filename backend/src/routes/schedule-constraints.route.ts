import { Router } from "express";
import { checkConstraints } from "../controllers/schedule-constraints.controller";

const router = Router();

router.post("/", checkConstraints);

export default router;
