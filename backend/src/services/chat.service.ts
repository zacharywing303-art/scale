import prisma from "../lib/db";

// Fetch threads for a user
export async function getThreads(
  agencyCode: string,
  me: string,
  meType: string
) {
  return prisma.chatThread.findMany({
    where: {
      agencyCode,
      participants: {
        some: { participantId: me, participantType: meType as any },
      },
    },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { startedAt: "desc" },
  });
}

// Fetch single thread detail
export async function getThreadDetail(id: string) {
  return prisma.chatThread.findUnique({
    where: { id },
    include: {
      participants: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

// Get participants for new chat
export async function getParticipants(
  agencyCode: string,
  excludeId: string,
  participantType?: string
) {
  let participants: any[] = [];

  if (!participantType || participantType === "USER") {
    const users = await prisma.user.findMany({
      where: { agency: { code: agencyCode }, id: { not: excludeId } },
    });
    participants.push(
      ...users.map((u) => ({
        id: u.id,
        participantId: u.id,
        participantType: "USER",
        displayName: u.name,
        userId: u.id,
      }))
    );
  }

  if (!participantType || participantType === "MOBILE_EMPLOYEE") {
    const employees = await prisma.mobileEmployee.findMany({
      where: { agencyCode, id: { not: excludeId } },
      include: { employee: true },
    });
    participants.push(
      ...employees.map((e) => ({
        id: e.id,
        participantId: e.id,
        participantType: "MOBILE_EMPLOYEE",
        displayName: e.employee.name,
        mobileEmployeeId: e.id,
      }))
    );
  }

  return participants;
}

// import prisma from "../lib/db";

// export async function listThreadsForUser(
//   agencyCode: string,
//   participantId: string
// ) {
//   // Returns threads where the user participates
//   const threads = await prisma.chatThread.findMany({
//     where: { agencyCode, participants: { some: { participantId } } },
//     orderBy: { startedAt: "desc" },
//     include: {
//       participants: true,
//       messages: {
//         orderBy: { createdAt: "asc" },
//         take: 1, // for preview
//       },
//     },
//   });

//   // Shape for inbox list
//   return threads.map((t: (typeof threads)[number]) => ({
//     id: t.id,
//     title:
//       t.title ??
//       (t.type === "systemAdmin" ? "System Admin Chat" : "Direct Chat"),
//     status: t.status,
//     lastPreview: t.messages[0]?.content ?? "",
//     startedAt: t.startedAt,
//   }));
// }

// export async function getThread(threadId: string) {
//   return prisma.chatThread.findUnique({
//     where: { id: threadId },
//     include: {
//       participants: true,
//       messages: { orderBy: { createdAt: "asc" } },
//     },
//   });
// }

// export async function createDirectChat(
//   agencyCode: string,
//   requester: {
//     id: string;
//     displayName: string;
//     type: "USER" | "MOBILE_EMPLOYEE";
//   },
//   target: { id: string; displayName: string; type: "USER" | "MOBILE_EMPLOYEE" }
// ) {
//   const thread = await prisma.chatThread.create({
//     data: {
//       agencyCode,
//       type: "user",
//       status: "active",
//       participants: {
//         create: [
//           {
//             participantId: requester.id,
//             participantType: requester.type,
//             displayName: requester.displayName,
//           },
//           {
//             participantId: target.id,
//             participantType: target.type,
//             displayName: target.displayName,
//           },
//         ],
//       },
//     },
//   });

//   return thread;
// }
