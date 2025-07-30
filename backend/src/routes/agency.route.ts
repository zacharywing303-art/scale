import { Router } from "express";
import {
  getAllAgenciesController,
  getAgencyByIdController,
  createAgencyController,
  updateAgencyController,
  deleteAgencyController,
} from "../controllers/agency.controller";

const router = Router();

router.get("/", getAllAgenciesController);
router.get("/:id", getAgencyByIdController);
router.post("/", createAgencyController);
router.put("/:id", updateAgencyController);
router.delete("/:id", deleteAgencyController);

console.log("✔ agency routes loaded");

export default router;
