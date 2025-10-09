import { Router } from "express";
import {
  fetchThreads,
  fetchThreadDetail,
  fetchParticipants,
  getUnreadCount,
} from "../controllers/chat.controller";

const router = Router();

router.get("/threads", fetchThreads);
router.get("/threads/:id", fetchThreadDetail);
router.get("/participants", fetchParticipants);
router.get("/unread_count", getUnreadCount);

export default router;
