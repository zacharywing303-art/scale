import prisma from "../lib/db";

/**
 * Unified participant identity:
 *  - USER → participantId = user.id
 *  - MOBILE_EMPLOYEE → participantId = employee.id (NOT mobileEmployee.id)
 */
export async function getParticipants(agencyCode: string, excludeId: string) {
  const users = await prisma.user.findMany({
    where: { agency: { code: agencyCode }, id: { not: excludeId } },
  });

  const employees = await prisma.mobileEmployee.findMany({
    where: { agencyCode },
    include: { employee: true },
  });

  // create a set to avoid double identities (user + mobile employee)
  const identityMap = new Map<string, any>();

  // add users first (they override mobile identity)
  users.forEach((u) => {
    identityMap.set(u.id, {
      id: u.id,
      participantId: u.id,
      participantType: "USER",
      displayName: u.name,
      userId: u.id,
      mobileEmployeeId: null,
    });
  });

  // now append employees who do NOT have a user counterpart
  employees.forEach((e) => {
    const pid = e.employeeID; // unified identity

    if (pid === excludeId) return;

    if (!identityMap.has(pid)) {
      identityMap.set(pid, {
        id: pid,
        participantId: pid,
        participantType: "MOBILE_EMPLOYEE",
        displayName: e.employee.name,
        userId: null,
        mobileEmployeeId: e.id,
      });
    }
  });

  return Array.from(identityMap.values());
}

/**
 * List threads + computed unread count.
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
 * Get full thread + auto mark read.
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

  await prisma.chatReadReceipt.upsert({
    where: { threadId_participantId: { threadId: id, participantId: me } },
    update: { lastReadAt: new Date() },
    create: { threadId: id, participantId: me, lastReadAt: new Date() },
  });

  return thread;
}

/**
 * Manual marking read.
 */
export async function markThreadRead(threadId: string, userId: string) {
  return prisma.chatReadReceipt.upsert({
    where: { threadId_participantId: { threadId, participantId: userId } },
    update: { lastReadAt: new Date() },
    create: { threadId, participantId: userId, lastReadAt: new Date() },
  });
}
