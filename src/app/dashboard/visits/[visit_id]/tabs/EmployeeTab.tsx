"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Section from "@/components/custom/Section";
import { Label } from "@/components/ui/label";

interface EmployeeTabProps {
  visit: any;
}

export default function EmployeeTab({ visit }: EmployeeTabProps) {
  return (
    <div className="space-y-6 p-4">
      <Section title="Employee Information">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Label htmlFor="employee-name">Employee Name</Label>
          <Input id="employee-name" value="Maria Smith" disabled />
          <Label htmlFor="employee-id">Employee ID</Label>
          <Input id="employee-id" value="EMP456" disabled />
          <Label htmlFor="discipline">Discipline</Label>
          <Input id="discipline" value="Nurse" disabled />
        </div>
      </Section>

      <Section title="Change Employee">
        <div className="flex flex-wrap gap-4 items-end">
          <Input
            placeholder="Search by name or ID"
            className="w-full md:w-1/2"
          />
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Discipline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nurse">Nurse</SelectItem>
              <SelectItem value="aide">Aide</SelectItem>
            </SelectContent>
          </Select>
          <Button>Search & Change</Button>
        </div>
      </Section>
    </div>
  );
}
