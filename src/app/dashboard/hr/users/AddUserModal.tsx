"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: () => void; // ✅ callback to refresh parent list
}

export default function AddUserModal({
  open,
  onClose,
  onUserAdded,
}: AddUserModalProps) {
  const [useExisting, setUseExisting] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getLoggedInUser();
    setCurrentUser(user);
  }, []);

  // ✅ Fetch employees and roles
  useEffect(() => {
    if (!open || !currentUser?.agency?.id) return;

    const loadData = async () => {
      try {
        const agencyId = currentUser.agency.id;

        const [empRes, roleRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/employees?agencyId=${agencyId}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/roles?agencyId=${agencyId}`
          ),
        ]);

        const [empData, roleData] = await Promise.all([
          empRes.json(),
          roleRes.json(),
        ]);

        setEmployees(empData || []);
        setRoles(roleData || []);
      } catch (err) {
        console.error("Failed to load employees or roles:", err);
      }
    };

    loadData();
  }, [open, currentUser]);

  const handleSubmit = async () => {
    if (!selectedRoleId) {
      alert("Please select a role for this user.");
      return;
    }

    setLoading(true);
    try {
      const agencyId = currentUser.agency.id;

      let userData;

      if (useExisting) {
        const employee = employees.find((e) => e.id === selectedEmployeeId);
        if (!employee) {
          alert("Please select an employee.");
          setLoading(false);
          return;
        }

        // ✅ Create user from employee
        userData = {
          name: employee.name,
          email: employee.email,
          phone: employee.mainPhone,
          agencyId,
          roleTypeId: selectedRoleId,
          password: "Temp123!", // or send invite flow
        };
      } else {
        // ✅ Create new manual user
        userData = {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          agencyId,
          roleTypeId: selectedRoleId,
          password: "Temp123!",
        };
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create user");
      }

      onUserAdded(); // refresh parent list
      onClose();
    } catch (err: any) {
      console.error("Error creating user:", err);
      alert(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add User to Role</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Toggle between Existing / New */}
          <div className="flex gap-2">
            <Button
              variant={useExisting ? "default" : "outline"}
              onClick={() => setUseExisting(true)}
            >
              Select Existing Employee
            </Button>
            <Button
              variant={!useExisting ? "default" : "outline"}
              onClick={() => setUseExisting(false)}
            >
              Add New User
            </Button>
          </div>

          {/* Select existing employee */}
          {useExisting ? (
            <div>
              <Label className="mb-1">Select Employee</Label>
              <Select onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              {/* Manual form */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Select Role */}
          <div>
            <Label className="mb-1">Assign Role</Label>
            <Select onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface AddUserModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (user: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//   }) => void;
//   existingEmployees: { id: string; name: string }[];
// }

// export default function AddUserModal({
//   open,
//   onClose,
//   onSubmit,
//   existingEmployees,
// }: AddUserModalProps) {
//   const [useExisting, setUseExisting] = useState(true);
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [form, setForm] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//   });

//   const handleSubmit = () => {
//     if (!useExisting) {
//       onSubmit(form);
//     } else {
//       const [firstName, lastName] = selectedEmployee.split(" ");
//       onSubmit({ firstName, lastName, email: "", phone: "" }); // fill if needed
//     }
//     setForm({ firstName: "", lastName: "", email: "", phone: "" });
//     onClose();
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Add User to Role</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <div className="flex gap-2">
//             <Button
//               variant={useExisting ? "default" : "outline"}
//               onClick={() => setUseExisting(true)}
//             >
//               Select Existing
//             </Button>
//             <Button
//               variant={!useExisting ? "default" : "outline"}
//               onClick={() => setUseExisting(false)}
//             >
//               Add New
//             </Button>
//           </div>

//           {useExisting ? (
//             <div>
//               <Label className="mb-1">Select Employee</Label>
//               <Select onValueChange={(val) => setSelectedEmployee(val)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select employee" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {existingEmployees.map((emp) => (
//                     <SelectItem key={emp.id} value={emp.name}>
//                       {emp.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <Label className="mb-1">First Name</Label>
//                   <Input
//                     value={form.firstName}
//                     onChange={(e) =>
//                       setForm({ ...form, firstName: e.target.value })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <Label className="mb-1">Last Name</Label>
//                   <Input
//                     value={form.lastName}
//                     onChange={(e) =>
//                       setForm({ ...form, lastName: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>
//               <div>
//                 <Label className="mb-1">Email</Label>
//                 <Input
//                   value={form.email}
//                   onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <Label className="mb-1">Phone</Label>
//                 <Input
//                   value={form.phone}
//                   onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                 />
//               </div>
//             </>
//           )}
//         </div>

//         <DialogFooter className="pt-4">
//           <Button onClick={handleSubmit}>Add</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
