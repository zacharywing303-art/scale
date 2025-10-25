"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Section from "@/components/custom/Section";

export default function TasksTab({ visit }: { visit: any }) {
  const [tasks, setTasks] = useState(visit?.visitTasks ?? []);
  const [newTaskName, setNewTaskName] = useState("");

  // When parent refreshes visit (if you add that later), keep tasks in sync
  useEffect(() => {
    setTasks(visit?.visitTasks ?? []);
  }, [visit]);

  const addTask = async () => {
    const name = newTaskName.trim();
    if (!name) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/visits/${visit.id}/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );
      if (!res.ok) throw new Error("Failed to add task");
      const created = await res.json();
      setTasks((t: any[]) => [...t, created]);
      setNewTaskName("");
    } catch (e: any) {
      alert(e.message || "Error adding task");
    }
  };

  const toggleTask = async (taskId: number, completed: boolean) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/visits/${visit.id}/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        }
      );
      if (!res.ok) throw new Error("Failed to update task");
      setTasks((ts: any[]) =>
        ts.map((t) => (t.id === taskId ? { ...t, completed } : t))
      );
    } catch (e: any) {
      alert(e.message || "Error updating task");
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/visits/${visit.id}/tasks/${taskId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks((ts: any[]) => ts.filter((t) => t.id !== taskId));
    } catch (e: any) {
      alert(e.message || "Error deleting task");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Section title="Visit Tasks">
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="New task name"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
          />
          <Button onClick={addTask}>Add Task</Button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-sm text-muted-foreground">No tasks yet.</div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t: any) => (
              <li
                key={t.id}
                className="flex items-center justify-between border rounded px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={!!t.completed}
                    onCheckedChange={(v) => toggleTask(t.id, !!v)}
                  />
                  <span className={t.completed ? "line-through" : ""}>
                    {t.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTask(t.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
