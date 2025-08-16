import { Server, Socket } from "socket.io";
import prisma from "../lib/db";

type AuthedSocket = Socket & {
  data: {
    userId?: string;
    role?: "SYSTEM_ADMIN" | "AGENCY_ADMIN" | "AGENCY_USER";
    participantType?: "USER" | "MOBILE_EMPLOYEE" | "SYSTEM_ADMIN";
    displayName?: string;
    agencyCode?: string;
  };
};

export function registerChatNamespace(io: Server) {
  const nsp = io.of("/chat");

  nsp.use((socket: AuthedSocket, next) => {
    // Minimal auth example:
    // Expect query params: userId, role, participantType, displayName, agencyCode
    const { userId, role, participantType, displayName, agencyCode } =
      socket.handshake.auth ?? {};

    if (!userId || !participantType || !displayName || !agencyCode) {
      return next(new Error("Missing auth info"));
    }

    socket.data.userId = userId;
    socket.data.role = role;
    socket.data.participantType = participantType;
    socket.data.displayName = displayName;
    socket.data.agencyCode = agencyCode;

    // Join a personal room to receive direct events
    socket.join(`user:${userId}`);

    // System admins also join an agency admin broadcast room
    if (role === "SYSTEM_ADMIN") {
      socket.join(`agency:${agencyCode}:systemAdmins`);
    }

    next();
  });

  nsp.on("connection", (socket: AuthedSocket) => {
    const { userId, displayName, participantType, agencyCode } = socket.data;

    // helper: join thread room
    const joinThreadRoom = (threadId: string) => {
      socket.join(`thread:${threadId}`);
    };

    // Client -> server: start chat (regular or system admin)
    socket.on(
      "startChat",
      async (payload: {
        type: "user" | "systemAdmin";
        targetId?: string; // user/mobile employee id for direct chat
        targetDisplayName?: string;
        targetParticipantType?: "USER" | "MOBILE_EMPLOYEE";
      }) => {
        try {
          if (!agencyCode || !userId || !displayName || !participantType)
            return;

          let status: "pending" | "active" = "active";
          if (payload.type === "systemAdmin") status = "pending";

          const thread = await prisma.chatThread.create({
            data: {
              agencyCode,
              type: payload.type === "systemAdmin" ? "systemAdmin" : "user",
              status,
              participants: {
                create: [
                  {
                    participantId: userId,
                    participantType: participantType as any,
                    displayName,
                  },
                  ...(payload.type === "user" && payload.targetId
                    ? [
                        {
                          participantId: payload.targetId,
                          participantType: payload.targetParticipantType as any,
                          displayName: payload.targetDisplayName ?? "Member",
                        },
                      ]
                    : []),
                ],
              },
            },
            include: { participants: true },
          });

          // Join this socket to the thread room
          joinThreadRoom(thread.id);

          if (payload.type === "systemAdmin") {
            // Broadcast a request to all System Admins for this agency
            nsp.to(`agency:${agencyCode}:systemAdmins`).emit("chatRequest", {
              threadId: thread.id,
              from: { userId, displayName, participantType },
              startedAt: thread.startedAt,
            });
          }

          socket.emit("chatStarted", {
            threadId: thread.id,
            status: thread.status,
          });
        } catch (e) {
          socket.emit("error", { message: "Failed to start chat" });
        }
      }
    );

    // System Admin -> server: accept chat
    socket.on("acceptChat", async (payload: { threadId: string }) => {
      try {
        if (socket.data.role !== "SYSTEM_ADMIN") return;

        const thread = await prisma.chatThread.update({
          where: { id: payload.threadId },
          data: {
            status: "active",
            participants: {
              create: {
                participantId: userId!,
                participantType: "SYSTEM_ADMIN",
                displayName: displayName!,
              },
            },
          },
          include: { participants: true },
        });

        // join room and notify participants
        joinThreadRoom(thread.id);
        nsp.to(`thread:${thread.id}`).emit("chatAccepted", {
          threadId: thread.id,
          admin: { userId, displayName },
        });
      } catch {
        socket.emit("error", { message: "Failed to accept chat" });
      }
    });

    // Client -> server: send message
    socket.on(
      "sendMessage",
      async (payload: { threadId: string; content: string }) => {
        try {
          const msg = await prisma.chatMessage.create({
            data: {
              threadId: payload.threadId,
              senderId: userId!,
              content: payload.content,
            },
          });
          nsp.to(`thread:${payload.threadId}`).emit("newMessage", {
            threadId: payload.threadId,
            message: {
              id: msg.id,
              senderId: msg.senderId,
              content: msg.content,
              createdAt: msg.createdAt,
              senderName: displayName,
            },
          });
        } catch {
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Client -> server: join thread room (when user opens a thread)
    socket.on("joinThread", async ({ threadId }: { threadId: string }) => {
      joinThreadRoom(threadId);
      socket.emit("joinedThread", { threadId });
    });

    // Client -> server: end chat
    socket.on("endChat", async (payload: { threadId: string }) => {
      try {
        const thread = await prisma.chatThread.update({
          where: { id: payload.threadId },
          data: { status: "closed", endedAt: new Date() },
        });
        nsp
          .to(`thread:${thread.id}`)
          .emit("chatEnded", { threadId: thread.id });
      } catch {
        socket.emit("error", { message: "Failed to end chat" });
      }
    });
  });
}
