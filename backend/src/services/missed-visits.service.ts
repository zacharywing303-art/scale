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
 * When rescheduling, we DELETE the MissedVisit row, subject to change.
 * We may use logic to keep an audit, mark rescheduled=true and link replacement schedule id instead.
 */
export async function resolveMissedVisit(missedVisitId: string) {
  return prisma.missedVisit.delete({ where: { id: missedVisitId } });
}
