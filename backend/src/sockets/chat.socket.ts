import { Server, Socket } from "socket.io";
import prisma from "../lib/db";

const lastThreadStart: Record<string, number> = {};
const lastMessageSent: Record<string, number> = {};

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
      const key = `${me.participantType}:${me.id}`;
      const now = Date.now();

      // ⏳ block if this participant started a thread in the last 5 seconds
      if (lastThreadStart[key] && now - lastThreadStart[key] < 5000) {
        const msg = "Please wait 5 seconds before starting another chat.";
        if (ack) return ack({ error: msg });
        return socket.emit("error", msg);
      }
      lastThreadStart[key] = now;

      try {
        const thread = await prisma.chatThread.findFirst({
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

        let finalThread = thread;

        if (!finalThread) {
          // ✅ Use a transaction to avoid race duplicates
          finalThread = await prisma.$transaction(async (tx) => {
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
            // Fetch the thread with participants and messages included
            return tx.chatThread.findUnique({
              where: { id: t.id },
              include: {
                participants: true,
                messages: { orderBy: { createdAt: "asc" } },
              },
            });
          });
        }

        if (finalThread) {
          socket.join(finalThread.id);
          // ✅ emit to the *room* so all members get one event
          chat.to(finalThread.id).emit("chatStarted", finalThread);

          // Acknowledge to caller so they don’t re-emit
          if (ack) ack({ success: true, threadId: finalThread.id });
        } else {
          if (ack) ack({ error: "Failed to start chat" });
          socket.emit("error", "Failed to start chat");
        }
      } catch (err) {
        console.error("Error starting chat:", err);
        if (ack) ack({ error: "Failed to start chat" });
        socket.emit("error", "Failed to start chat");
      }
    });

    // Send message
    socket.on(
      "sendMessage",
      async ({ threadId, content, senderId, senderType }, ack) => {
        const key = `${senderType}:${senderId}`;
        const now = Date.now();

        // ⏳ block if this participant sent a message in the last 3 seconds
        if (lastMessageSent[key] && now - lastMessageSent[key] < 3000) {
          const msg = "You are sending messages too quickly. Please wait.";
          if (ack) return ack({ error: msg });
          return socket.emit("error", msg);
        }
        lastMessageSent[key] = now;

        try {
          const message = await prisma.chatMessage.create({
            data: { threadId, senderId, senderType, content },
          });

          // Broadcast to everyone in the thread room
          chat.to(threadId).emit("newMessage", { threadId, message });
          if (ack) ack({ success: true });
        } catch (err) {
          console.error("Error sending message:", err);
          if (ack) ack({ error: "Failed to send message" });
          socket.emit("error", "Failed to send message");
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Chat disconnected:", socket.id);
    });
  });
}
