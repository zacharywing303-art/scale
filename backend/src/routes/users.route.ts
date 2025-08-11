import { Router } from "express";
import {
  getAllUsersController,
  getUserByIdController,
  getSystemAdminUsersController,
  getSystemAdminUsersByIdController,
  createSystemAdminUserController,
  deleteUserController,
  updateSystemAdminUserController,
} from "../controllers/users.controller";

const router = Router();

router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.get("/system-admin", getSystemAdminUsersController);
router.get("/system-admin/:id", getSystemAdminUsersByIdController);
router.post("/", createSystemAdminUserController);
router.delete("/:id", deleteUserController);
router.patch("/:id", updateSystemAdminUserController);

export default router;
