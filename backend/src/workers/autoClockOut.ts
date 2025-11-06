import cron from "node-cron";
import prisma from "../lib/db";
import { subHours } from "date-fns";

/**
 * Every hour: find visits that have callIn older than 24h and no callOut.
 * Auto clock them out, flag missingClockOutException (keep true), and set status.
 */
export function startAutoClockOutJob() {
  cron.schedule("0 * * * *", async () => {
    try {
      const cutoff = subHours(new Date(), 24);
      const overdue = await prisma.visit.findMany({
        where: { callOut: null, callIn: { lt: cutoff } },
        select: { id: true },
      });

      for (const v of overdue) {
        await prisma.visit.update({
          where: { id: v.id },
          data: {
            callOut: new Date(),
            visitStatus: "Incomplete",
            // keep missingClockOutException: true
            outCall: true,
          },
        });
      }

      if (overdue.length) {
        console.log(
          `[autoClockOut] Auto-clocked ${overdue.length} overdue visits`
        );
      }
    } catch (e) {
      console.error("[autoClockOut] job error:", e);
    }
  });
}
