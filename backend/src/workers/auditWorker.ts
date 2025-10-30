import cron from "node-cron";
import {
  subDays,
  startOfWeek,
  endOfWeek,
  subMonths,
  subYears,
  subQuarters,
  startOfMonth,
  startOfQuarter,
  endOfMonth,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import prisma from "../lib/db";
import { generateAudit } from "../services/timely-audit.service";

// 🔁 Run every Sunday at midnight
cron.schedule("0 0 * * 0", async () => {
  console.log("🕛 Auto-generating weekly audits for Unity Tasks...");

  try {
    const unityTasks = await prisma.task.findMany({
      where: {
        unityTask: true,
        name: "Conduct/Review Timely Audits",
        isActive: true,
      },
    });

    for (const task of unityTasks) {
      const due = new Date(task.dueDate);
      const start = startOfWeek(subDays(due, 7), { weekStartsOn: 0 });
      const end = endOfWeek(subDays(due, 7), { weekStartsOn: 0 });

      if (task.frequency === "DAILY") {
        const auditDay = subDays(due, 1);
        start.setTime(auditDay.getTime());
        end.setTime(auditDay.getTime());
      }

      // User *previous* month before due date
      if (task.frequency === "MONTHLY") {
        const auditMonth = subMonths(due, 1);
        start.setTime(startOfMonth(auditMonth).getTime());
        end.setTime(endOfMonth(auditMonth).getTime());
      }

      // User *previous* quarter before due date
      if (task.frequency === "QUARTERLY") {
        const auditQuarter = subQuarters(due, 1);
        start.setTime(startOfQuarter(auditQuarter).getTime());
        end.setTime(endOfQuarter(auditQuarter).getTime());
      }

      // User *previous* year before due date
      if (task.frequency === "YEARLY") {
        const auditYear = subYears(due, 1);
        start.setTime(startOfYear(auditYear).getTime());
        end.setTime(endOfYear(auditYear).getTime());
      }

      // Skip if the week hasn’t finished yet
      if (new Date() < end) continue;

      const result = await generateAudit({
        agencyId: task.agencyId,
        frequency: task.frequency || "WEEKLY",
        customStart: start.toISOString(),
        customEnd: end.toISOString(),
        unityTaskId: task.id,
        createdById: task.agencyId,
      });

      if (result.alreadyExists) {
        console.log(
          `⏩ Skipped duplicate: Audit already exists for ${
            task.agencyId
          } (${start.toDateString()} - ${end.toDateString()})`
        );
      } else {
        console.log(
          `✅ Created new audit for ${
            task.agencyId
          } (${start.toDateString()} - ${end.toDateString()})`
        );
      }
    }

    console.log("✅ Weekly Unity Task audits generated successfully");
  } catch (err) {
    console.error("❌ Error auto-generating audits:", err);
  }
});
