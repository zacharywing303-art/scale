import prisma from "../lib/db";

export async function getThreads(
  agencyCode: string,
  me: string,
  meType: string
) {
  // Fetch all threads the user participates in
  const threads = await prisma.chatThread.findMany({
    where: {
      agencyCode,
      participants: {
        some: { participantId: me, participantType: meType as any },
      },
    },
    include: {
      participants: true,
      messages: { orderBy: { createdAt: "asc" } }, // include all messages for unread calc
      _count: { select: { messages: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  // Add unread count per thread
  const threadsWithUnread = await Promise.all(
    threads.map(async (thread) => {
      // Find user's last read receipt for this thread
      const receipt = await prisma.chatReadReceipt.findUnique({
        where: {
          threadId_participantId: {
            threadId: thread.id,
            participantId: me,
          },
        },
      });

      // Count messages sent after the last read timestamp
      const unreadCount = thread.messages.filter(
        (m) => !receipt || new Date(m.createdAt) > new Date(receipt.lastReadAt)
      ).length;

      return { ...thread, unreadCount };
    })
  );

  return threadsWithUnread;
}

// Fetch single thread detail
export async function getThreadDetail(id: string) {
  return prisma.chatThread.findUnique({
    where: { id },
    include: {
      participants: true,
      messages: { orderBy: { updatedAt: "asc" } },
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

export async function getUnreadCountForUser(userId: string) {
  // Fetch all receipts for this user
  const receipts = await prisma.chatReadReceipt.findMany({
    where: { participantId: userId },
  });

  // Fetch all threads that include this user
  const threads = await prisma.chatThread.findMany({
    where: {
      participants: {
        some: { participantId: userId },
      },
    },
    include: {
      messages: true,
    },
  });

  let totalUnread = 0;

  for (const thread of threads) {
    const receipt = receipts.find(
      (r: (typeof receipts)[number]) => r.threadId === thread.id
    );
    const unreadInThread = thread.messages.filter(
      (m) => !receipt || new Date(m.createdAt) > new Date(receipt.lastReadAt)
    ).length;
    totalUnread += unreadInThread;
  }

  return totalUnread;
}
