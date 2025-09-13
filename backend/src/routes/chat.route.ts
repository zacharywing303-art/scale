import { Router } from "express";
import {
  fetchThreads,
  fetchThreadDetail,
  fetchParticipants,
} from "../controllers/chat.controller";

const router = Router();

router.get("/threads", fetchThreads);
router.get("/threads/:id", fetchThreadDetail);
router.get("/participants", fetchParticipants);

export default router;
