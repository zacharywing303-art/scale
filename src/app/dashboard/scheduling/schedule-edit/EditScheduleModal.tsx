"use client";

import React, { useState } from "react";
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
  id: number;
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

const mockEmployees = ["Jane Doe", "Mark Johnson", "Alice Smith"];
const mockClients = ["John Smith", "Martha Wayne", "Bruce Banner"];
const mockServices = ["IHCS Level 1", "Team Meeting", "Wound Care"];

export default function EditScheduleModal({
  schedule,
  onClose,
}: EditScheduleModalProps) {
  const [formData, setFormData] = useState({
    ...schedule,
    dateFrom: new Date(schedule.dateFrom),
    dateTo: new Date(schedule.dateTo),
  });

  const handleSave = () => {
    alert(`Schedule for ${formData.employee} updated (not yet saved)`);
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <h2 className="text-lg font-semibold">Edit Schedule</h2>
      </DialogHeader>

      <div className="space-y-4">
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
              {mockEmployees.map((emp) => (
                <SelectItem key={emp} value={emp}>
                  {emp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1 block">Type</Label>
          <Input
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
        </div>

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
              {mockClients.map((client) => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              {mockServices.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
