import { Router } from "express";
import * as ctl from "../controllers/client-links.controller";

const router = Router();

router.patch("/:clientId/program", ctl.setClientProgram);

router.post("/:clientId/payers", ctl.addClientPayer);
router.delete("/:clientId/payers/:payerId", ctl.removeClientPayer);

router.post("/:clientId/services", ctl.addClientService);
router.delete("/:clientId/services/:serviceId", ctl.removeClientService);

export default router;
