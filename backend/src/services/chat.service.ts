import prisma from "../lib/db";

export async function listThreadsForUser(
  agencyCode: string,
  participantId: string
) {
  // Returns threads where the user participates
  const threads = await prisma.chatThread.findMany({
    where: { agencyCode, participants: { some: { participantId } } },
    orderBy: { startedAt: "desc" },
    include: {
      participants: true,
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1, // for preview
      },
    },
  });

  // Shape for inbox list
  return threads.map((t) => ({
    id: t.id,
    title:
      t.title ??
      (t.type === "systemAdmin" ? "System Admin Chat" : "Direct Chat"),
    status: t.status,
    lastPreview: t.messages[0]?.content ?? "",
    startedAt: t.startedAt,
  }));
}

export async function getThread(threadId: string) {
  return prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      participants: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function createDirectChat(
  agencyCode: string,
  requester: {
    id: string;
    displayName: string;
    type: "USER" | "MOBILE_EMPLOYEE";
  },
  target: { id: string; displayName: string; type: "USER" | "MOBILE_EMPLOYEE" }
) {
  const thread = await prisma.chatThread.create({
    data: {
      agencyCode,
      type: "user",
      status: "active",
      participants: {
        create: [
          {
            participantId: requester.id,
            participantType: requester.type,
            displayName: requester.displayName,
          },
          {
            participantId: target.id,
            participantType: target.type,
            displayName: target.displayName,
          },
        ],
      },
    },
  });

  return thread;
}
