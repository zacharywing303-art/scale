import { Server, Socket } from "socket.io";
import prisma from "../lib/db";

export function registerChatNamespace(io: Server) {
  const chat = io.of("/chat"); // namespace: /chat

  chat.on("connection", (socket: Socket) => {
    console.log("Chat connected:", socket.id);

    // Join thread room
    socket.on("joinThread", ({ threadId }) => {
      socket.join(threadId);
    });

    // Start or find a chat thread
    socket.on("startChat", async ({ me, other }) => {
      try {
        let thread = await prisma.chatThread.findFirst({
          where: {
            agencyCode: me.agencyCode,
            participants: {
              every: {
                OR: [
                  {
                    participantId: me.id,
                    participantType: me.participantType,
                  },
                  {
                    participantId: other.participantId,
                    participantType: other.participantType,
                  },
                ],
              },
            },
          },
        });

        if (!thread) {
          thread = await prisma.chatThread.create({
            data: {
              agencyCode: me.agencyCode,
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
                    participantId: other.participantId,
                    participantType: other.participantType,
                    displayName: other.displayName,
                    userId:
                      other.participantType === "USER"
                        ? other.participantId
                        : null,
                    mobileEmployeeId:
                      other.participantType === "MOBILE_EMPLOYEE"
                        ? other.participantId
                        : null,
                  },
                ],
              },
            },
          });
        }

        socket.emit("chatStarted", { threadId: thread.id });
      } catch (err) {
        console.error("Error starting chat:", err);
        socket.emit("error", "Failed to start chat");
      }
    });

    // Send message
    socket.on(
      "sendMessage",
      async ({ threadId, content, senderId, senderType }) => {
        try {
          const message = await prisma.chatMessage.create({
            data: {
              threadId,
              senderId, // <-- pass real user id from client instead of socket.id
              senderType,
              content,
            },
          });

          chat.to(threadId).emit("newMessage", { threadId, message });
        } catch (err) {
          console.error("Error sending message:", err);
          socket.emit("error", "Failed to send message");
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Chat disconnected:", socket.id);
    });
  });
}

// import { Server, Socket, Namespace } from "socket.io";
// import prisma from "../lib/db";

// type AuthedSocket = Socket & {
//   data: {
//     userId?: string;
//     role?: "SYSTEM_ADMIN" | "AGENCY_ADMIN" | "AGENCY_USER";
//     participantType?: "USER" | "MOBILE_EMPLOYEE" | "SYSTEM_ADMIN";
//     displayName?: string;
//     agencyCode?: string;
//   };
// };

// // export namespace pointer so controllers can emit events (used in direct chat)
// export let chatNsp: Namespace | null = null;

// export function registerChatNamespace(io: Server) {
//   const nsp = io.of("/chat");
//   chatNsp = nsp; // <-- expose namespace

//   // Middleware for auth (allow SYSTEM_ADMIN without agencyCode)
//   nsp.use((socket: AuthedSocket, next) => {
//     const { userId, role, participantType, displayName, agencyCode } =
//       socket.handshake.auth ?? {};

//     // Allow SYSTEM_ADMIN to connect without agencyCode, require agencyCode for agency users
//     if (
//       !userId ||
//       !participantType ||
//       !displayName ||
//       (role !== "SYSTEM_ADMIN" && !agencyCode)
//     ) {
//       return next(new Error("Missing auth info"));
//     }

//     socket.data.userId = userId;
//     socket.data.role = role;
//     socket.data.participantType = participantType;
//     socket.data.displayName = displayName;
//     socket.data.agencyCode = agencyCode;

//     socket.join(`user:${userId}`);

//     // Global room for system admins (they are app-wide)
//     if (role === "SYSTEM_ADMIN") {
//       socket.join("systemAdmins");
//     } else if (agencyCode) {
//       // optionally keep per-agency admin room if you ever use it
//       socket.join(`agency:${agencyCode}:systemAdmins`);
//     }

//     next();
//   });

//   nsp.on("connection", (socket: AuthedSocket) => {
//     const { userId, displayName, participantType, agencyCode, role } =
//       socket.data;

//     const joinThreadRoom = (threadId: string) => {
//       socket.join(`thread:${threadId}`);
//     };

//     // ---- Start a chat ----
//     socket.on(
//       "startChat",
//       async (payload: {
//         type: "user" | "systemAdmin";
//         targetId?: string;
//         targetDisplayName?: string;
//         targetParticipantType?: "USER" | "MOBILE_EMPLOYEE";
//       }) => {
//         try {
//           if (!userId || !displayName || !participantType) return;

//           // systemAdmin => pending + notify global systemAdmins. user => active (direct)
//           const status: "pending" | "active" =
//             payload.type === "systemAdmin" ? "pending" : "active";

//           const thread = await prisma.chatThread.create({
//             data: {
//               agencyCode: agencyCode ?? "UNKNOWN",
//               type: payload.type,
//               status,
//               startedAt: new Date(),
//               participants: {
//                 create: [
//                   {
//                     participantId: userId,
//                     participantType,
//                     displayName,
//                   },
//                   ...(payload.type === "user" && payload.targetId
//                     ? [
//                         {
//                           participantId: payload.targetId,
//                           participantType: payload.targetParticipantType!,
//                           displayName: payload.targetDisplayName ?? "Member",
//                         },
//                       ]
//                     : []),
//                 ],
//               },
//             },
//             include: { participants: true },
//           });

//           // ensure requester joins thread room
//           joinThreadRoom(thread.id);

//           if (payload.type === "systemAdmin") {
//             // Emit to global system admins
//             nsp.to("systemAdmins").emit("chatRequest", {
//               threadId: thread.id,
//               from: { userId, displayName, participantType },
//               startedAt: thread.startedAt,
//             });
//           } else {
//             // for a direct user->user chat, tell the target user if they are connected
//             if (payload.targetId && chatNsp) {
//               chatNsp.to(`user:${payload.targetId}`).emit("chatStarted", {
//                 threadId: thread.id,
//                 status: thread.status,
//               });
//             }
//           }

//           socket.emit("chatStarted", {
//             threadId: thread.id,
//             status: thread.status,
//           });
//         } catch (e) {
//           console.error(e);
//           socket.emit("error", { message: "Failed to start chat" });
//         }
//       }
//     );

//     // ---- Accept a pending chat (unchanged / correct) ----
//     socket.on("acceptChat", async (payload: { threadId: string }) => {
//       try {
//         if (role !== "SYSTEM_ADMIN") return;

//         const thread = await prisma.chatThread.update({
//           where: { id: payload.threadId },
//           data: {
//             status: "active",
//             participants: {
//               upsert: [
//                 {
//                   where: {
//                     threadId_participantId: {
//                       threadId: payload.threadId,
//                       participantId: userId!,
//                     },
//                   },
//                   create: {
//                     participantId: userId!,
//                     participantType: "SYSTEM_ADMIN",
//                     displayName: displayName!,
//                   },
//                   update: {},
//                 },
//               ],
//             },
//           },
//           include: { participants: true },
//         });

//         // join the server socket to the room, notify thread
//         joinThreadRoom(thread.id);
//         nsp.to(`thread:${thread.id}`).emit("chatAccepted", {
//           threadId: thread.id,
//           admin: { userId, displayName },
//           participants: thread.participants,
//         });
//       } catch (e) {
//         console.error(e);
//         socket.emit("error", { message: "Failed to accept chat" });
//       }
//     });

//     // ---- Send a message ----
//     socket.on(
//       "sendMessage",
//       async (payload: {
//         threadId: string;
//         content: string;
//         senderType?: string;
//       }) => {
//         try {
//           const msg = await prisma.chatMessage.create({
//             data: {
//               threadId: payload.threadId,
//               senderId: userId!,
//               senderType: participantType!,
//               content: payload.content,
//             },
//           });

//           nsp.to(`thread:${payload.threadId}`).emit("newMessage", {
//             threadId: payload.threadId,
//             message: {
//               id: msg.id,
//               senderId: msg.senderId,
//               content: msg.content,
//               createdAt: msg.createdAt,
//               senderName: displayName,
//               senderType: participantType,
//             },
//           });
//         } catch (e) {
//           console.error(e);
//           socket.emit("error", { message: "Failed to send message" });
//         }
//       }
//     );

//     // ---- Join a thread (emit full thread back to the requester) ----
//     socket.on("joinThread", async ({ threadId }: { threadId: string }) => {
//       try {
//         joinThreadRoom(threadId);

//         const thread = await prisma.chatThread.findUnique({
//           where: { id: threadId },
//           include: {
//             participants: true,
//             messages: { orderBy: { createdAt: "asc" } },
//           },
//         });

//         // emit the thread object to this socket so the client can populate history
//         socket.emit("joinedThread", thread ?? { id: threadId });
//       } catch (e) {
//         console.error(e);
//         socket.emit("error", { message: "Failed to join thread" });
//       }
//     });

//     // ---- End chat ----
//     socket.on("endChat", async ({ threadId }: { threadId: string }) => {
//       try {
//         const thread = await prisma.chatThread.update({
//           where: { id: threadId },
//           data: { status: "closed", endedAt: new Date() },
//         });

//         nsp
//           .to(`thread:${thread.id}`)
//           .emit("chatEnded", { threadId: thread.id });
//       } catch (e) {
//         console.error(e);
//         socket.emit("error", { message: "Failed to end chat" });
//       }
//     });

//     // ---- Cleanup on disconnect ----
//     socket.on("disconnect", () => {
//       socket.removeAllListeners();
//       for (const room of socket.rooms) {
//         if (room !== socket.id) socket.leave(room);
//       }
//     });
//   });
// }
