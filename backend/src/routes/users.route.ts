import { Router } from "express";
import {
  getAllUsersController,
  getUserByIdController,
  getSystemAdminUsersController,
  getSystemAdminUsersByIdController,
  createSystemAdminUserController,
  deleteUserController,
  updateSystemAdminUserController,
  createAgencyUserController,
} from "../controllers/users.controller";

const router = Router();

router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.get("/system-admin", getSystemAdminUsersController);
router.get("/system-admin/:id", getSystemAdminUsersByIdController);
router.post("/agency", createAgencyUserController);
router.post("/", createSystemAdminUserController);
router.delete("/:id", deleteUserController);
router.patch("/:id", updateSystemAdminUserController);

export default router;
