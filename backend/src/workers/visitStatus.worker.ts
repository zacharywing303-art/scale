import cron from "node-cron";
import prisma from "../lib/db";
import { startOfDay, addDays, addMonths } from "date-fns";

/**
 * Runs every 5 minutes:
 * - If now >= scheduledTimeIn and callIn is null => Incomplete
 * - If callIn != null and callOut is null => InProcess
 * - If callOut != null => Verified
 */
cron.schedule("*/5 * * * *", async () => {
  const now = new Date();

  // Incomplete
  await prisma.visit.updateMany({
    where: {
      scheduledTimeIn: { lte: now },
      callIn: null,
      visitStatus: { not: "Incomplete" },
    },
    data: { visitStatus: "Incomplete" },
  });

  // InProcess
  await prisma.visit.updateMany({
    where: {
      callIn: { not: null },
      callOut: null,
      visitStatus: { not: "InProcess" },
    },
    data: { visitStatus: "InProcess" },
  });

  // Verified
  await prisma.visit.updateMany({
    where: {
      callOut: { not: null },
      visitStatus: { not: "Verified" },
    },
    data: { visitStatus: "Verified" },
  });
});

/**
 * Daily 1:05 AM:
 * - Create "No Show" exception + MissedVisit for visits whose scheduledTimeOut was yesterday or earlier AND no callIn
 * - Delete MissedVisit rows older than 3 months (or mark rescheduled behavior)
 */
cron.schedule("5 1 * * *", async () => {
  const today = startOfDay(new Date());

  // Find visits to mark missed (no callIn and past yesterday)
  const toMiss = await prisma.visit.findMany({
    where: {
      scheduledTimeOut: { lt: today },
      callIn: null,
      // avoid duplicates:
      NOT: { exceptions: { some: { exceptionType: "No Show" } } },
    },
    select: { id: true, scheduledTimeOut: true },
  });

  if (toMiss.length) {
    await prisma.$transaction(async (tx) => {
      for (const v of toMiss) {
        await tx.visitException.create({
          data: {
            visitId: v.id,
            exceptionType: "No Show",
            date: new Date(),
          },
        });
        await tx.missedVisit.create({
          data: {
            visitId: v.id,
            reason: "No Show",
            expiresAt: addMonths(v.scheduledTimeOut ?? new Date(), 3),
          },
        });
      }
    });
  }

  // Delete expired MissedVisits (3 months)
  await prisma.missedVisit.deleteMany({
    where: { expiresAt: { lt: today } },
  });
});
