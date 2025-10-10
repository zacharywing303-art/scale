import { Server, Socket } from "socket.io";
import prisma from "../lib/db";

const lastThreadStart: Record<string, number> = Object.create(null);
const lastMessageSent: Record<string, number> = Object.create(null);

export function registerChatNamespace(io: Server) {
  const chat = io.of("/chat");

  chat.on("connection", (socket: Socket) => {
    console.log("Chat connected:", socket.id);

    // Join thread room
    socket.on("joinThread", ({ threadId }) => {
      socket.join(threadId);
    });

    // Start or find a chat thread
    socket.on("startChat", async ({ me, other }, ack) => {
      const participantKey = `${me.participantType}:${me.id}`;
      const now = Date.now();
      const last = lastThreadStart[participantKey] ?? 0;

      console.log("startChat throttle", participantKey, now - last);

      if (now - last < 5000) {
        const msg = "Please wait 5 seconds before starting another chat.";
        return ack?.({ error: msg });
      }
      lastThreadStart[participantKey] = now;

      try {
        // 🔍 First, find existing thread
        let thread = await prisma.chatThread.findFirst({
          where: {
            agencyCode: me.agencyCode,
            AND: [
              {
                participants: {
                  some: {
                    participantId: me.id,
                    participantType: me.participantType,
                  },
                },
              },
              {
                participants: {
                  some: {
                    participantId: other.id,
                    participantType: other.participantType,
                  },
                },
              },
            ],
          },
          include: {
            participants: true,
            messages: { orderBy: { createdAt: "asc" } },
          },
        });

        let isNew = false;

        if (!thread) {
          isNew = true;
          // ✅ Use transaction to avoid race duplicates
          thread = await prisma.$transaction(async (tx) => {
            const t = await tx.chatThread.create({
              data: {
                agencyCode: me.agencyCode,
                title: `Chat with ${other.displayName}`,
                participants: {
                  create: [
                    {
                      participantId: me.id,
                      participantType: me.participantType,
                      displayName: me.name,
                      userId: me.participantType === "USER" ? me.id : null,
                      mobileEmployeeId:
                        me.participantType === "MOBILE_EMPLOYEE" ? me.id : null,
                    },
                    {
                      participantId: other.id,
                      participantType: other.participantType,
                      displayName: other.displayName,
                      userId:
                        other.participantType === "USER" ? other.id : null,
                      mobileEmployeeId:
                        other.participantType === "MOBILE_EMPLOYEE"
                          ? other.id
                          : null,
                    },
                  ],
                },
              },
            });

            return tx.chatThread.findUnique({
              where: { id: t.id },
              include: {
                participants: true,
                messages: { orderBy: { createdAt: "asc" } },
              },
            });
          });
        }

        if (thread) {
          socket.join(thread.id);

          // ✅ Always acknowledge with the thread itself
          ack?.({ success: true, thread, isNew });

          console.log(
            `Chat ${isNew ? "created" : "found"} between ${me.id} and ${
              other.id
            }`
          );
        } else {
          ack?.({ error: "Failed to start chat" });
        }
      } catch (err) {
        console.error("Error starting chat:", err);
        ack?.({ error: "Failed to start chat" });
      }
    });

    // Send message
    socket.on(
      "sendMessage",
      async ({ threadId, content, senderId, senderType }, ack) => {
        const msgKey = `${senderType}:${senderId}`;
        const now = Date.now();
        const last = lastMessageSent[msgKey] ?? 0;

        console.log("sendMessage throttle", msgKey, now - last);

        if (now - last < 3000) {
          const msg = "You are sending messages too quickly. Please wait.";
          return ack?.({ error: msg });
        }
        lastMessageSent[msgKey] = now;

        try {
          // ✅ Create the message
          const message = await prisma.chatMessage.create({
            data: { threadId, senderId, senderType, content },
          });

          // ✅ Update thread’s "updatedAt" timestamp
          await prisma.chatThread.update({
            where: { id: threadId },
            data: { updatedAt: new Date() },
          });

          // ✅ Broadcast to everyone in the thread room
          chat.to(threadId).emit("newMessage", { threadId, message });

          // ✅ Also emit a lightweight event for thread list updates (optional)
          chat.emit("threadUpdated", { threadId, lastMessage: message });

          ack?.({ success: true });
        } catch (err) {
          console.error("Error sending message:", err);
          ack?.({ error: "Failed to send message" });
          socket.emit("error", "Failed to send message");
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Chat disconnected:", socket.id);
    });
  });
}
