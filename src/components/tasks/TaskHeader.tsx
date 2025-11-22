"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

type TaskHeaderProps = {
  taskId?: string | null;
  warning?: string; // optional banner
};

export default function TaskHeader({ taskId, warning }: TaskHeaderProps) {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!taskId) return;

      const u = await getLoggedInUser();
      setUser(u);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`
        );
        if (!res.ok) throw new Error("Task not found");
        const data = await res.json();
        setTask(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [taskId]);

  if (!taskId || loading || !task) return null;

  // Permission: AGENCY_ADMIN OR task.assignedRoles includes "AGENCY_ADMIN"
  const canMarkComplete =
    user?.role === "AGENCY_ADMIN" ||
    task.assignedRoles?.some((r: any) => r.role?.name === user?.roleType?.name);

  const markTaskComplete = async () => {
    try {
      setMarking(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/complete`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Failed to mark complete");

      const data = await res.json();
      setTask(data);
      toast.success("Task marked complete");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-purple-50 border border-purple-200 p-4 rounded-md mb-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-purple-700">{task.name}</h2>

        <p className="text-sm text-gray-600">
          Assigned:{" "}
          {task.assignedDate
            ? format(new Date(task.assignedDate), "PPP")
            : "N/A"}{" "}
          | Due: {task.dueDate ? format(new Date(task.dueDate), "PPP") : "N/A"}
        </p>

        {task.frequency && (
          <p className="text-xs text-gray-500">Frequency: {task.frequency}</p>
        )}

        {warning && (
          <p className="text-sm mt-2 text-red-600 font-semibold">{warning}</p>
        )}
      </div>

      {/* Right side actions */}
      <div className="mt-3 md:mt-0">
        {task.isDone ? (
          <Button disabled variant="secondary">
            ✅ Completed
          </Button>
        ) : canMarkComplete ? (
          <Button
            onClick={markTaskComplete}
            disabled={marking}
            className="bg-green-600 hover:bg-green-700"
          >
            {marking ? "Processing..." : "Mark Complete"}
          </Button>
        ) : (
          <Button disabled variant="outline">
            No Permission
          </Button>
        )}
      </div>
    </div>
  );
}
