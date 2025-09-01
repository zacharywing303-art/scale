import prisma from "../lib/db";

export async function listMissedVisits(agencyID: string) {
  return prisma.missedVisit.findMany({
    where: {
      visit: { agencyID },
    },
    orderBy: { createdAt: "desc" },
    include: { visit: true },
  });
}

export async function deleteMissedVisit(id: string) {
  return prisma.missedVisit.delete({ where: { id } });
}

/**
 * Option A (per your spec): when rescheduling, we DELETE the MissedVisit row.
 * If you'd rather keep an audit, mark rescheduled=true and link replacement schedule id instead.
 */
export async function resolveMissedVisit(missedVisitId: string) {
  return prisma.missedVisit.delete({ where: { id: missedVisitId } });
}
