import { Request, Response } from "express";
import {
  getThread,
  listThreadsForUser,
  createDirectChat,
} from "../services/chat.service";

export async function getMyThreads(req: Request, res: Response) {
  try {
    // Minimal auth extraction (replace with your real auth)
    const agencyCode = (req.query.agencyCode as string) || "UNITY124";
    const participantId = req.query.me as string; // current user id

    if (!participantId) return res.status(400).json({ message: "Missing me" });

    const data = await listThreadsForUser(agencyCode, participantId);
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: "Unable to list threads" });
  }
}

export async function getThreadDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const thread = await getThread(id);
    if (!thread) return res.status(404).json({ message: "Not found" });
    res.json(thread);
  } catch {
    res.status(500).json({ message: "Unable to fetch thread" });
  }
}

export async function postDirectChat(req: Request, res: Response) {
  try {
    const { agencyCode, me, meName, meType, targetId, targetName, targetType } =
      req.body;

    if (
      !agencyCode ||
      !me ||
      !meName ||
      !meType ||
      !targetId ||
      !targetName ||
      !targetType
    ) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const thread = await createDirectChat(
      agencyCode,
      { id: me, displayName: meName, type: meType },
      { id: targetId, displayName: targetName, type: targetType }
    );

    res.status(201).json(thread);
  } catch {
    res.status(500).json({ message: "Unable to create chat" });
  }
}
