"use client";

import { X, ChevronLeft, PlusCircle } from "lucide-react";
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
import { useEffect, useState } from "react";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

type Props = {
  onClose: () => void;
  onBack: () => void;
};

const automatedTasks = [
  "Conduct/Review Weekly Audit",
  "Fix Visit Exceptions",
  "Review GPS Exceptions",
  "Run Payroll",
  "Generate Schedules",
  "Review Visits",
  "Conduct Client Review",
  "Conduct Employee Review",
  "Submit Billing",
  "Review Mileage",
  "Review Employee Requests",
];

/**
 * useRoles hook
 * - waits for logged-in user
 * - fetches role types for the user's agency
 * - returns role objects { id, name }
 * - excludes agency admin role (adjust the filter name if needed)
 */
function useRoles() {
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const u = getLoggedInUser();
    setCurrentUser(u);
  }, []);

  useEffect(() => {
    if (!currentUser || !currentUser.agency?.id) {
      // still waiting on user/agency
      setLoading(false);
      return;
    }

    let mounted = true;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const agencyId = currentUser.agency.id;
        // adjust endpoint if your backend path differs
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/roles?agencyId=${agencyId}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error(`Failed to load roles: ${res.status}`);
        }
        const data = await res.json();

        // Expecting an array of objects: [{ id, name, ... }, ...]
        const roleObjs = Array.isArray(data)
          ? data.map((r: any) => ({ id: r.id, name: r.name }))
          : [];

        if (!mounted) return;

        // Filter out Agency Admin (adjust role name if needed)
        const filtered = roleObjs.filter(
          (r: any) =>
            r.name.toLowerCase() !== "agency_admin" &&
            r.name.toLowerCase() !== "agency admin" &&
            r.name.toLowerCase() !== "admin" // optional: tune to your conventions
        );

        setRoles(filtered);
      } catch (err: any) {
        if (mounted && err.name !== "AbortError") setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [currentUser]);

  return { roles, loading, error };
}

export default function CreateTaskModal({ onClose, onBack }: Props) {
  const [mode, setMode] = useState<"automated" | "manual">("automated");
  const [selectedAutomatedTasks, setSelectedAutomatedTasks] = useState<
    string[]
  >([]);
  const [taskFrequency, setTaskFrequency] = useState("weekly");
  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
  const [taskName, setTaskName] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState("weekly");
  const [dueDate, setDueDate] = useState<string>(""); // for manual mode
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();

  const toggleAutomatedTask = (task: string) =>
    setSelectedAutomatedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );

  const toggleAssignedRole = (roleId: string) =>
    setAssignedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );

  // Example generator: Creates tasks for selected automated tasks OR single manual task.
  // Adjust payload to match the backend service you create.
  const handleGenerateTasks = async () => {
    try {
      const currentUser = getLoggedInUser();
      if (!currentUser?.agency?.id) {
        alert("Missing agency context. Please reload.");
        return;
      }
      const agencyId = currentUser.agency.id;

      // Build tasks payload
      const tasksToCreate: any[] =
        mode === "automated"
          ? selectedAutomatedTasks.map((name) => ({
              name,
              description: "",
              agencyId,
              assignedRoleIds: assignedRoles, // include any roles selected (IDs)
              dueDate: new Date().toISOString(), // set default due date to now — modify as needed
              recurring: isRecurring,
              frequency: taskFrequency.toUpperCase(), // e.g. WEEKLY
              unityTask: true,
            }))
          : [
              {
                name: taskName,
                description: "",
                agencyId,
                assignedRoleIds: assignedRoles,
                dueDate: dueDate
                  ? new Date(dueDate).toISOString()
                  : new Date().toISOString(),
                recurring: isRecurring,
                frequency: recurringFreq.toUpperCase(),
                unityTask: false,
              },
            ];

      // Example: POST each task (you could batch create on backend)
      const promises = tasksToCreate.map((t) =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(t),
        })
      );

      const results = await Promise.all(promises);
      const failed = results.find((r) => !r.ok);
      if (failed) {
        const text = await failed.text();
        throw new Error(text || "Failed to create one or more tasks");
      }

      alert("Tasks created");
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error creating tasks");
    }
  };

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

            <div>
              <Label>Task Frequency</Label>
              <Select
                value={taskFrequency}
                onValueChange={(val) => setTaskFrequency(val)}
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

            {/* Assign Roles - uses real roles from hook */}
            <div>
              <h3 className="font-medium mb-2">Assign To Roles</h3>
              {rolesLoading && <p>Loading roles...</p>}
              {rolesError && (
                <p className="text-red-500">Error loading roles</p>
              )}
              {!rolesLoading && !rolesError && roles.length === 0 && (
                <p className="text-sm text-muted-foreground">No roles found.</p>
              )}
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={assignedRoles.includes(role.id)}
                    onCheckedChange={() => toggleAssignedRole(role.id)}
                    id={role.id}
                  />
                  <Label htmlFor={role.id}>{role.name}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === "manual" && (
          <div className="space-y-4">
            <div>
              <Label>Task Name</Label>
              <Input
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Assign Roles (real roles) */}
            <div>
              <h3 className="font-medium mb-2">Assign To Roles</h3>
              {rolesLoading && <p>Loading roles...</p>}
              {rolesError && (
                <p className="text-red-500">Error loading roles</p>
              )}
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={assignedRoles.includes(role.id)}
                    onCheckedChange={() => toggleAssignedRole(role.id)}
                    id={role.id}
                  />
                  <Label htmlFor={role.id}>{role.name}</Label>
                </div>
              ))}
            </div>

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
          <Button
            className="w-full flex gap-2 items-center"
            onClick={handleGenerateTasks}
          >
            <PlusCircle className="w-4 h-4" />
            Generate Tasks
          </Button>
        </div>
      </div>
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import { X, ChevronLeft, Check, PlusCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// type Props = {
//   onClose: () => void;
//   onBack: () => void;
// };

// const automatedTasks = [
//   "Conduct/Review Weekly Audit",
//   "Fix Visit Exceptions",
//   "Review GPS Exceptions",
//   "Run Payroll",
//   "Generate Schedules",
//   "Review Visits",
//   "Conduct Client Review",
//   "Conduct Employee Review",
//   "Submit Billing",
//   "Review Mileage",
//   "Review Employee Requests",
// ];

// const roles = ["Admin", "Supervisor", "Caregiver", "Nurse"];

// export default function CreateTaskModal({ onClose, onBack }: Props) {
//   const [mode, setMode] = useState<"automated" | "manual">("automated");
//   const [selectedAutomatedTasks, setSelectedAutomatedTasks] = useState<
//     string[]
//   >([]);
//   const [selectedReports, setSelectedReports] = useState<string[]>([]);
//   const [reportFrequency, setReportFrequency] = useState("weekly");
//   const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
//   const [taskName, setTaskName] = useState("");
//   const [isRecurring, setIsRecurring] = useState(false);
//   const [recurringFreq, setRecurringFreq] = useState("weekly");

//   const toggleAutomatedTask = (task: string) =>
//     setSelectedAutomatedTasks((prev) =>
//       prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
//     );

//   const toggleAssignedRole = (role: string) =>
//     setAssignedRoles((prev) =>
//       prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
//     );

//   const toggleReportType = (report: string) =>
//     setSelectedReports((prev) =>
//       prev.includes(report)
//         ? prev.filter((r) => r !== report)
//         : [...prev, report]
//     );

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
//       <div className="bg-white max-w-2xl w-full max-h-[90vh] rounded-md overflow-y-auto p-6 relative">
//         {/* Top buttons */}
//         <div className="flex justify-between mb-4">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={onBack}
//             className="flex items-center gap-1"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Go Back
//           </Button>
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="w-5 h-5" />
//           </Button>
//         </div>

//         <h2 className="text-xl font-semibold mb-4">Create Task</h2>

//         {/* Choose Mode */}
//         <RadioGroup
//           value={mode}
//           onValueChange={(v) => setMode(v as "automated" | "manual")}
//           className="flex gap-4 mb-6"
//         >
//           <div className="flex items-center space-x-2">
//             <RadioGroupItem value="automated" id="automated" />
//             <Label htmlFor="automated">Assign Unity Automated Task</Label>
//           </div>
//           <div className="flex items-center space-x-2">
//             <RadioGroupItem value="manual" id="manual" />
//             <Label htmlFor="manual">Create Your Own</Label>
//           </div>
//         </RadioGroup>

//         {mode === "automated" && (
//           <div className="space-y-4">
//             {/* Automated Task Checklist */}
//             <div>
//               <h3 className="font-medium mb-2">Select Automated Tasks</h3>
//               {automatedTasks.map((task) => (
//                 <div key={task} className="flex items-center space-x-2">
//                   <Checkbox
//                     checked={selectedAutomatedTasks.includes(task)}
//                     onCheckedChange={() => toggleAutomatedTask(task)}
//                     id={task}
//                   />
//                   <Label htmlFor={task}>{task}</Label>
//                 </div>
//               ))}
//             </div>

//             {/* Reports Dropdown */}
//             <div>
//               <div className="mt-2">
//                 <Label>Task Frequency</Label>
//                 <Select
//                   value={reportFrequency}
//                   onValueChange={(val) => setReportFrequency(val)}
//                 >
//                   <SelectTrigger className="w-full mt-1">
//                     <SelectValue placeholder="Select frequency" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="daily">Daily</SelectItem>
//                     <SelectItem value="weekly">Weekly</SelectItem>
//                     <SelectItem value="monthly">Monthly</SelectItem>
//                     <SelectItem value="quarterly">Quarterly</SelectItem>
//                     <SelectItem value="yearly">Yearly</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Assign Roles */}
//             <div>
//               <h3 className="font-medium mb-2">Assign To Roles</h3>
//               {roles.map((role) => (
//                 <div key={role} className="flex items-center space-x-2">
//                   <Checkbox
//                     checked={assignedRoles.includes(role)}
//                     onCheckedChange={() => toggleAssignedRole(role)}
//                     id={role}
//                   />
//                   <Label htmlFor={role}>{role}</Label>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {mode === "manual" && (
//           <div className="space-y-4">
//             {/* Task Name */}
//             <div>
//               <Label>Task Name</Label>
//               <Input
//                 placeholder="Enter task name"
//                 value={taskName}
//                 onChange={(e) => setTaskName(e.target.value)}
//               />
//             </div>

//             {/* Assign Roles */}
//             <div>
//               <h3 className="font-medium mb-2">Assign To Roles</h3>
//               {roles.map((role) => (
//                 <div key={role} className="flex items-center space-x-2">
//                   <Checkbox
//                     checked={assignedRoles.includes(role)}
//                     onCheckedChange={() => toggleAssignedRole(role)}
//                     id={role}
//                   />
//                   <Label htmlFor={role}>{role}</Label>
//                 </div>
//               ))}
//             </div>

//             {/* Recurring */}
//             <div className="flex items-center space-x-2">
//               <Checkbox
//                 checked={isRecurring}
//                 onCheckedChange={() => setIsRecurring((prev) => !prev)}
//                 id="recurring"
//               />
//               <Label htmlFor="recurring">Recurring Task</Label>
//             </div>

//             {isRecurring && (
//               <div>
//                 <Label>Recurring Frequency</Label>
//                 <Select
//                   value={recurringFreq}
//                   onValueChange={(val) => setRecurringFreq(val)}
//                 >
//                   <SelectTrigger className="w-full mt-1">
//                     <SelectValue placeholder="Select frequency" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="daily">Daily</SelectItem>
//                     <SelectItem value="weekly">Weekly</SelectItem>
//                     <SelectItem value="monthly">Monthly</SelectItem>
//                     <SelectItem value="quarterly">Quarterly</SelectItem>
//                     <SelectItem value="yearly">Yearly</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Generate Button */}
//         <div className="mt-6">
//           <Button className="w-full flex gap-2 items-center">
//             <PlusCircle className="w-4 h-4" />
//             Generate Tasks
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
