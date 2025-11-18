import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
} from "date-fns";

export function getPayPeriod(freq: string) {
  const today = new Date();

  if (freq === "Weekly") {
    return {
      from: startOfWeek(today, { weekStartsOn: 0 }),
      to: endOfWeek(today, { weekStartsOn: 0 }),
    };
  }

  if (freq === "Bi-Weekly") {
    // rule: biweekly starting on last known Sunday cycle
    const start = startOfWeek(today, { weekStartsOn: 0 });
    return {
      from: addDays(start, -7),
      to: endOfWeek(today, { weekStartsOn: 0 }),
    };
  }

  if (freq === "First Half") {
    return {
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: new Date(today.getFullYear(), today.getMonth(), 15),
    };
  }

  if (freq === "Last Half") {
    return {
      from: new Date(today.getFullYear(), today.getMonth(), 16),
      to: endOfMonth(today),
    };
  }

  return { from: today, to: today };
}
