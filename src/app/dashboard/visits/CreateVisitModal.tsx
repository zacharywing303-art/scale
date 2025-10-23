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
  const [services, setServices] = useState<any[]>([]);
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
  const [outDate, setOutDate] = useState<Date | null>(null);

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

      const [clientsRes, employeesRes, servicesRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/clients/agency/${user.agency.id}`
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employees/agency/${user.agency.id}`
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`),
      ]);

      setClients(await clientsRes.json());
      setEmployees(await employeesRes.json());
      setServices(await servicesRes.json());
    })();
  }, []);

  const handleCreateVisit = async () => {
    try {
      const user = getLoggedInUser();
      if (!user?.agency?.id) {
        alert("Missing agency information");
        return;
      }

      // Current date/time (used for validations)
      const now = new Date();

      if (!startDate) {
        alert("Please select a valid visit date");
        return;
      }

      // Base date (yyyy-mm-dd)
      const dateString = startDate.toISOString().split("T")[0];
      const callIn = new Date(`${dateString}T${timeIn}`);
      let callOut: Date | null = null;

      // If concluded, we allow cross-day end time
      if (isConcluded) {
        const outDateString = outDate
          ? outDate.toISOString().split("T")[0]
          : dateString; // defaults to same day
        callOut = new Date(`${outDateString}T${timeOut}`);
      }

      // ✅ Validation 1: callIn must not be in the future
      if (callIn > now) {
        alert("❌ You cannot create a visit that starts in the future.");
        return;
      }

      // ✅ Validation 2: callOut must not be in the future
      if (callOut && callOut > now) {
        alert("❌ You cannot end a visit in the future.");
        return;
      }

      // ✅ Validation 3: callOut must be after callIn
      if (callOut && callOut <= callIn) {
        alert("❌ The end time must be after the start time.");
        return;
      }

      // ✅ Construct payload
      const payload = {
        agencyID: user.agency.id,
        employeeId: selectedEmployee.id,
        clientId: selectedClient.id,
        callIn,
        callOut,
        serviceId: service || null,
        timeZone,
        location,
        groupVisitCode: groupCode,
        source: "manual",
        visitWithoutOutCallException: !callOut, // ✅ auto flag if missing
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
                <Select onValueChange={(val) => setService(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
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
              <>
                <div>
                  <Label>End Date</Label>
                  <DatePicker
                    selected={outDate}
                    onChange={setOutDate}
                    customInput={
                      <Input
                        placeholder="Select end date"
                        onClick={openCalendar}
                        readOnly
                      />
                    }
                    minDate={startDate ?? undefined} // prevent picking before start date
                    dateFormat="MM/dd/yyyy"
                  />
                </div>

                <div>
                  <Label>Time Out</Label>
                  <Input
                    type="time"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                  />
                </div>
              </>
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
