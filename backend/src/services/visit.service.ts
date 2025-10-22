import prisma from "../lib/db";

// ✅ Get visits for a specific agency
export async function getVisitsByAgency(agencyId: string) {
  return prisma.visit.findMany({
    where: { agencyID: agencyId },
    include: {
      visitTasks: true,
      exceptions: true,
      history: true,
    },
    orderBy: { scheduledTimeIn: "desc" },
  });
}

// ✅ Get a single visit by ID
export async function getVisitById(visitId: number) {
  return prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      visitTasks: true,
      exceptions: true,
      history: true,
    },
  });
}

// ✅ Create visit
export async function createVisit(data: any) {
  return prisma.visit.create({
    data: {
      ...data,
      visitStatus: data.visitStatus || "Scheduled",
    },
  });
}

// ✅ Update visit
export async function updateVisit(id: number, data: any) {
  return prisma.visit.update({
    where: { id },
    data,
  });
}

// ✅ Delete visit
export async function deleteVisit(id: number) {
  return prisma.visit.delete({ where: { id } });
}
