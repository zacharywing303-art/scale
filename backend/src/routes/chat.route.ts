import { Router } from "express";
import {
  getMyThreads,
  getThreadDetail,
  postDirectChat,
} from "../controllers/chat.controller";

const router = Router();

router.get("/threads", getMyThreads);
router.get("/threads/:id", getThreadDetail);
router.post("/threads/direct", postDirectChat);

export default router;
