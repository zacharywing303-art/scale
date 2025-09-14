import { Server, Socket } from "socket.io";
import prisma from "../lib/db";

export function registerChatNamespace(io: Server) {
  const chat = io.of("/chat");

  chat.on("connection", (socket: Socket) => {
    console.log("Chat connected:", socket.id);

    // Join thread room
    socket.on("joinThread", ({ threadId }) => {
      socket.join(threadId);
    });

    // Start or find a chat thread
    socket.on("startChat", async ({ me, other }) => {
      try {
        // 🔎 Find existing thread with BOTH me and other
        let thread = await prisma.chatThread.findFirst({
          where: {
            agencyCode: me.agencyCode,
            participants: {
              some: {
                participantId: me.id,
                participantType: me.participantType,
              },
            },
            AND: {
              participants: {
                some: {
                  participantId: other.id,
                  participantType: other.participantType,
                },
              },
            },
          },
          include: { participants: true, messages: true },
        });

        // If not found, create new
        if (!thread) {
          thread = await prisma.chatThread.create({
            data: {
              agencyCode: me.agencyCode,
              title: null,
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
                    participantId: other.id, // ✅ normalized
                    participantType: other.participantType,
                    displayName: other.displayName,
                    userId: other.participantType === "USER" ? other.id : null,
                    mobileEmployeeId:
                      other.participantType === "MOBILE_EMPLOYEE"
                        ? other.id
                        : null,
                  },
                ],
              },
            },
            include: { participants: true, messages: true },
          });
        }

        // Join the room so user gets real-time updates
        if (thread) {
          socket.join(thread.id);
        }

        // Send thread back to client
        socket.emit("chatStarted", thread);
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
            data: { threadId, senderId, senderType, content },
          });

          // Broadcast to everyone in the thread room
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
// import { Server, Socket } from "socket.io";
// import prisma from "../lib/db";

// export function registerChatNamespace(io: Server) {
//   const chat = io.of("/chat"); // namespace: /chat

//   chat.on("connection", (socket: Socket) => {
//     console.log("Chat connected:", socket.id);

//     // Join thread room
//     socket.on("joinThread", ({ threadId }) => {
//       socket.join(threadId);
//     });

//     // Start or find a chat thread
//     socket.on("startChat", async ({ me, other }) => {
//       try {
//         let thread = await prisma.chatThread.findFirst({
//           where: {
//             agencyCode: me.agencyCode,
//             participants: {
//               some: {
//                 participantId: me.id,
//                 participantType: me.participantType,
//               },
//             },
//           },
//           include: { participants: true, messages: true },
//         });

//         // also check that BOTH me and other are present
//         if (
//           thread &&
//           !thread.participants.some(
//             (p) =>
//               p.participantId === other.participantId &&
//               p.participantType === other.participantType
//           )
//         ) {
//           thread = null;
//         }

//         // If not found, create one
//         if (!thread) {
//           thread = await prisma.chatThread.create({
//             data: {
//               agencyCode: me.agencyCode,
//               title: null, // ✅ schema requires title, pass null
//               participants: {
//                 create: [
//                   {
//                     participantId: me.id,
//                     participantType: me.participantType,
//                     displayName: me.name,
//                     userId: me.participantType === "USER" ? me.id : null,
//                     mobileEmployeeId:
//                       me.participantType === "MOBILE_EMPLOYEE" ? me.id : null,
//                   },
//                   {
//                     participantId: other.participantId,
//                     participantType: other.participantType,
//                     displayName: other.displayName,
//                     userId:
//                       other.participantType === "USER"
//                         ? other.participantId
//                         : null,
//                     mobileEmployeeId:
//                       other.participantType === "MOBILE_EMPLOYEE"
//                         ? other.participantId
//                         : null,
//                   },
//                 ],
//               },
//             },
//             include: {
//               participants: true,
//               messages: true,
//             },
//           });
//         }

//         // ✅ return the thread (existing or new)
//         socket.emit("chatStarted", thread);
//       } catch (err) {
//         console.error("Error starting chat:", err);
//         socket.emit("error", "Failed to start chat");
//       }
//     });

//     // Send message
//     socket.on(
//       "sendMessage",
//       async ({ threadId, content, senderId, senderType }) => {
//         try {
//           const message = await prisma.chatMessage.create({
//             data: {
//               threadId,
//               senderId,
//               senderType,
//               content,
//             },
//           });

//           // Notify everyone in the thread
//           chat.to(threadId).emit("newMessage", { threadId, message });
//         } catch (err) {
//           console.error("Error sending message:", err);
//           socket.emit("error", "Failed to send message");
//         }
//       }
//     );

//     socket.on("disconnect", () => {
//       console.log("Chat disconnected:", socket.id);
//     });
//   });
// }
