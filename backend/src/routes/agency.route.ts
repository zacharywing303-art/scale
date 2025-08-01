import { Router } from "express";
import {
  getAllAgenciesController,
  getAgencyByIdController,
  createAgencyController,
  updateAgencyController,
  deleteAgencyController,
  updateAgencySettingsController,
} from "../controllers/agency.controller";

const router = Router();

router.get("/", getAllAgenciesController);
router.get("/:id", getAgencyByIdController);
router.post("/create_with_admin", createAgencyController);
router.put("/:id", updateAgencyController);
router.delete("/:id", deleteAgencyController);
router.patch("/:id/settings", updateAgencySettingsController);

console.log("✔ agency routes loaded");

export default router;
