import { Router } from "express";
import * as roleController from "../controllers/role.controller";

const router = Router();

// Role routes
router.post("/", roleController.createRole);
router.get("/", roleController.getRoles);
router.get("/:id", roleController.getRoleById);
router.patch("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);
router.post("/permissions/", roleController.createPermission);
router.get("/permissions/", roleController.getPermissions);
router.get("/permissions/:id", roleController.getPermissionById);
router.patch("/permissions/:id", roleController.updatePermission);
router.delete("/permissions/:id", roleController.deletePermission);

export default router;
