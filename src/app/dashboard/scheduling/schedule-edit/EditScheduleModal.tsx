"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

type EditScheduleModalProps = {
  schedule: any;
  onClose: () => void;
};

type ScheduleConstraintCheck = {
  canSchedule: boolean;
  hardBlocks: string[];
  softWarnings: string[];
};

export default function EditScheduleModal({
  schedule,
  onClose,
}: EditScheduleModalProps) {
  const [groupSchedules, setGroupSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    []
  );
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    employeeIDs: [] as string[],
    serviceId: "",
    officeReason: "",
    startTime: "",
    endTime: "",
    recurring: false,
    recurringFrequency: "WEEKLY",
  });

  const now = new Date();

  const [constraintSummary, setConstraintSummary] =
    useState<ScheduleConstraintCheck | null>(null);
  const [constraintLoading, setConstraintLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [groupRes, empRes, cliRes, svcRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/group/${schedule.createdScheduleID}`
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`),
        ]);
        const [group, emp, cli, svc] = await Promise.all([
          groupRes.json(),
          empRes.json(),
          cliRes.json(),
          svcRes.json(),
        ]);

        setGroupSchedules(group);
        setEmployees(emp);
        setClients(cli);
        setServices(svc);

        const base = group[0];
        setFormData({
          employeeIDs: group
            .map((s: any) => s.employee?.id)
            .filter((id: string | undefined) => !!id),
          serviceId: base?.service?.id || "",
          officeReason: base?.officeReason || "",
          startTime: new Date(base.startTime).toISOString().slice(11, 16),
          endTime: new Date(base.endTime).toISOString().slice(11, 16),
          recurring: base.recurring,
          recurringFrequency: base.recurringFrequency || "WEEKLY",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load schedule data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [schedule.createdScheduleID]);

  const base = groupSchedules[0];
  const isPast = useMemo(
    () => !!base && new Date(base.eventDate) < now,
    [base, now]
  );

  const runConstraintCheck = async () => {
    if (!base) return;
    if (!formData.startTime || !formData.endTime) return;
    if (!formData.employeeIDs.length) return;

    try {
      setConstraintLoading(true);
      setConstraintSummary(null);

      const parseHHMM = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return { h, m };
      };

      const eventDates = groupSchedules.map((s) => new Date(s.eventDate));
      if (!eventDates.length) {
        setConstraintLoading(false);
        return;
      }

      const sorted = eventDates.sort((a, b) => a.getTime() - b.getTime());
      const firstDate = sorted[0];
      const lastDate = sorted[sorted.length - 1];

      const { h: sh, m: sm } = parseHHMM(formData.startTime);
      const { h: eh, m: em } = parseHHMM(formData.endTime);

      const start = new Date(firstDate);
      start.setHours(sh, sm, 0, 0);
      const end = new Date(lastDate);
      end.setHours(eh, em, 0, 0);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/constraints`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeIds: formData.employeeIDs,
            start: start.toISOString(),
            end: end.toISOString(),
            scheduleType: base.scheduleType,
            clientId: base.client?.id ?? null,
          }),
        }
      );

      if (!res.ok) {
        console.error("Constraint check failed:", await res.text());
        setConstraintLoading(false);
        return;
      }

      const data = (await res.json()) as ScheduleConstraintCheck;
      setConstraintSummary(data);
    } catch (err) {
      console.error("Constraint check error:", err);
    } finally {
      setConstraintLoading(false);
    }
  };

  useEffect(() => {
    if (!base) return;
    if (isPast) {
      setConstraintSummary(null);
      return;
    }
    // Run whenever employees or times change
    runConstraintCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    base,
    isPast,
    formData.startTime,
    formData.endTime,
    formData.employeeIDs.join(","),
  ]);

  const handleSave = async () => {
    try {
      const [sh, sm] = formData.startTime.split(":").map(Number);
      const [eh, em] = formData.endTime.split(":").map(Number);
      const start = new Date();
      start.setHours(sh, sm, 0, 0);
      const end = new Date();
      end.setHours(eh, em, 0, 0);

      if (end <= start) {
        toast.error("End time must be after start time");
        return;
      }

      if (
        constraintSummary &&
        constraintSummary.hardBlocks.length > 0 &&
        !constraintSummary.canSchedule
      ) {
        toast.error("Schedule has blocking conflicts. Please review.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/group/${schedule.createdScheduleID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeIDs: formData.employeeIDs,
            serviceId: formData.serviceId || null,
            officeReason: formData.officeReason || null,
            startTime: start,
            endTime: end,
            recurring: formData.recurring,
            recurringFrequency: formData.recurring
              ? formData.recurringFrequency
              : null,
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());
      toast.success("Schedules updated successfully");
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update schedules");
    }
  };

  const handleDelete = async (id: string, type: string, eventDate: string) => {
    const date = new Date(eventDate);
    if (date < now) {
      toast.error("Cannot delete schedules whose date has already passed");
      return;
    }

    const confirmed = confirm(
      type === "visit"
        ? "Deleting this schedule will NOT delete the linked visit. Continue?"
        : "Are you sure you want to delete this schedule?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/${id}/safe`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Schedule deleted");
        if (data.warning) toast.warning(data.warning);
        onClose();
        window.location.reload();
      } else toast.error(data.error || "Failed to delete");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting schedule");
    }
  };

  if (loading)
    return (
      <DialogContent>
        <p>Loading schedules...</p>
      </DialogContent>
    );

  return (
    <DialogContent className="max-w-3xl h-[85vh] flex flex-col overflow-hidden p-0">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <DialogHeader>
          <h2 className="text-lg font-semibold">Edit Schedule</h2>
        </DialogHeader>

        {/* Constraint summary */}
        {constraintSummary && !isPast && (
          <div className="space-y-1 text-xs mb-2">
            {constraintSummary.hardBlocks.length > 0 && (
              <div className="text-rose-600">
                <div className="font-semibold">Blocking Issues</div>
                <ul className="list-disc ml-4">
                  {constraintSummary.hardBlocks.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {constraintSummary.softWarnings.length > 0 && (
              <div className="text-amber-600">
                <div className="font-semibold">Warnings</div>
                <ul className="list-disc ml-4">
                  {constraintSummary.softWarnings.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {constraintSummary.hardBlocks.length === 0 &&
              constraintSummary.softWarnings.length === 0 && (
                <div className="text-emerald-600 font-medium">
                  No conflicts detected for the new time window.
                </div>
              )}
          </div>
        )}

        {/* Employees */}
        <div>
          <Label>Employees</Label>
          <div className="border p-2 rounded max-h-40 overflow-y-auto bg-gray-50">
            {employees.map((emp) => (
              <label key={emp.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  disabled={isPast}
                  checked={formData.employeeIDs.includes(emp.id)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...formData.employeeIDs, emp.id]
                      : formData.employeeIDs.filter((id) => id !== emp.id);
                    setFormData({ ...formData, employeeIDs: next });
                  }}
                />
                <span>{emp.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Service or Office Reason */}
        {base.scheduleType === "visit" ? (
          <div>
            <Label>Service</Label>
            <Select
              disabled={isPast}
              value={formData.serviceId}
              onValueChange={(v) => setFormData({ ...formData, serviceId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <Label>Office / Facility Reason</Label>
            <Input
              disabled={isPast}
              value={formData.officeReason}
              onChange={(e) =>
                setFormData({ ...formData, officeReason: e.target.value })
              }
              placeholder="Reason for schedule"
            />
          </div>
        )}

        {/* Time */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Start Time</Label>
            <Input
              type="time"
              disabled={isPast}
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
            />
          </div>
          <div className="flex-1">
            <Label>End Time</Label>
            <Input
              type="time"
              disabled={isPast}
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
            />
          </div>
        </div>

        {/* Recurring */}
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.recurring}
            onCheckedChange={(v) => setFormData({ ...formData, recurring: v })}
          />
          <Label>Recurring</Label>
          {formData.recurring && (
            <Select
              value={formData.recurringFrequency}
              onValueChange={(v) =>
                setFormData({ ...formData, recurringFrequency: v })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Delete buttons */}
        {!isPast && (
          <div className="pt-2 border-t">
            <Label className="block mb-1">Delete Schedules</Label>
            <div className="space-y-2">
              {groupSchedules.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center text-sm border p-2 rounded"
                >
                  <span>
                    {s.employee?.name || "Unassigned"} —{" "}
                    {new Date(s.eventDate).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleDelete(s.id, s.scheduleType, s.eventDate)
                    }
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="border-t bg-white sticky bottom-0 p-4 flex justify-end gap-2">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        {!isPast && (
          <Button
            onClick={handleSave}
            disabled={
              loading ||
              (!!constraintSummary &&
                constraintSummary.hardBlocks.length > 0 &&
                !constraintSummary.canSchedule)
            }
          >
            {constraintLoading ? "Checking..." : "Save Changes"}
          </Button>
        )}
        {isPast && (
          <p className="text-sm text-gray-500 italic ml-auto">
            Past schedules can only toggle recurring.
          </p>
        )}
      </DialogFooter>
    </DialogContent>
  );
}
// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   DialogContent,
//   DialogHeader,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { toast } from "sonner";

// type EditScheduleModalProps = {
//   schedule: any;
//   onClose: () => void;
// };

// export default function EditScheduleModal({
//   schedule,
//   onClose,
// }: EditScheduleModalProps) {
//   const [groupSchedules, setGroupSchedules] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
//     []
//   );
//   const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
//   const [services, setServices] = useState<{ id: string; name: string }[]>([]);
//   const [formData, setFormData] = useState({
//     employeeIDs: [] as string[],
//     serviceId: "",
//     officeReason: "",
//     startTime: "",
//     endTime: "",
//     recurring: false,
//     recurringFrequency: "WEEKLY",
//   });

//   const now = new Date();

//   useEffect(() => {
//     async function loadData() {
//       try {
//         const [groupRes, empRes, cliRes, svcRes] = await Promise.all([
//           fetch(
//             `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/group/${schedule.createdScheduleID}`
//           ),
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`),
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`),
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`),
//         ]);
//         const [group, emp, cli, svc] = await Promise.all([
//           groupRes.json(),
//           empRes.json(),
//           cliRes.json(),
//           svcRes.json(),
//         ]);

//         setGroupSchedules(group);
//         setEmployees(emp);
//         setClients(cli);
//         setServices(svc);

//         const base = group[0];
//         setFormData({
//           employeeIDs: group.map((s: any) => s.employee?.id).filter(Boolean),
//           serviceId: base?.service?.id || "",
//           officeReason: base?.officeReason || "",
//           startTime: new Date(base.startTime).toISOString().slice(11, 16),
//           endTime: new Date(base.endTime).toISOString().slice(11, 16),
//           recurring: base.recurring,
//           recurringFrequency: base.recurringFrequency || "WEEKLY",
//         });
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load schedule data");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadData();
//   }, [schedule.createdScheduleID]);

//   const handleSave = async () => {
//     try {
//       const [sh, sm] = formData.startTime.split(":").map(Number);
//       const [eh, em] = formData.endTime.split(":").map(Number);
//       const start = new Date();
//       start.setHours(sh, sm, 0, 0);
//       const end = new Date();
//       end.setHours(eh, em, 0, 0);

//       if (end <= start) {
//         toast.error("End time must be after start time");
//         return;
//       }

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/group/${schedule.createdScheduleID}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             employeeIDs: formData.employeeIDs,
//             serviceId: formData.serviceId || null,
//             officeReason: formData.officeReason || null,
//             startTime: start,
//             endTime: end,
//             recurring: formData.recurring,
//             recurringFrequency: formData.recurring
//               ? formData.recurringFrequency
//               : null,
//           }),
//         }
//       );

//       if (!res.ok) throw new Error(await res.text());
//       toast.success("Schedules updated successfully");
//       onClose();
//       window.location.reload();
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.message || "Failed to update schedules");
//     }
//   };

//   const handleDelete = async (id: string, type: string, eventDate: string) => {
//     const date = new Date(eventDate);
//     if (date < now) {
//       toast.error("Cannot delete schedules whose date has already passed");
//       return;
//     }

//     const confirmed = confirm(
//       type === "visit"
//         ? "Deleting this schedule will NOT delete the linked visit. Continue?"
//         : "Are you sure you want to delete this schedule?"
//     );
//     if (!confirmed) return;

//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/${id}/safe`,
//         {
//           method: "DELETE",
//         }
//       );
//       const data = await res.json();
//       if (res.ok) {
//         toast.success("Schedule deleted");
//         if (data.warning) toast.warning(data.warning);
//         onClose();
//         window.location.reload();
//       } else toast.error(data.error || "Failed to delete");
//     } catch (err) {
//       console.error(err);
//       toast.error("Error deleting schedule");
//     }
//   };

//   if (loading)
//     return (
//       <DialogContent>
//         <p>Loading schedules...</p>
//       </DialogContent>
//     );

//   const base = groupSchedules[0];
//   const isPast = base && new Date(base.eventDate) < now;

//   return (
//     <DialogContent className="max-w-3xl h-[85vh] flex flex-col overflow-hidden p-0">
//       <div className="flex-1 overflow-y-auto p-6 space-y-4">
//         <DialogHeader>
//           <h2 className="text-lg font-semibold">Edit Schedule</h2>
//         </DialogHeader>

//         {/* Employees */}
//         <div>
//           <Label>Employees</Label>
//           <div className="border p-2 rounded max-h-40 overflow-y-auto bg-gray-50">
//             {employees.map((emp) => (
//               <label key={emp.id} className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   disabled={isPast}
//                   checked={formData.employeeIDs.includes(emp.id)}
//                   onChange={(e) => {
//                     const next = e.target.checked
//                       ? [...formData.employeeIDs, emp.id]
//                       : formData.employeeIDs.filter((id) => id !== emp.id);
//                     setFormData({ ...formData, employeeIDs: next });
//                   }}
//                 />
//                 <span>{emp.name}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* Service or Office Reason */}
//         {base.scheduleType === "visit" ? (
//           <div>
//             <Label>Service</Label>
//             <Select
//               disabled={isPast}
//               value={formData.serviceId}
//               onValueChange={(v) => setFormData({ ...formData, serviceId: v })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Service" />
//               </SelectTrigger>
//               <SelectContent>
//                 {services.map((s) => (
//                   <SelectItem key={s.id} value={s.id}>
//                     {s.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         ) : (
//           <div>
//             <Label>Office / Facility Reason</Label>
//             <Input
//               disabled={isPast}
//               value={formData.officeReason}
//               onChange={(e) =>
//                 setFormData({ ...formData, officeReason: e.target.value })
//               }
//               placeholder="Reason for schedule"
//             />
//           </div>
//         )}

//         {/* Time */}
//         <div className="flex gap-4">
//           <div className="flex-1">
//             <Label>Start Time</Label>
//             <Input
//               type="time"
//               disabled={isPast}
//               value={formData.startTime}
//               onChange={(e) =>
//                 setFormData({ ...formData, startTime: e.target.value })
//               }
//             />
//           </div>
//           <div className="flex-1">
//             <Label>End Time</Label>
//             <Input
//               type="time"
//               disabled={isPast}
//               value={formData.endTime}
//               onChange={(e) =>
//                 setFormData({ ...formData, endTime: e.target.value })
//               }
//             />
//           </div>
//         </div>

//         {/* Recurring */}
//         <div className="flex items-center gap-2">
//           <Switch
//             checked={formData.recurring}
//             onCheckedChange={(v) => setFormData({ ...formData, recurring: v })}
//           />
//           <Label>Recurring</Label>
//           {formData.recurring && (
//             <Select
//               value={formData.recurringFrequency}
//               onValueChange={(v) =>
//                 setFormData({ ...formData, recurringFrequency: v })
//               }
//             >
//               <SelectTrigger className="w-32">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="WEEKLY">Weekly</SelectItem>
//                 <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
//               </SelectContent>
//             </Select>
//           )}
//         </div>

//         {/* Delete buttons for each schedule */}
//         {!isPast && (
//           <div className="pt-2 border-t">
//             <Label className="block mb-1">Delete Schedules</Label>
//             <div className="space-y-2">
//               {groupSchedules.map((s) => (
//                 <div
//                   key={s.id}
//                   className="flex justify-between items-center text-sm border p-2 rounded"
//                 >
//                   <span>
//                     {s.employee?.name || "Unassigned"} —{" "}
//                     {new Date(s.eventDate).toLocaleDateString()}
//                   </span>
//                   <Button
//                     size="sm"
//                     variant="destructive"
//                     onClick={() =>
//                       handleDelete(s.id, s.scheduleType, s.eventDate)
//                     }
//                   >
//                     Delete
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer fixed at bottom */}
//       <DialogFooter className="border-t bg-white sticky bottom-0 p-4 flex justify-end">
//         <DialogClose asChild>
//           <Button variant="outline">Cancel</Button>
//         </DialogClose>
//         {!isPast && <Button onClick={handleSave}>Save Changes</Button>}
//         {isPast && (
//           <p className="text-sm text-gray-500 italic ml-auto">
//             Past schedules can only toggle recurring.
//           </p>
//         )}
//       </DialogFooter>
//     </DialogContent>
//   );
// }
