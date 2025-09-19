import { Request, Response } from "express";
import {
  getThreads,
  getThreadDetail,
  getParticipants,
} from "../services/chat.service";

export async function fetchThreads(req: Request, res: Response) {
  try {
    const { agencyCode, me, meType } = req.query;
    const threads = await getThreads(
      String(agencyCode),
      String(me),
      String(meType)
    );

    res.json(
      threads.map((t) => ({
        id: t.id,
        startedAt: t.startedAt,
        messages: t.messages,
        participants: t.participants.map((p) => ({
          participantId: p.participantId,
          displayName: p.displayName,
          participantType: p.participantType,
        })),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load threads");
  }
}

export async function fetchThreadDetail(req: Request, res: Response) {
  try {
    const thread = await getThreadDetail(req.params.id);
    if (!thread) return res.status(404).send("Not found");
    res.json(thread);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load thread detail");
  }
}

export async function fetchParticipants(req: Request, res: Response) {
  try {
    const { agencyCode, excludeId, participantType } = req.query;
    const participants = await getParticipants(
      String(agencyCode),
      String(excludeId),
      participantType as string
    );
    res.json(participants);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load participants");
  }
}
