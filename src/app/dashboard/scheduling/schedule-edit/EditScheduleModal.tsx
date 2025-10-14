"use client";

import React, { useState, useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Schedule = {
  id: string;
  employee: string;
  type: string;
  client: string | null;
  service: string;
  scheduledIn: string;
  scheduledOut: string;
  dateFrom: string;
  dateTo: string;
  recurring: boolean;
};

type EditScheduleModalProps = {
  schedule: Schedule;
  onClose: () => void;
};

export default function EditScheduleModal({
  schedule,
  onClose,
}: EditScheduleModalProps) {
  const [formData, setFormData] = useState({
    ...schedule,
    dateFrom: new Date(schedule.dateFrom),
    dateTo: new Date(schedule.dateTo),
  });

  // New: dynamic options
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    []
  );
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [empRes, clientRes, serviceRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`),
        ]);

        if (!empRes.ok || !clientRes.ok || !serviceRes.ok) {
          throw new Error("Failed to fetch dropdown data");
        }

        const [empData, clientData, serviceData] = await Promise.all([
          empRes.json(),
          clientRes.json(),
          serviceRes.json(),
        ]);

        setEmployees(empData);
        setClients(clientData);
        setServices(serviceData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOptions();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: formData.type,
            employee: formData.employee,
            client: formData.client,
            service: formData.service,
            startTime: formData.scheduledIn,
            endTime: formData.scheduledOut,
            dateFrom: formData.dateFrom,
            dateTo: formData.dateTo,
            recurring: formData.recurring,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update schedule");

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving schedule");
    }
  };

  if (loading) {
    return (
      <DialogContent>
        <DialogHeader>
          <h2 className="text-lg font-semibold">Edit Schedule</h2>
        </DialogHeader>
        <p>Loading options...</p>
      </DialogContent>
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <h2 className="text-lg font-semibold">Edit Schedule</h2>
      </DialogHeader>

      <div className="space-y-4">
        {/* Employee */}
        <div>
          <Label className="mb-1 block">Employee</Label>
          <Select
            value={formData.employee}
            onValueChange={(val) => setFormData({ ...formData, employee: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client */}
        <div>
          <Label className="mb-1 block">Client</Label>
          <Select
            value={formData.client ?? ""}
            onValueChange={(val) => setFormData({ ...formData, client: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service */}
        <div>
          <Label className="mb-1 block">Service / Reason</Label>
          <Select
            value={formData.service}
            onValueChange={(val) => setFormData({ ...formData, service: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label className="mb-1 block">Scheduled In</Label>
            <Input
              type="time"
              value={formData.scheduledIn}
              onChange={(e) =>
                setFormData({ ...formData, scheduledIn: e.target.value })
              }
            />
          </div>
          <div className="flex-1">
            <Label className="mb-1 block">Scheduled Out</Label>
            <Input
              type="time"
              value={formData.scheduledOut}
              onChange={(e) =>
                setFormData({ ...formData, scheduledOut: e.target.value })
              }
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label className="mb-1 block">Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full text-left">
                  {format(formData.dateFrom, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dateFrom}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      dateFrom: date ?? formData.dateFrom,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1">
            <Label className="mb-1 block">Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full text-left">
                  {format(formData.dateTo, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dateTo}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      dateTo: date ?? formData.dateTo,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.recurring}
            onCheckedChange={(val) =>
              setFormData({ ...formData, recurring: val })
            }
          />
          <Label>Recurring</Label>
        </div>
      </div>

      <DialogFooter className="pt-4">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </DialogContent>
  );
}
