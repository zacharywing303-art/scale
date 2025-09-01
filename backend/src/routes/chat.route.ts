import { Router } from "express";
import {
  getMyThreads,
  getThreadDetail,
  postDirectChat,
  getPendingRequests,
  getPendingCount,
} from "../controllers/chat.controller";

const router = Router();

router.get("/threads", getMyThreads);
router.get("/threads/:id", getThreadDetail);
router.post("/threads/direct", postDirectChat);

router.get("/requests", getPendingRequests);
router.get("/pending-count", getPendingCount);

export default router;
