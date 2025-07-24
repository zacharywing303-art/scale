"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Section from "@/components/custom/Section";

interface GeneralTabProps {
  visit: any;
}

export default function GeneralTab({ visit }: GeneralTabProps) {
  return (
    <div className="space-y-6 p-4 overflow-auto max-h-[80vh]">
      <Section title="Uneditable Visit Info">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Label htmlFor="scheduled-in-time">Scheduled In Time</Label>
          <Input id="scheduled-in-time" disabled value="8:00 AM" />
          <Label htmlFor="scheduled-out-time">Scheduled Out Time</Label>
          <Input id="scheduled-out-time" disabled value="10:00 AM" />

          <Label htmlFor="scheduled-hours">Scheduled Hours</Label>
          <Input id="scheduled-hours" disabled value="2.0" />

          <Label htmlFor="visit-from">Visit From</Label>
          <Input id="visit-from" disabled value="2025-07-21" />

          <Label htmlFor="visit-to">Visit To</Label>
          <Input id="visit-to" disabled value="2025-07-21" />

          <Label htmlFor="time-zone">Time Zone</Label>
          <Input id="time-zone" disabled value="EST" />

          <Label htmlFor="status">Status</Label>
          <Input id="status" disabled value="Completed" />

          <Label htmlFor="call-in">Call In</Label>
          <Input id="call-in" disabled value="8:05 AM" />

          <Label htmlFor="call-out">Call Out</Label>
          <Input id="call-out" disabled value="10:02 AM" />

          <Label htmlFor="call-hours">Call Hours</Label>
          <Input id="call-hours" disabled value="1.95" />

          <Label htmlFor="units">Units</Label>
          <Input id="units" disabled value="4" />

          <Label htmlFor="agency-id">Agency ID</Label>
          <Input id="agency-id" disabled value="AG1234" />

          <Label htmlFor="agency-name">Agency Name</Label>
          <Input id="agency-name" disabled value="CareLink Services" />

          <Label htmlFor="client-verified-time">Client Verified Time</Label>
          <Input id="client-verified-time" disabled value="8:05 AM" />

          <Label htmlFor="client-verified-service">
            Client Verified Service
          </Label>
          <Input id="client-verified-service" disabled value="Personal Care" />

          <Label htmlFor="client-signature">Client Signature</Label>
          <Input id="client-signature" disabled value="Signed" />

          <Label htmlFor="visit-source">Visit Source</Label>
          <Input id="visit-source" disabled value="Mobile App" />

          <Label htmlFor="schedule-id">Schedule ID</Label>
          <Input id="schedule-id" disabled value="SCH3245" />
          <div className="flex items-center gap-2">
            <Checkbox checked disabled id="approved" />
            <Label htmlFor="approved">Approved</Label>
          </div>
        </div>
      </Section>

      <Section title="Editable Visit Info">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Label htmlFor="adjusted-in-date">Adjusted In Date</Label>
          <Input type="date" id="adjusted-in-date" />

          <Label htmlFor="adjusted-in-time">Adjusted In Time</Label>
          <Input type="time" id="adjusted-in-time" />

          <Label htmlFor="adjusted-out-date">Adjusted Out Date</Label>
          <Input type="date" id="adjusted-out-date" />

          <Label htmlFor="adjusted-out-time">Adjusted Out Time</Label>
          <Input type="time" id="adjusted-out-time" />

          <Label htmlFor="bill-hours">Bill Hours</Label>
          <Input type="number" id="bill-hours" />

          <Label htmlFor="pay-hours">Pay Hours</Label>
          <Input type="number" id="pay-hours" />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Payer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medicaid">Medicaid</SelectItem>
              <SelectItem value="private">Private Insurance</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="care1">Care Plan A</SelectItem>
              <SelectItem value="care2">Care Plan B</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal Care</SelectItem>
              <SelectItem value="nursing">Nursing</SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="group-visit-code">Group Visit Code</Label>
          <Input id="group-visit-code" placeholder="ABC123" />
          <div className="flex items-center gap-2">
            <Checkbox id="do-not-bill" />
            <Label htmlFor="do-not-bill">Do Not Bill</Label>
          </div>
        </div>
        <Button variant="outline" className="mt-4">
          Generate Visit Code
        </Button>
      </Section>
    </div>
  );
}
