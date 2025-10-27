"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { useState, useEffect } from "react";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

export default function CreateClientModal({
  onClientCreated,
}: {
  onClientCreated?: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [medicaidId, setMedicaidId] = useState("");
  const [program, setProgram] = useState("");
  const [supervisor, setSupervisor] = useState<string | null>(null);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);

  const user = getLoggedInUser();

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!user?.agency?.id) {
        alert(
          "Missing agency ID — please re-login or check agency assignment."
        );
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/programs/agency/${user.agency.id}`
        );
        const data = await res.json();
        setPrograms(data);
      } catch (err) {
        console.error("Error fetching programs:", err);
      }
    };
    fetchPrograms();
  }, [user]);

  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!user?.agency?.id) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employees/agency/${user.agency.id}`
        );
        const data = await res.json();
        const supervisorsOnly = data.filter((emp: any) => emp.isSupervisor);
        setSupervisors(supervisorsOnly);
      } catch (err) {
        console.error("Error loading supervisors:", err);
      }
    };
    fetchSupervisors();
  }, [user]);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !medicaidId) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      name: `${firstName} ${lastName}`,
      medicaidID: medicaidId,
      agencyID: user?.agency?.id,
      supervisor: supervisor || null,
      programID: program || null,
      status: "active",
      ssn: "000-00-0000",
      gender: "Unknown",
      languages: [],
      mainPhone: "",
      email: "",
      dateOfBirth: new Date().toISOString(),
      clientID: Math.floor(100000 + Math.random() * 900000).toString(),
    };

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to create client");
      alert("✅ Client created successfully!");
      onClientCreated?.();
    } catch (err) {
      console.error(err);
      alert("❌ Error creating client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Create New Client</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-1">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1">
              Medicaid ID <span className="text-red-500">*</span>
            </Label>
            <Input
              value={medicaidId}
              onChange={(e) => setMedicaidId(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1">Program (optional)</Label>
            <Select value={program} onValueChange={setProgram}>
              <SelectTrigger>
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
                {programs.length > 0 ? (
                  programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name || "Unnamed Program"}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No programs found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1">Supervisor (optional)</Label>
            <Select
              value={supervisor || ""}
              onValueChange={(val) => setSupervisor(val || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogTrigger,
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
// import { useState } from "react";

// export default function CreateClientModal() {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [medicaidId, setMedicaidId] = useState("");
//   const [program, setProgram] = useState("");

//   const handleSubmit = () => {
//     // TODO: Connect to backend logic
//     console.log({ firstName, lastName, medicaidId, program });
//   };

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="default">Create New Client</Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Create New Client</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <div>
//             <Label className="mb-1">First Name</Label>
//             <Input
//               value={firstName}
//               onChange={(e) => setFirstName(e.target.value)}
//             />
//           </div>
//           <div>
//             <Label className="mb-1">Last Name</Label>
//             <Input
//               value={lastName}
//               onChange={(e) => setLastName(e.target.value)}
//             />
//           </div>
//           <div>
//             <Label className="mb-1">Medicaid ID</Label>
//             <Input
//               value={medicaidId}
//               onChange={(e) => setMedicaidId(e.target.value)}
//             />
//           </div>
//           <div>
//             <Label className="mb-1">Program</Label>
//             <Select value={program} onValueChange={(val) => setProgram(val)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Program" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="programA">Program A</SelectItem>
//                 <SelectItem value="programB">Program B</SelectItem>
//                 <SelectItem value="programC">Program C</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         <DialogFooter className="pt-4">
//           <Button type="submit" onClick={handleSubmit}>
//             Save
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
