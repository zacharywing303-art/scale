"use client";

import { useState } from "react";
import { X, ChevronLeft, Check, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Props = {
  onClose: () => void;
  onBack: () => void;
};

const automatedTasks = ["Weekly Audit", "Update Exceptions"];

const reportTypes = ["Payroll Report", "Visit Summary", "Billing Report"];

const roles = ["Admin", "Supervisor", "Caregiver", "Nurse"];

export default function CreateTaskModal({ onClose, onBack }: Props) {
  const [mode, setMode] = useState<"automated" | "manual">("automated");
  const [selectedAutomatedTasks, setSelectedAutomatedTasks] = useState<
    string[]
  >([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [reportFrequency, setReportFrequency] = useState("weekly");
  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
  const [taskName, setTaskName] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState("weekly");

  const toggleAutomatedTask = (task: string) =>
    setSelectedAutomatedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );

  const toggleAssignedRole = (role: string) =>
    setAssignedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const toggleReportType = (report: string) =>
    setSelectedReports((prev) =>
      prev.includes(report)
        ? prev.filter((r) => r !== report)
        : [...prev, report]
    );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] rounded-md overflow-y-auto p-6 relative">
        {/* Top buttons */}
        <div className="flex justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <h2 className="text-xl font-semibold mb-4">Create Task</h2>

        {/* Choose Mode */}
        <RadioGroup
          value={mode}
          onValueChange={(v) => setMode(v as "automated" | "manual")}
          className="flex gap-4 mb-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="automated" id="automated" />
            <Label htmlFor="automated">Assign Unity Automated Task</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual">Create Your Own</Label>
          </div>
        </RadioGroup>

        {mode === "automated" && (
          <div className="space-y-4">
            {/* Automated Task Checklist */}
            <div>
              <h3 className="font-medium mb-2">Select Automated Tasks</h3>
              {automatedTasks.map((task) => (
                <div key={task} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedAutomatedTasks.includes(task)}
                    onCheckedChange={() => toggleAutomatedTask(task)}
                    id={task}
                  />
                  <Label htmlFor={task}>{task}</Label>
                </div>
              ))}
            </div>

            {/* Reports Dropdown */}
            <div>
              <h3 className="font-medium mb-2">Select Reports to Generate</h3>
              <div className="grid gap-2">
                {reportTypes.map((report) => (
                  <div key={report} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedReports.includes(report)}
                      onCheckedChange={() => toggleReportType(report)}
                      id={report}
                    />
                    <Label htmlFor={report}>{report}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Label>Report Frequency</Label>
                <Select
                  value={reportFrequency}
                  onValueChange={(val) => setReportFrequency(val)}
                >
                  <SelectTrigger className="w-full mt-1">
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
            </div>

            {/* Assign Roles */}
            <div>
              <h3 className="font-medium mb-2">Assign To Roles</h3>
              {roles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    checked={assignedRoles.includes(role)}
                    onCheckedChange={() => toggleAssignedRole(role)}
                    id={role}
                  />
                  <Label htmlFor={role}>{role}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === "manual" && (
          <div className="space-y-4">
            {/* Task Name */}
            <div>
              <Label>Task Name</Label>
              <Input
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>

            {/* Assign Roles */}
            <div>
              <h3 className="font-medium mb-2">Assign To Roles</h3>
              {roles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    checked={assignedRoles.includes(role)}
                    onCheckedChange={() => toggleAssignedRole(role)}
                    id={role}
                  />
                  <Label htmlFor={role}>{role}</Label>
                </div>
              ))}
            </div>

            {/* Recurring */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isRecurring}
                onCheckedChange={() => setIsRecurring((prev) => !prev)}
                id="recurring"
              />
              <Label htmlFor="recurring">Recurring Task</Label>
            </div>

            {isRecurring && (
              <div>
                <Label>Recurring Frequency</Label>
                <Select
                  value={recurringFreq}
                  onValueChange={(val) => setRecurringFreq(val)}
                >
                  <SelectTrigger className="w-full mt-1">
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
            )}
          </div>
        )}

        {/* Generate Button */}
        <div className="mt-6">
          <Button className="w-full flex gap-2 items-center">
            <PlusCircle className="w-4 h-4" />
            Generate Tasks
          </Button>
        </div>
      </div>
    </div>
  );
}
