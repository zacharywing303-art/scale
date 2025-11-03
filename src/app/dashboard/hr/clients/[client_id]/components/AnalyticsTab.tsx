"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import AddTasksModal from "../modals/AddTasksModal";

const mockDailyTasks = ["Take meds", "Shower assistance", "Meal prep"];

export default function AnalyticsTab({ client }: { client: any }) {
  return (
    <div className="p-4 space-y-6">
      {/* Assigned Employees */}
      <div>
        <Label className="mb-1">Assigned Employees</Label>
        <ScrollArea className="border rounded p-2 h-24">
          <div>Employee A</div>
          <div>Employee B</div>
          <div>Employee C</div>
        </ScrollArea>
      </div>

      {/* Time with Company */}
      <div>
        <Label className="mb-1">Time with Company</Label>
        <Input value="2 years 4 months" disabled />
      </div>

      {/* Daily Tasks */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Daily Tasks</Label>
          <AddTasksModal />
        </div>
        <ScrollArea className="border rounded p-2 h-32">
          {mockDailyTasks.map((task, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span>{task}</span>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-500"
                title="Delete"
              >
                ✕
              </Button>
            </div>
          ))}
        </ScrollArea>
      </div>
      {/* Save Button */}
      <Button>Save Changes</Button>
    </div>
  );
}
