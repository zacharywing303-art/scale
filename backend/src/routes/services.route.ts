import { Router } from "express";
import * as serviceController from "../controllers/services.controller";

const router = Router();

router.get("/", serviceController.getServices);
router.get("/:id", serviceController.getService);
router.post("/", serviceController.createService);
router.patch("/:id", serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

export default router;
