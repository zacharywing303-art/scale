// Import all workers to activate them
import "./auditWorker";
import "./scheduleWorker";
import "./visitStatus.worker";
import { startAutoClockOutJob } from "./autoClockOut";

startAutoClockOutJob();

console.log(
  "🧠 Workers initialized: audit + schedule + visitStatus + autoClockOut"
);
