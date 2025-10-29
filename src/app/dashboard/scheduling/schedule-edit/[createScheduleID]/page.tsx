// Removed file: src/app/dashboard/scheduling/schedule-edit/[createScheduleID]/page.tsx
// This file has been deleted and is no longer part of the codebase.
// Below is the content that was in the deleted file:
// We may want to restore this in the future.

// "use client";

// import React, { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
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
// import { ArrowLeft } from "lucide-react";

// export default function EditScheduleGroupPage() {
//   const { createdScheduleID } = useParams();
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [groupSchedules, setGroupSchedules] = useState<any[]>([]);
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
//             `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/group/${createdScheduleID}`
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
//           startTime: base?.startTime
//             ? new Date(base.startTime).toISOString().slice(11, 16)
//             : now.toISOString().slice(11, 16),
//           endTime: base?.endTime
//             ? new Date(base.endTime).toISOString().slice(11, 16)
//             : now.toISOString().slice(11, 16),
//           recurring: !!base?.recurring,
//           recurringFrequency: base?.recurringFrequency || "WEEKLY",
//         });
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load schedule data");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadData();
//   }, [createdScheduleID]);

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
//         `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/group/${createdScheduleID}`,
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
//       router.push("/system_admin/schedule-edit");
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
//         router.refresh();
//       } else toast.error(data.error || "Failed to delete");
//     } catch (err) {
//       console.error(err);
//       toast.error("Error deleting schedule");
//     }
//   };

//   if (loading) return <p className="p-6 text-gray-500">Loading schedule...</p>;

//   const base = groupSchedules[0];
//   const isPast = base && new Date(base.eventDate) < now;

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.back()}
//             className="flex items-center gap-2"
//           >
//             <ArrowLeft size={16} /> Back
//           </Button>
//           <h1 className="text-xl font-semibold">
//             Edit Schedule — {base?.client?.name || "No Client"}
//           </h1>
//         </div>
//       </div>

//       <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
//         {/* Employees */}
//         <div>
//           <Label>Employees</Label>
//           <div className="border p-3 rounded max-h-52 overflow-auto bg-gray-50">
//             {employees.map((emp) => (
//               <label key={emp.id} className="flex items-center space-x-2 py-1">
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

//         {/* Service / Reason */}
//         {base?.scheduleType === "visit" ? (
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

//         {/* Delete individual schedules */}
//         {!isPast && (
//           <div className="pt-2 border-t">
//             <Label className="block mb-2 font-medium">Delete Schedules</Label>
//             <div className="space-y-2">
//               {groupSchedules.map((s) => (
//                 <div
//                   key={s.id}
//                   className="flex justify-between items-center border p-2 rounded text-sm"
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

//         <div className="flex justify-end items-center gap-3 border-t pt-4">
//           <Button variant="outline" onClick={() => router.back()}>
//             Cancel
//           </Button>
//           {!isPast && <Button onClick={handleSave}>Save Changes</Button>}
//           {isPast && (
//             <p className="text-sm text-gray-500 italic">
//               Past schedules can only toggle recurring.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
