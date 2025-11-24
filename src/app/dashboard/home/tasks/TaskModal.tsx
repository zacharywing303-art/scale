"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  subWeeks,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subQuarters,
  startOfQuarter,
  endOfQuarter,
  subYears,
  startOfYear,
  endOfYear,
} from "date-fns";
import CreateTaskModal from "./CreateTaskModal";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Task = {
  id: string;
  name: string;
  description?: string;
  frequency?: string;
  assignedDate?: string | Date | null;
  dueDate?: string | Date | null;
  isDone: boolean;
  isActive: boolean;
  unityTask?: boolean;
  assignedRoles: { role: { name: string } }[];
};

export default function TaskModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmTask, setConfirmTask] = useState<Task | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "complete" | "incomplete" | null
  >(null);
  const [processing, setProcessing] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const user = getLoggedInUser();
  const router = useRouter();

  const canEdit =
    user?.role === "AGENCY_ADMIN" ||
    user?.roleType?.permissions?.some((p: any) => p.name === "Create Tasks");

  useEffect(() => {
    async function fetchTasks() {
      try {
        if (!user) return;

        const url =
          user.role === "AGENCY_ADMIN"
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/agency/${user.agency?.id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/user/${user.id}`;

        const res = await fetch(url);
        const data = await res.json();
        setTasks(data || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) fetchTasks();
  }, [isOpen]);

  // 🧠 When user confirms
  const handleConfirmToggle = async () => {
    if (!confirmTask) return;
    setProcessing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${confirmTask.id}/complete`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) throw new Error("Failed to toggle task");

      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
      );
      setConfirmTask(null);
      setConfirmAction(null);
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task.");
    } finally {
      setProcessing(false);
    }
  };

  const openConfirmModal = (task: Task) => {
    setConfirmTask(task);
    setConfirmAction(task.isDone ? "incomplete" : "complete");
  };

  const handleUpdateTask = async () => {
    if (!editTask) return;
    const confirmed = confirm("Are you sure you want to save these changes?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${editTask.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editTask),
        }
      );
      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
      );
      alert("Task updated successfully");
      setEditTask(null);
    } catch (err) {
      console.error(err);
      alert("Error updating task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete");
      setTasks((prev) => prev.filter((t) => t.id !== id));
      alert("Task deleted");
      setEditTask(null);
    } catch (err) {
      console.error(err);
      alert("Error deleting task");
    }
  };

  const handleGoToUnityTask = async (task: Task) => {
    const baseUrl = "/dashboard/visits";

    if (task.name === "Fix Visit Exceptions") {
      const due = new Date(task.dueDate ?? new Date());
      let dateFrom: string;
      let dateTo: string;

      // Determine previous period
      switch (task.frequency) {
        case "WEEKLY":
          dateFrom = startOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          break;
        case "MONTHLY":
          dateFrom = startOfMonth(subMonths(due, 1))
            .toISOString()
            .split("T")[0];
          dateTo = endOfMonth(subMonths(due, 1)).toISOString().split("T")[0];
          break;
        case "QUARTERLY":
          dateFrom = startOfQuarter(subQuarters(due, 1))
            .toISOString()
            .split("T")[0];
          dateTo = endOfQuarter(subQuarters(due, 1))
            .toISOString()
            .split("T")[0];
          break;
        case "YEARLY":
          dateFrom = startOfYear(subYears(due, 1)).toISOString().split("T")[0];
          dateTo = endOfYear(subYears(due, 1)).toISOString().split("T")[0];
          break;
        case "CUSTOM":
          // For CUSTOM, use the due date as end, and calculate start based on a default range (e.g., 7 days)
          dateTo = due.toISOString().split("T")[0];
          const customStart = subWeeks(due, 1);
          dateFrom = startOfWeek(customStart, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          break;
        default:
          // fallback: past 7 days
          dateFrom = startOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
      }

      router.push(
        `${baseUrl}?from=${dateFrom}&to=${dateTo}&exceptionOnly=true&taskId=${task.id}`
      );
      return;
    }

    if (task.name === "Review GPS Exceptions") {
      const due = new Date(task.dueDate ?? new Date());
      let dateFrom: string;
      let dateTo: string;

      switch (task.frequency) {
        case "WEEKLY":
          dateFrom = startOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          break;
        case "MONTHLY":
          dateFrom = startOfMonth(subMonths(due, 1))
            .toISOString()
            .split("T")[0];
          dateTo = endOfMonth(subMonths(due, 1)).toISOString().split("T")[0];
          break;
        case "QUARTERLY":
          dateFrom = startOfQuarter(subQuarters(due, 1))
            .toISOString()
            .split("T")[0];
          dateTo = endOfQuarter(subQuarters(due, 1))
            .toISOString()
            .split("T")[0];
          break;
        case "YEARLY":
          dateFrom = startOfYear(subYears(due, 1)).toISOString().split("T")[0];
          dateTo = endOfYear(subYears(due, 1)).toISOString().split("T")[0];
          break;
        case "CUSTOM":
          dateTo = due.toISOString().split("T")[0];
          const customStart = subWeeks(due, 1);
          dateFrom = startOfWeek(customStart, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          break;
        default:
          dateFrom = startOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
      }

      router.push(
        `/dashboard/hr/document-review/GPSException-review?from=${dateFrom}&to=${dateTo}&taskId=${task.id}`
      );
      return;
    }

    if (task.name === "Run Payroll") {
      const due = new Date(task.dueDate ?? new Date());
      let dateFrom: string;
      let dateTo: string;

      switch (task.frequency) {
        case "WEEKLY":
          dateFrom = startOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          break;
        case "MONTHLY":
          dateFrom = startOfMonth(subMonths(due, 1))
            .toISOString()
            .split("T")[0];
          dateTo = endOfMonth(subMonths(due, 1)).toISOString().split("T")[0];
          break;
        case "QUARTERLY":
          dateFrom = startOfQuarter(subQuarters(due, 1))
            .toISOString()
            .split("T")[0];
          dateTo = endOfQuarter(subQuarters(due, 1))
            .toISOString()
            .split("T")[0];
          break;
        case "YEARLY":
          dateFrom = startOfYear(subYears(due, 1)).toISOString().split("T")[0];
          dateTo = endOfYear(subYears(due, 1)).toISOString().split("T")[0];
          break;
        default:
          dateFrom = startOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(subWeeks(due, 1), { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
      }

      // Navigate to payroll page with taskId + precomputed period
      router.push(
        `/dashboard/hr/payroll?from=${dateFrom}&to=${dateTo}&taskId=${task.id}`
      );
      return;
    }

    // ⭐ NEW — Generate Schedules
    if (task.name === "Generate Schedules") {
      router.push(`/dashboard/scheduling/schedule-create?taskId=${task.id}`);
      return;
    }

    // ⭐ REVIEW VISITS
    if (task.name === "Review Visits") {
      const due = new Date(task.dueDate ?? new Date());
      let dateFrom: string;
      let dateTo: string;

      switch (task.frequency) {
        case "DAILY": {
          // daily → assignedDate → day before due date
          const assigned = new Date(task.assignedDate ?? due);
          const end = new Date(due);
          end.setDate(end.getDate() - 1);
          dateFrom = assigned.toISOString().split("T")[0];
          dateTo = end.toISOString().split("T")[0];
          break;
        }

        case "WEEKLY": {
          const prevWeek = subWeeks(due, 1);
          dateFrom = startOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          break;
        }

        case "MONTHLY": {
          const prevMonth = subMonths(due, 1);
          dateFrom = startOfMonth(prevMonth).toISOString().split("T")[0];
          dateTo = endOfMonth(prevMonth).toISOString().split("T")[0];
          break;
        }

        case "QUARTERLY": {
          const prevQuarter = subQuarters(due, 1);
          dateFrom = startOfQuarter(prevQuarter).toISOString().split("T")[0];
          dateTo = endOfQuarter(prevQuarter).toISOString().split("T")[0];
          break;
        }

        case "YEARLY": {
          const prevYear = subYears(due, 1);
          dateFrom = startOfYear(prevYear).toISOString().split("T")[0];
          dateTo = endOfYear(prevYear).toISOString().split("T")[0];
          break;
        }

        case "SPECIFIC_DATE": {
          // Specific date → treat like daily
          const assigned = new Date(task.assignedDate ?? due);
          const end = new Date(due);
          end.setDate(end.getDate() - 1);
          dateFrom = assigned.toISOString().split("T")[0];
          dateTo = end.toISOString().split("T")[0];
          break;
        }

        default: {
          // fallback: previous full week
          const prevWeek = subWeeks(due, 1);
          dateFrom = startOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
        }
      }

      router.push(
        `/dashboard/visits?from=${dateFrom}&to=${dateTo}&taskId=${task.id}`
      );
      return;
    }

    // ⭐ CONDUCT EMPLOYEE REVIEW
    if (task.name === "Conduct Employee Review") {
      const due = new Date(task.dueDate ?? new Date());
      const assigned = new Date(task.assignedDate ?? due);

      let dateFrom: string;
      let dateTo: string;

      switch (task.frequency) {
        case "DAILY": {
          const end = new Date(due);
          end.setDate(end.getDate() - 1);
          dateFrom = assigned.toISOString().split("T")[0];
          dateTo = end.toISOString().split("T")[0];
          break;
        }

        case "WEEKLY": {
          const prevWeek = subWeeks(due, 1);
          dateFrom = startOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          break;
        }

        case "MONTHLY": {
          const prevMonth = subMonths(due, 1);
          dateFrom = startOfMonth(prevMonth).toISOString().split("T")[0];
          dateTo = endOfMonth(prevMonth).toISOString().split("T")[0];
          break;
        }

        case "QUARTERLY": {
          const prevQuarter = subQuarters(due, 1);
          dateFrom = startOfQuarter(prevQuarter).toISOString().split("T")[0];
          dateTo = endOfQuarter(prevQuarter).toISOString().split("T")[0];
          break;
        }

        case "YEARLY": {
          const prevYear = subYears(due, 1);
          dateFrom = startOfYear(prevYear).toISOString().split("T")[0];
          dateTo = endOfYear(prevYear).toISOString().split("T")[0];
          break;
        }

        case "SPECIFIC_DATE": {
          const end = new Date(due);
          end.setDate(end.getDate() - 1);
          dateFrom = assigned.toISOString().split("T")[0];
          dateTo = end.toISOString().split("T")[0];
          break;
        }

        default: {
          const prevWeek = subWeeks(due, 1);
          dateFrom = startOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
        }
      }

      router.push(
        `/dashboard/hr/document-review/employee-review?from=${dateFrom}&to=${dateTo}&frequency=${task.frequency}&taskId=${task.id}`
      );
      return;
    }

    // ⭐ CONDUCT CLIENT REVIEW
    if (task.name === "Conduct Client Review") {
      const due = new Date(task.dueDate ?? new Date());
      const assigned = new Date(task.assignedDate ?? due);

      let dateFrom: string;
      let dateTo: string;

      switch (task.frequency) {
        case "DAILY": {
          const end = new Date(due);
          end.setDate(end.getDate() - 1);
          dateFrom = assigned.toISOString().split("T")[0];
          dateTo = end.toISOString().split("T")[0];
          break;
        }

        case "WEEKLY": {
          const prevWeek = subWeeks(due, 1);
          dateFrom = startOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          break;
        }

        case "MONTHLY": {
          const prevMonth = subMonths(due, 1);
          dateFrom = startOfMonth(prevMonth).toISOString().split("T")[0];
          dateTo = endOfMonth(prevMonth).toISOString().split("T")[0];
          break;
        }

        case "QUARTERLY": {
          const prevQuarter = subQuarters(due, 1);
          dateFrom = startOfQuarter(prevQuarter).toISOString().split("T")[0];
          dateTo = endOfQuarter(prevQuarter).toISOString().split("T")[0];
          break;
        }

        case "YEARLY": {
          const prevYear = subYears(due, 1);
          dateFrom = startOfYear(prevYear).toISOString().split("T")[0];
          dateTo = endOfYear(prevYear).toISOString().split("T")[0];
          break;
        }

        case "SPECIFIC_DATE": {
          const end = new Date(due);
          end.setDate(end.getDate() - 1);
          dateFrom = assigned.toISOString().split("T")[0];
          dateTo = end.toISOString().split("T")[0];
          break;
        }

        default: {
          const prevWeek = subWeeks(due, 1);
          dateFrom = startOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(prevWeek, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
        }
      }

      router.push(
        `/dashboard/hr/document-review/client-review?from=${dateFrom}&to=${dateTo}&frequency=${task.frequency}&taskId=${task.id}`
      );
      return;
    }

    // ⭐ REVIEW BILLING
    if (task.name === "Review Billing") {
      const due = new Date(task.dueDate ?? new Date());
      let dateFrom: string;
      let dateTo: string;

      switch (task.frequency) {
        case "DAILY": {
          const assigned = new Date(task.assignedDate ?? due);
          const end = new Date(due);
          end.setDate(end.getDate() - 1);
          dateFrom = assigned.toISOString().split("T")[0];
          dateTo = end.toISOString().split("T")[0];
          break;
        }

        case "WEEKLY": {
          const prev = subWeeks(due, 1);
          dateFrom = startOfWeek(prev, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(prev, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          break;
        }

        case "MONTHLY": {
          const prev = subMonths(due, 1);
          dateFrom = startOfMonth(prev).toISOString().split("T")[0];
          dateTo = endOfMonth(prev).toISOString().split("T")[0];
          break;
        }

        case "QUARTERLY": {
          const prev = subQuarters(due, 1);
          dateFrom = startOfQuarter(prev).toISOString().split("T")[0];
          dateTo = endOfQuarter(prev).toISOString().split("T")[0];
          break;
        }

        case "YEARLY": {
          const prev = subYears(due, 1);
          dateFrom = startOfYear(prev).toISOString().split("T")[0];
          dateTo = endOfYear(prev).toISOString().split("T")[0];
          break;
        }

        case "SPECIFIC_DATE": {
          const assigned = new Date(task.assignedDate ?? due);
          const end = new Date(due);
          end.setDate(end.getDate() - 1);
          dateFrom = assigned.toISOString().split("T")[0];
          dateTo = end.toISOString().split("T")[0];
          break;
        }

        default: {
          const prev = subWeeks(due, 1);
          dateFrom = startOfWeek(prev, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
          dateTo = endOfWeek(prev, { weekStartsOn: 0 })
            .toISOString()
            .split("T")[0];
        }
      }

      router.push(
        `/dashboard/billing/review?from=${dateFrom}&to=${dateTo}&taskId=${task.id}`
      );
      return;
    }

    if (task.name === "Conduct/Review Timely Audits") {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/for-task/${task.id}`
      );
      const data = await res.json();
      if (!data.ready) return toast.warning(data.message);
      router.push(
        `/dashboard/hr/document-review/timely-audit/${data.audit.id}`
      );
    } else {
      alert("Go to Tasks page (coming soon)");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-xl rounded shadow-lg relative p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4">Task List</h2>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        )}

        {/* Empty */}
        {!loading && tasks.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-6">
            There are no tasks currently assigned to you.
          </p>
        )}

        {/* Tasks List */}
        {!loading && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-3 border rounded bg-muted hover:bg-muted/60"
              >
                <div>
                  <h3
                    className={`font-medium ${
                      task.isDone ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {task.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Assigned:{" "}
                    {task.assignedDate
                      ? format(new Date(task.assignedDate), "PPP")
                      : "N/A"}
                  </p>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due: {format(new Date(task.dueDate), "PPP")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {/* ✅ Toggle Complete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openConfirmModal(task)}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${
                        task.isDone ? "text-green-500" : ""
                      }`}
                    />
                  </Button>

                  {/* 🔍 Details (coming next step) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDetailTask(task)}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {/* ✏️ Edit (coming next steps, permission-based) */}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditTask(task)}
                    >
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ➕ Create Task */}
        <div className="mt-6">
          <Button className="w-full" onClick={() => setShowCreate(true)}>
            Create New Task
          </Button>
        </div>

        {/* 🧱 Create Task Modal */}
        {showCreate && (
          <CreateTaskModal
            onClose={() => setShowCreate(false)}
            onBack={() => setShowCreate(false)}
          />
        )}
      </div>

      {/* ⚠️ Confirmation Modal */}
      {confirmTask && confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-2">
              {confirmAction === "complete"
                ? "Mark task as complete?"
                : "Mark task as incomplete?"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {confirmAction === "complete"
                ? "Are you sure you want to mark this task as complete? Tasks may not have been finished."
                : "Are you sure you want to mark this task as incomplete? Task may have been finished — please review."}
            </p>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmTask(null);
                  setConfirmAction(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmToggle}
                disabled={processing}
                className={
                  confirmAction === "complete"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }
              >
                {processing
                  ? "Processing..."
                  : confirmAction === "complete"
                  ? "Mark Complete"
                  : "Mark Incomplete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🧾 Task Details Modal */}
      {detailTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setDetailTask(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X />
            </button>
            <h3 className="text-lg font-semibold mb-3">{detailTask.name}</h3>
            <div className="text-sm text-gray-700 space-y-2 mb-4">
              {detailTask.description && (
                <p>
                  <span className="font-medium">Description: </span>
                  {detailTask.description}
                </p>
              )}
              {detailTask.dueDate && (
                <p>
                  <span className="font-medium">Due Date: </span>
                  {format(new Date(detailTask.dueDate), "PPP")}
                </p>
              )}
              <p>
                <span className="font-medium">Status: </span>
                {detailTask.isDone ? "Completed" : "In Progress"}
              </p>
              {detailTask.assignedRoles &&
                detailTask.assignedRoles.length > 0 && (
                  <p>
                    <span className="font-medium">Assigned To: </span>
                    {detailTask.assignedRoles
                      .map((r) => r.role.name)
                      .join(", ")}
                  </p>
                )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDetailTask(null)}>
                Close
              </Button>

              {/* Go To Tasks for automated Unity tasks */}
              {detailTask.unityTask && (
                <Button
                  onClick={() => handleGoToUnityTask(detailTask)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Go to Tasks
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {editTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setEditTask(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X />
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit Task</h3>

            <div className="space-y-3">
              {!editTask.unityTask && (
                <>
                  <Label>Title</Label>
                  <Input
                    value={editTask.name}
                    onChange={(e) =>
                      setEditTask({ ...editTask, name: e.target.value })
                    }
                  />
                </>
              )}
              <Label>Description</Label>
              <textarea
                className="w-full border rounded-md p-2 text-sm"
                rows={4}
                value={editTask.description || ""}
                onChange={(e) =>
                  setEditTask({ ...editTask, description: e.target.value })
                }
              />
              <Label>Due Date</Label>
              <Input
                type="date"
                value={
                  editTask.dueDate
                    ? format(new Date(editTask.dueDate), "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  setEditTask({ ...editTask, dueDate: e.target.value })
                }
              />

              <Label>Frequency</Label>
              <Select
                value={editTask.frequency?.toLowerCase() || ""}
                onValueChange={(val) =>
                  setEditTask({ ...editTask, frequency: val.toUpperCase() })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                variant="destructive"
                onClick={() => handleDeleteTask(editTask.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditTask(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTask}>Update Task</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
