import { Request, Response } from "express";
import {
  getThreads,
  getThreadDetail,
  getParticipants,
  getUnreadCountForUser,
  markThreadRead as serviceMarkThreadRead,
} from "../services/chat.service";

/**
 * GET /threads?agencyCode=...&me=...
 */
export async function fetchThreads(req: Request, res: Response) {
  try {
    const { agencyCode, me } = req.query;

    if (!agencyCode || !me) {
      return res
        .status(400)
        .json({ error: "Missing agencyCode or me in query parameters." });
    }

    const threads = await getThreads(String(agencyCode), String(me));
    res.json(threads);
  } catch (err) {
    console.error("fetchThreads error:", err);
    res.status(500).send("Failed to load threads");
  }
}

/**
 * GET /threads/:id?me=...
 */
export async function fetchThreadDetail(req: Request, res: Response) {
  try {
    const { me } = req.query;

    if (!me) {
      return res
        .status(400)
        .json({ error: "Missing me (participantId) in query parameters." });
    }

    const thread = await getThreadDetail(req.params.id, String(me));
    if (!thread) return res.status(404).send("Thread not found");

    res.json(thread);
  } catch (err) {
    console.error("fetchThreadDetail error:", err);
    res.status(500).send("Failed to load thread detail");
  }
}

/**
 * GET /participants?agencyCode=...&excludeId=...
 */
export async function fetchParticipants(req: Request, res: Response) {
  try {
    const { agencyCode, excludeId } = req.query;

    if (!agencyCode || !excludeId) {
      return res
        .status(400)
        .json({ error: "Missing agencyCode or excludeId query parameters." });
    }

    const participants = await getParticipants(
      String(agencyCode),
      String(excludeId)
    );

    res.json(participants);
  } catch (err) {
    console.error("fetchParticipants error:", err);
    res.status(500).send("Failed to load participants");
  }
}

/**
 * GET /unread_count?userId=...
 */
export async function getUnreadCount(req: Request, res: Response) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const count = await getUnreadCountForUser(String(userId));
    res.json({ count });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    res.status(500).json({ error: "Failed to get unread count" });
  }
}

/**
 * PATCH /threads/:id/read
 */
export async function markThreadReadController(req: Request, res: Response) {
  try {
    const { participantId } = req.body;
    const { id } = req.params;

    if (!participantId || !id) {
      return res
        .status(400)
        .json({ error: "Missing participantId or threadId" });
    }

    const updated = await serviceMarkThreadRead(id, participantId);
    res.json(updated);
  } catch (err) {
    console.error("markThreadRead error:", err);
    res.status(500).json({ error: "Failed to mark thread as read" });
  }
}
