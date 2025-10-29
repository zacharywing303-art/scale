import cron from "node-cron";
import { generateNextRecurringSchedules } from "../services/schedule.service";

cron.schedule("0 0 * * *", async () => {
  console.log(`🕛 Running scheduled task: generateNextRecurringSchedules`);
  try {
    await generateNextRecurringSchedules();
    console.log("✅ Recurring schedules generated");
  } catch (err) {
    console.error("❌ Error running recurring schedule job:", err);
  }
});
