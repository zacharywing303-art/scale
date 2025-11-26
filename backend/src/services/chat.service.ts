import prisma from "../lib/db";

/**
 * Normalize participants (User or MobileEmployee)
 */
export async function getParticipants(agencyCode: string, excludeId: string) {
  const users = await prisma.user.findMany({
    where: { agency: { code: agencyCode }, id: { not: excludeId } },
  });

  const employees = await prisma.mobileEmployee.findMany({
    where: { agencyCode, id: { not: excludeId } },
    include: { employee: true },
  });

  return [
    ...users.map((u) => ({
      id: u.id,
      participantId: u.id,
      participantType: "USER",
      displayName: u.name,
      userId: u.id,
    })),

    ...employees.map((e) => ({
      id: e.id,
      participantId: e.id,
      participantType: "MOBILE_EMPLOYEE",
      displayName: e.employee.name,
      mobileEmployeeId: e.id,
    })),
  ];
}

/**
 * Return all threads user is part of + unread count
 */
export async function getThreads(agencyCode: string, me: string) {
  const threads = await prisma.chatThread.findMany({
    where: {
      agencyCode,
      participants: { some: { participantId: me } },
    },
    include: {
      participants: true,
      messages: { orderBy: { createdAt: "asc" } },
      readReceipts: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return threads.map((t) => {
    const receipt = t.readReceipts.find((r) => r.participantId === me);
    const lastRead = receipt?.lastReadAt ? new Date(receipt.lastReadAt) : null;

    const unreadCount = t.messages.filter((m) =>
      lastRead ? new Date(m.createdAt) > lastRead : true
    ).length;

    return { ...t, unreadCount };
  });
}

/**
 * Get one thread
 */
export async function getThreadDetail(id: string, me: string) {
  const thread = await prisma.chatThread.findUnique({
    where: { id },
    include: {
      participants: true,
      messages: { orderBy: { createdAt: "asc" } },
      readReceipts: true,
    },
  });

  if (!thread) return null;

  // Mark as read automatically
  await prisma.chatReadReceipt.upsert({
    where: {
      threadId_participantId: { threadId: id, participantId: me },
    },
    update: { lastReadAt: new Date() },
    create: {
      threadId: id,
      participantId: me,
      lastReadAt: new Date(),
    },
  });

  return thread;
}

/**
 * Mark thread as read manually (PATCH)
 */
export async function markThreadRead(threadId: string, userId: string) {
  return prisma.chatReadReceipt.upsert({
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
}

/**
 * Unread count (cheap SQL)
 */
export async function getUnreadCountForUser(userId: string) {
  const receipts = await prisma.chatReadReceipt.findMany({
    where: { participantId: userId },
  });

  const threads = await prisma.chatThread.findMany({
    where: {
      participants: { some: { participantId: userId } },
    },
    include: { messages: true },
  });

  let count = 0;

  for (const thread of threads) {
    const r = receipts.find((x) => x.threadId === thread.id);
    const lastRead = r?.lastReadAt ? new Date(r.lastReadAt) : null;

    count += thread.messages.filter((m) =>
      lastRead ? new Date(m.createdAt) > lastRead : true
    ).length;
  }

  return count;
}
