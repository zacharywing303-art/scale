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
        lastPreview: t.messages[0]?.content ?? "",
        startedAt: t.startedAt,
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

// import { Request, Response } from "express";
// import {
//   getThread,
//   listThreadsForUser,
//   createDirectChat,
// } from "../services/chat.service";
// import prisma from "../lib/db";
// import { chatNsp } from "../sockets/chat.socket";

// export async function getMyThreads(req: Request, res: Response) {
//   try {
//     // Minimal auth extraction (replace with your real auth)
//     const agencyCode = (req.query.agencyCode as string) || "UNITY124";
//     const participantId = req.query.me as string; // current user id

//     if (!participantId) return res.status(400).json({ message: "Missing me" });

//     const data = await listThreadsForUser(agencyCode, participantId);
//     res.json(data);
//   } catch (e) {
//     res.status(500).json({ message: "Unable to list threads" });
//   }
// }

// export async function getThreadDetail(req: Request, res: Response) {
//   try {
//     const { id } = req.params;
//     const thread = await getThread(id);
//     if (!thread) return res.status(404).json({ message: "Not found" });
//     res.json(thread);
//   } catch {
//     res.status(500).json({ message: "Unable to fetch thread" });
//   }
// }

// export async function postDirectChat(req: Request, res: Response) {
//   try {
//     const { agencyCode, me, meName, meType, targetId, targetName, targetType } =
//       req.body;

//     if (
//       !agencyCode ||
//       !me ||
//       !meName ||
//       !meType ||
//       !targetId ||
//       !targetName ||
//       !targetType
//     ) {
//       return res.status(400).json({ message: "Missing fields" });
//     }

//     const thread = await createDirectChat(
//       agencyCode,
//       { id: me, displayName: meName, type: meType },
//       { id: targetId, displayName: targetName, type: targetType }
//     );

//     if (chatNsp) {
//       chatNsp.to(`user:${targetId}`).emit("chatStarted", {
//         threadId: thread.id,
//         status: thread.status,
//       });
//       // also notify the requester (optional)
//       chatNsp.to(`user:${me}`).emit("chatStarted", {
//         threadId: thread.id,
//         status: thread.status,
//       });
//     }

//     res.status(201).json(thread);
//   } catch {
//     res.status(500).json({ message: "Unable to create chat" });
//   }
// }
// export async function getPendingRequests(req: Request, res: Response) {
//   try {
//     const agencyCode = (req.query.agencyCode as string) || "UNITY124";

//     const threads = await prisma.chatThread.findMany({
//       where: { agencyCode, type: "systemAdmin", status: "pending" },
//       include: { participants: true },
//       orderBy: { startedAt: "desc" },
//     });

//     type ChatThreadWithParticipants = (typeof threads)[number];

//     const data = threads.map((t: ChatThreadWithParticipants) => ({
//       threadId: t.id,
//       from: t.participants.find(
//         (p: (typeof t.participants)[number]) =>
//           p.participantType !== "SYSTEM_ADMIN"
//       ) // requester
//         ? {
//             userId: t.participants.find(
//               (p: (typeof t.participants)[number]) =>
//                 p.participantType !== "SYSTEM_ADMIN"
//             )!.participantId,
//             displayName: t.participants.find(
//               (p: (typeof t.participants)[number]) =>
//                 p.participantType !== "SYSTEM_ADMIN"
//             )!.displayName,
//             participantType: t.participants.find(
//               (p: (typeof t.participants)[number]) =>
//                 p.participantType !== "SYSTEM_ADMIN"
//             )!.participantType,
//           }
//         : null,
//       startedAt: t.startedAt,
//     }));

//     res.json(data);
//   } catch (e) {
//     res.status(500).json({ message: "Unable to fetch pending requests" });
//   }
// }

// export async function getPendingCount(req: Request, res: Response) {
//   try {
//     const agencyCode = (req.query.agencyCode as string) || "UNITY124";

//     const count = await prisma.chatThread.count({
//       where: { agencyCode, type: "systemAdmin", status: "pending" },
//     });

//     res.json({ count });
//   } catch (e) {
//     res.status(500).json({ message: "Unable to fetch pending count" });
//   }
// }
