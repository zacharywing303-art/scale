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
