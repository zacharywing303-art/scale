import prisma from "../lib/db";

export function createProgram(data: any) {
  return prisma.program.create({ data });
}

export function updateProgram(id: string, data: any) {
  return prisma.program.update({ where: { id }, data });
}

export function deleteProgram(id: string) {
  return prisma.program.delete({ where: { id } });
}

export function getProgramById(id: string) {
  return prisma.program.findUnique({ where: { id } });
}

// ✅ list programs linked to agency clients
export async function getProgramsForAgency(agencyId: string) {
  const programs = await prisma.program.findMany({
    where: {
      clients: { some: { agencyID: agencyId } },
    },
  });

  return programs; // frontend will dedupe by name
}
