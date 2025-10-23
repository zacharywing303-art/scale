"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon } from "@radix-ui/react-icons";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

export default function CreateVisitModal() {
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [service, setService] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [location, setLocation] = useState("");
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const [isConcluded, setIsConcluded] = useState(false);

  const [clientSearch, setClientSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const calendarRef = useRef<any>(null);
  const openCalendar = () => calendarRef.current?.setOpen(true);

  const generateCode = () =>
    setGroupCode(Math.floor(100000 + Math.random() * 900000).toString());

  const isReadyToCreate =
    selectedClient &&
    selectedEmployee &&
    startDate &&
    timeIn &&
    service &&
    timeZone &&
    location &&
    (!isConcluded || (isConcluded && timeOut));

  // ✅ Load data on mount
  useEffect(() => {
    (async () => {
      const user = getLoggedInUser();
      if (!user?.agency?.id) return;

      const [clientsRes, employeesRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/clients/agency/${user.agency.id}`
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employees/agency/${user.agency.id}`
        ),
      ]);

      setClients(await clientsRes.json());
      setEmployees(await employeesRes.json());
    })();
  }, []);

  const handleCreateVisit = async () => {
    try {
      const user = getLoggedInUser();
      if (!user?.agency?.id) {
        alert("Missing agency information");
        return;
      }

      const dateString = startDate!.toISOString().split("T")[0];
      const callIn = new Date(`${dateString}T${timeIn}`);
      const callOut = timeOut ? new Date(`${dateString}T${timeOut}`) : null;

      const payload = {
        agencyID: user.agency.id,
        employeeId: selectedEmployee.id,
        clientId: selectedClient.id,
        callIn,
        callOut,
        service,
        timeZone,
        location,
        groupVisitCode: groupCode,
        source: "manual",
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create visit");

      alert("✅ Visit created successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error creating visit:", error);
      alert("❌ Error creating visit.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2" /> Create Visit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Visit</DialogTitle>
        </DialogHeader>

        {/* Step 1: Select Client */}
        {step === 1 && (
          <div className="space-y-4">
            <Label>Search Client</Label>
            <Input
              placeholder="Search by name, medicaid ID, supervisor, etc."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
            />
            <ScrollArea className="h-48 border rounded p-2">
              {(Array.isArray(clients) ? clients : [])
                .filter((c) =>
                  c.name?.toLowerCase().includes(clientSearch.toLowerCase())
                )
                .map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-2 rounded hover:bg-muted cursor-pointer ${
                      selectedClient?.id === client.id ? "bg-muted" : ""
                    }`}
                  >
                    {client.name} – {client.medicaidID}
                  </div>
                ))}
            </ScrollArea>
            <DialogFooter>
              <Button disabled={!selectedClient} onClick={() => setStep(2)}>
                Next
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 2: Select Employee */}
        {step === 2 && (
          <div className="space-y-4">
            <Label>Search Employee</Label>
            <Input
              placeholder="Search by name or employee ID"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
            />
            <ScrollArea className="h-48 border rounded p-2">
              {(Array.isArray(employees) ? employees : [])
                .filter((emp) =>
                  emp.name?.toLowerCase().includes(employeeSearch.toLowerCase())
                )
                .map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`p-2 rounded hover:bg-muted cursor-pointer ${
                      selectedEmployee?.id === emp.id ? "bg-muted" : ""
                    }`}
                  >
                    {emp.name}
                  </div>
                ))}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button disabled={!selectedEmployee} onClick={() => setStep(3)}>
                Next
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Visit Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                customInput={
                  <Input
                    placeholder="Select date"
                    onClick={openCalendar}
                    readOnly
                  />
                }
                ref={calendarRef}
                dateFormat="MM/dd/yyyy"
              />
              <Button variant="ghost" onClick={openCalendar}>
                <CalendarIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Time In</Label>
                <Input
                  type="time"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                />
              </div>
              <div>
                <Label>Service</Label>
                <Select onValueChange={setService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal Care">Personal Care</SelectItem>
                    <SelectItem value="Companionship">Companionship</SelectItem>
                    <SelectItem value="Transportation">
                      Transportation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Time Zone</Label>
                <Select onValueChange={setTimeZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EST">EST</SelectItem>
                    <SelectItem value="CST">CST</SelectItem>
                    <SelectItem value="MST">MST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Select onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Label>Group Visit Code</Label>
              <Button variant="outline" onClick={generateCode}>
                Generate
              </Button>
              {groupCode && <span className="font-mono">{groupCode}</span>}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={isConcluded}
                onCheckedChange={() => setIsConcluded(!isConcluded)}
              />
              <Label>Has this visit already concluded?</Label>
            </div>

            {isConcluded && (
              <div>
                <Label>Time Out</Label>
                <Input
                  type="time"
                  value={timeOut}
                  onChange={(e) => setTimeOut(e.target.value)}
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleCreateVisit} disabled={!isReadyToCreate}>
                Create Visit
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
// "use client";

// import React, { useState, useRef } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectItem,
//   SelectContent,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";
// import { PlusIcon } from "@radix-ui/react-icons";
// import { CalendarIcon } from "lucide-react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// // Mock data
// const mockClients = [
//   {
//     id: "CL001",
//     firstName: "John",
//     lastName: "Doe",
//     medicaidId: "M123",
//     supervisor: "Jane Smith",
//     payer: "Medicare",
//   },
//   {
//     id: "CL002",
//     firstName: "Alice",
//     lastName: "Johnson",
//     medicaidId: "M456",
//     supervisor: "Mark Green",
//     payer: "Private",
//   },
// ];

// const mockEmployees = [
//   { id: "EMP001", firstName: "Samantha", lastName: "Lee" },
//   { id: "EMP002", firstName: "Brian", lastName: "Kim" },
// ];

// export default function CreateVisitModal() {
//   const [step, setStep] = useState(1);
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const calendarRef = useRef<any>(null);

//   const openCalendar = () => {
//     if (calendarRef.current) {
//       calendarRef.current.setOpen(true);
//     }
//   };

//   // Client filter
//   const [clientSearch, setClientSearch] = useState("");
//   const filteredClients = mockClients.filter((client) =>
//     [
//       client.firstName,
//       client.lastName,
//       client.medicaidId,
//       client.supervisor,
//       client.payer,
//       client.id,
//     ]
//       .join(" ")
//       .toLowerCase()
//       .includes(clientSearch.toLowerCase())
//   );
//   type Client = {
//     id: string;
//     firstName: string;
//     lastName: string;
//     medicaidId: string;
//     supervisor: string;
//     payer: string;
//   };
//   const [selectedClient, setSelectedClient] = useState<Client | null>(null);

//   // Employee filter
//   const [employeeSearch, setEmployeeSearch] = useState("");
//   const filteredEmployees = mockEmployees.filter((emp) =>
//     [emp.firstName, emp.lastName, emp.id]
//       .join(" ")
//       .toLowerCase()
//       .includes(employeeSearch.toLowerCase())
//   );
//   const [selectedEmployee, setSelectedEmployee] = useState<{
//     id: string;
//     firstName: string;
//     lastName: string;
//   } | null>(null);

//   // Visit details
//   const [visitDate, setVisitDate] = useState<Date | undefined>();
//   const [timeIn, setTimeIn] = useState("");
//   const [timeOut, setTimeOut] = useState("");
//   const [service, setService] = useState("");
//   const [timeZone, setTimeZone] = useState("");
//   const [location, setLocation] = useState("");
//   const [groupCode, setGroupCode] = useState<string | null>(null);
//   const [isConcluded, setIsConcluded] = useState(false);

//   const generateCode = () => {
//     setGroupCode(Math.floor(100000 + Math.random() * 900000).toString());
//   };

//   const isReadyToCreate =
//     selectedClient &&
//     selectedEmployee &&
//     visitDate &&
//     timeIn &&
//     service &&
//     timeZone &&
//     location &&
//     (!isConcluded || (isConcluded && timeOut));

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button>
//           <PlusIcon className="mr-2" />
//           Create Visit
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Create New Visit</DialogTitle>
//         </DialogHeader>

//         {step === 1 && (
//           <div className="space-y-4">
//             <Label>Search Client</Label>
//             <Input
//               placeholder="Search by name, medicaid ID, supervisor, etc."
//               value={clientSearch}
//               onChange={(e) => setClientSearch(e.target.value)}
//             />
//             <ScrollArea className="h-48 border rounded p-2">
//               {filteredClients.map((client) => (
//                 <div
//                   key={client.id}
//                   onClick={() => setSelectedClient(client)}
//                   className={`p-2 rounded hover:bg-muted cursor-pointer ${
//                     selectedClient?.id === client.id ? "bg-muted" : ""
//                   }`}
//                 >
//                   {client.firstName} {client.lastName} – {client.medicaidId}
//                 </div>
//               ))}
//             </ScrollArea>
//             <DialogFooter>
//               <Button disabled={!selectedClient} onClick={() => setStep(2)}>
//                 Next
//               </Button>
//             </DialogFooter>
//           </div>
//         )}

//         {step === 2 && (
//           <div className="space-y-4">
//             <Label>Search Employee</Label>
//             <Input
//               placeholder="Search by name or employee ID"
//               value={employeeSearch}
//               onChange={(e) => setEmployeeSearch(e.target.value)}
//             />
//             <ScrollArea className="h-48 border rounded p-2">
//               {filteredEmployees.map((emp) => (
//                 <div
//                   key={emp.id}
//                   onClick={() => setSelectedEmployee(emp)}
//                   className={`p-2 rounded hover:bg-muted cursor-pointer ${
//                     selectedEmployee?.id === emp.id ? "bg-muted" : ""
//                   }`}
//                 >
//                   {emp.firstName} {emp.lastName} – {emp.id}
//                 </div>
//               ))}
//             </ScrollArea>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setStep(1)}>
//                 Back
//               </Button>
//               <Button disabled={!selectedEmployee} onClick={() => setStep(3)}>
//                 Next
//               </Button>
//             </DialogFooter>
//           </div>
//         )}

//         {step === 3 && (
//           <div className="space-y-4">
//             <div>
//               <Label className="mb-1">Date</Label>
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 customInput={
//                   <Input
//                     placeholder="Select date"
//                     onClick={openCalendar}
//                     readOnly
//                   />
//                 }
//                 ref={calendarRef}
//                 dateFormat="MM/dd/yyyy"
//               />
//               <Button type="button" variant="ghost" onClick={openCalendar}>
//                 <CalendarIcon className="h-5 w-5" />
//               </Button>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label className="mb-1">Time In</Label>
//                 <Input
//                   type="time"
//                   value={timeIn}
//                   onChange={(e) => setTimeIn(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label className="mb-1">Service</Label>
//                 <Select onValueChange={setService}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select service" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Service A">Service A</SelectItem>
//                     <SelectItem value="Service B">Service B</SelectItem>
//                     <SelectItem value="Service C">Service C</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label className="mb-1">Time Zone</Label>
//                 <Select onValueChange={setTimeZone}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select time zone" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="EST">EST</SelectItem>
//                     <SelectItem value="CST">CST</SelectItem>
//                     <SelectItem value="MST">MST</SelectItem>
//                     <SelectItem value="PST">PST</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <Label className="mb-1">Location</Label>
//                 <Select onValueChange={setLocation}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select location" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="home">Home</SelectItem>
//                     <SelectItem value="community">Community</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Group Visit Code */}
//             <div className="flex items-center gap-4">
//               <Label>Group Visit Code</Label>
//               <Button type="button" variant="outline" onClick={generateCode}>
//                 Generate
//               </Button>
//               {groupCode && <span className="font-mono">{groupCode}</span>}
//             </div>

//             {/* Already Concluded */}
//             <div className="flex items-center gap-2">
//               <Checkbox
//                 checked={isConcluded}
//                 onCheckedChange={() => setIsConcluded(!isConcluded)}
//               />
//               <Label>Has this visit already concluded?</Label>
//             </div>

//             {isConcluded && (
//               <div>
//                 <Label>Time Out</Label>
//                 <Input
//                   type="time"
//                   value={timeOut}
//                   onChange={(e) => setTimeOut(e.target.value)}
//                 />
//               </div>
//             )}

//             <DialogFooter className="pt-4">
//               <Button variant="outline" onClick={() => setStep(2)}>
//                 Back
//               </Button>
//               <Button disabled={!isReadyToCreate}>Create Visit</Button>
//             </DialogFooter>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
