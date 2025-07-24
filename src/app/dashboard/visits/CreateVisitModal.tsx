"use client";

import React, { useState, useRef } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { PlusIcon } from "@radix-ui/react-icons";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Mock data
const mockClients = [
  {
    id: "CL001",
    firstName: "John",
    lastName: "Doe",
    medicaidId: "M123",
    supervisor: "Jane Smith",
    payer: "Medicare",
  },
  {
    id: "CL002",
    firstName: "Alice",
    lastName: "Johnson",
    medicaidId: "M456",
    supervisor: "Mark Green",
    payer: "Private",
  },
];

const mockEmployees = [
  { id: "EMP001", firstName: "Samantha", lastName: "Lee" },
  { id: "EMP002", firstName: "Brian", lastName: "Kim" },
];

export default function CreateVisitModal() {
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const calendarRef = useRef<any>(null);

  const openCalendar = () => {
    if (calendarRef.current) {
      calendarRef.current.setOpen(true);
    }
  };

  // Client filter
  const [clientSearch, setClientSearch] = useState("");
  const filteredClients = mockClients.filter((client) =>
    [
      client.firstName,
      client.lastName,
      client.medicaidId,
      client.supervisor,
      client.payer,
      client.id,
    ]
      .join(" ")
      .toLowerCase()
      .includes(clientSearch.toLowerCase())
  );
  type Client = {
    id: string;
    firstName: string;
    lastName: string;
    medicaidId: string;
    supervisor: string;
    payer: string;
  };
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Employee filter
  const [employeeSearch, setEmployeeSearch] = useState("");
  const filteredEmployees = mockEmployees.filter((emp) =>
    [emp.firstName, emp.lastName, emp.id]
      .join(" ")
      .toLowerCase()
      .includes(employeeSearch.toLowerCase())
  );
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  // Visit details
  const [visitDate, setVisitDate] = useState<Date | undefined>();
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [service, setService] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [location, setLocation] = useState("");
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const [isConcluded, setIsConcluded] = useState(false);

  const generateCode = () => {
    setGroupCode(Math.floor(100000 + Math.random() * 900000).toString());
  };

  const isReadyToCreate =
    selectedClient &&
    selectedEmployee &&
    visitDate &&
    timeIn &&
    service &&
    timeZone &&
    location &&
    (!isConcluded || (isConcluded && timeOut));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2" />
          Create Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Visit</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <Label>Search Client</Label>
            <Input
              placeholder="Search by name, medicaid ID, supervisor, etc."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
            />
            <ScrollArea className="h-48 border rounded p-2">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-2 rounded hover:bg-muted cursor-pointer ${
                    selectedClient?.id === client.id ? "bg-muted" : ""
                  }`}
                >
                  {client.firstName} {client.lastName} – {client.medicaidId}
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

        {step === 2 && (
          <div className="space-y-4">
            <Label>Search Employee</Label>
            <Input
              placeholder="Search by name or employee ID"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
            />
            <ScrollArea className="h-48 border rounded p-2">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`p-2 rounded hover:bg-muted cursor-pointer ${
                    selectedEmployee?.id === emp.id ? "bg-muted" : ""
                  }`}
                >
                  {emp.firstName} {emp.lastName} – {emp.id}
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

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1">Date</Label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
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
              <Button type="button" variant="ghost" onClick={openCalendar}>
                <CalendarIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1">Time In</Label>
                <Input
                  type="time"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1">Service</Label>
                <Select onValueChange={setService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Service A">Service A</SelectItem>
                    <SelectItem value="Service B">Service B</SelectItem>
                    <SelectItem value="Service C">Service C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1">Time Zone</Label>
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
                <Label className="mb-1">Location</Label>
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

            {/* Group Visit Code */}
            <div className="flex items-center gap-4">
              <Label>Group Visit Code</Label>
              <Button type="button" variant="outline" onClick={generateCode}>
                Generate
              </Button>
              {groupCode && <span className="font-mono">{groupCode}</span>}
            </div>

            {/* Already Concluded */}
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

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button disabled={!isReadyToCreate}>Create Visit</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
