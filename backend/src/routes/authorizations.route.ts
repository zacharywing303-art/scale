import { Router } from "express";
import * as authController from "../controllers/authorizations.controller";

const router = Router();

router.get("/client/:clientId", authController.getAuthsForClient);
router.post("/", authController.createAuthorization);
router.patch("/:id", authController.updateAuthorization);
router.delete("/:id", authController.deleteAuthorization);

export default router;
