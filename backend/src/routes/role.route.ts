import { Router } from "express";
import * as roleController from "../controllers/role.controller";

const router = Router();

// Role routes
router.post("/", roleController.createRole);
router.get("/", roleController.getRoles);
router.get("/:id", roleController.getRoleById);
router.patch("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);

export default router;
