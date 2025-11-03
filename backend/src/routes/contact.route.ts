import { Router } from "express";
import * as contactController from "../controllers/contact.controller";

const router = Router();
router.post("/", contactController.createContact);
router.patch("/:id", contactController.updateContact);
router.delete("/:id", contactController.deleteContact);

export default router;
