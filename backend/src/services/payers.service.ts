import prisma from "../lib/db";

export function createPayer(data: any) {
  return prisma.payer.create({ data });
}

export function updatePayer(id: string, data: any) {
  return prisma.payer.update({ where: { id }, data });
}

export function deletePayer(id: string) {
  return prisma.payer.delete({ where: { id } });
}

export function getPayerById(id: string) {
  return prisma.payer.findUnique({ where: { id } });
}

export async function getPayersForAgency(agencyId: string) {
  const payers = await prisma.payer.findMany({
    where: { assignedClients: { some: { agencyID: agencyId } } },
  });
  return payers; // frontend dedupes by payerName
}
