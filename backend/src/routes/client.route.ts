import { Router } from "express";
import * as clientController from "../controllers/client.controller";

const router = Router();

router.get("/", clientController.getClients);
router.get("/agency/:agencyId", clientController.getClientsByAgency);
router.get("/:id", clientController.getClient);
router.post("/", clientController.createClient);
router.patch("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

export default router;
