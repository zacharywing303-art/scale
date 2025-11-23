import { Router } from "express";
import * as programsController from "../controllers/programs.controller";

const router = Router();

router.get("/agency/:agencyId", programsController.getProgramsForAgency);
router.post("/", programsController.createProgram);
router.patch("/:id", programsController.updateProgram);
router.delete("/:id", programsController.deleteProgram);

export default router;
