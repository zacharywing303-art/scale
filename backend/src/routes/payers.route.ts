import { Router } from "express";
import * as payersController from "../controllers/payers.controller";

const router = Router();

router.get("/agency/:agencyId", payersController.getPayersForAgency);
router.post("/", payersController.createPayer);
router.patch("/:id", payersController.updatePayer);
router.delete("/:id", payersController.deletePayer);

export default router;
