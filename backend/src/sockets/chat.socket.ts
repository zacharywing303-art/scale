import { Server, Socket } from "socket.io";
import prisma from "../lib/db";

export function registerChatNamespace(io: Server) {
  const chat = io.of("/chat");

  chat.on("connection", (socket: Socket) => {
    const auth = socket.handshake.auth;
    const meId = auth.userId; // unified ID (EmployeeID or UserID)
    const meType = auth.participantType;
    const agencyCode = auth.agencyCode;

    socket.on("joinThread", ({ threadId }) => {
      socket.join(threadId);
    });

    /**
     * START CHAT:
     * - Supports 1-on-1 or group chat
     * - participantId is NOW unified across mobile + web identities
     */
    socket.on("startChat", async ({ me, other, group }, ack) => {
      try {
        let participants = [];

        if (Array.isArray(group) && group.length > 0) {
          participants = group;
        } else {
          participants = [me, other];
        }

        // Convert to deterministic group identity keys
        const participantKeys = participants
          .map((p) => `${p.participantType}:${p.participantId}`)
          .sort();

        // Look for existing identical thread
        const existingThreads = await prisma.chatThread.findMany({
          where: {
            agencyCode,
            participants: { some: { participantId: me.participantId } },
          },
          include: { participants: true },
        });

        let existing = existingThreads.find((t) => {
          const ids = t.participants
            .map((p) => `${p.participantType}:${p.participantId}`)
            .sort();
          return JSON.stringify(ids) === JSON.stringify(participantKeys);
        });

        let thread;

        if (existing) {
          thread = await prisma.chatThread.findUnique({
            where: { id: existing.id },
            include: {
              participants: true,
              messages: { orderBy: { createdAt: "asc" } },
            },
          });
        } else {
          thread = await prisma.chatThread.create({
            data: {
              title:
                participants.length === 2
                  ? `Chat with ${participants[1].displayName}`
                  : "Group Chat",
              agencyCode,
              participants: {
                create: participants.map((p) => ({
                  participantId: p.participantId,
                  participantType: p.participantType,
                  displayName: p.displayName,
                  userId: p.participantType === "USER" ? p.participantId : null,
                  mobileEmployeeId:
                    p.participantType === "MOBILE_EMPLOYEE"
                      ? p.mobileEmployeeId
                      : null,
                })),
              },
            },
            include: {
              participants: true,
              messages: true,
            },
          });
        }

        socket.join(thread.id);

        // send immediate ACK
        ack?.({ success: true, thread });

        // 🔥 IMPORTANT: notify others so frontend resolves properly
        chat.to(thread.id).emit("chatStarted", thread);

        // update ordering for participants
        chat.to(thread.id).emit("threadUpdated", {
          threadId: thread.id,
          lastMessage: thread.messages[thread.messages.length - 1] ?? null,
        });
      } catch (err) {
        console.error("StartChat error:", err);
        ack?.({ error: "Failed to start chat" });
      }
    });

    /**
     * SEND MESSAGE
     */
    socket.on(
      "sendMessage",
      async ({ threadId, content, senderId, senderType }, ack) => {
        try {
          const message = await prisma.chatMessage.create({
            data: { threadId, content, senderId, senderType },
          });

          await prisma.chatThread.update({
            where: { id: threadId },
            data: { updatedAt: new Date() },
          });

          chat.to(threadId).emit("newMessage", { threadId, message });

          ack?.({ success: true });
        } catch (err) {
          ack?.({ error: "Failed to send message" });
        }
      }
    );

    socket.on("readThread", async ({ threadId, userId }) => {
      await prisma.chatReadReceipt.upsert({
        where: {
          threadId_participantId: { threadId, participantId: userId },
        },
        update: { lastReadAt: new Date() },
        create: {
          threadId,
          participantId: userId,
          lastReadAt: new Date(),
        },
      });
    });

    socket.on("disconnect", () => {});
  });
}
