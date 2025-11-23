import prisma from "../lib/db";

export function createAuthorization(data: any) {
  const { clientIds = [], ...rest } = data;
  return prisma.authorization.create({
    data: {
      ...rest,
      assignedClients: {
        connect: clientIds.map((id: string) => ({ id })),
      },
    },
    include: { payer: true, service: true, assignedClients: true },
  });
}

export function updateAuthorization(id: string, data: any) {
  const { clientIds, ...rest } = data;
  return prisma.authorization.update({
    where: { id },
    data: {
      ...rest,
      ...(clientIds
        ? {
            assignedClients: {
              set: clientIds.map((cid: string) => ({ id: cid })),
            },
          }
        : {}),
    },
    include: { payer: true, service: true, assignedClients: true },
  });
}

export function deleteAuthorization(id: string) {
  return prisma.authorization.delete({ where: { id } });
}

export function getAuthsForClient(clientId: string) {
  return prisma.authorization.findMany({
    where: { assignedClients: { some: { id: clientId } } },
    include: { payer: true, service: true },
    orderBy: { startDate: "desc" },
  });
}
