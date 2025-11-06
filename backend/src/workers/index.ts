// Import all workers to activate them
import "./auditWorker";
import "./scheduleWorker";
import "./visitStatus.worker";
import "./autoClockOut";

console.log(
  "🧠 Workers initialized: audit + schedule + visitStatus + autoClockOut"
);
