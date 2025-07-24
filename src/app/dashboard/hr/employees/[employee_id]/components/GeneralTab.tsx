"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import SaveChangesButton from "./SaveChangesButton";

export default function EmployeeGeneralTab() {
  const [showSSN, setShowSSN] = useState(false);

  return (
    <ScrollArea className="p-4 space-y-6">
      {/* Employee Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editable Fields */}
        <div>
          <Label className="mb-1">First Name</Label>
          <Input placeholder="First Name" />
        </div>
        <div>
          <Label className="mb-1">Last Name</Label>
          <Input placeholder="Last Name" />
        </div>
        <div>
          <Label className="mb-1">Title</Label>
          <Input placeholder="Title" />
        </div>
        <div>
          <Label className="mb-1">Middle Initial</Label>
          <Input placeholder="M.I." />
        </div>
        <div>
          <Label className="mb-1">Suffix</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select suffix" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Jr.">Jr.</SelectItem>
              <SelectItem value="Sr.">Sr.</SelectItem>
              <SelectItem value="II">II</SelectItem>
              <SelectItem value="III">III</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1">Gender</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1">Birth Date</Label>
          <Input type="date" />
        </div>
        <div>
          <Label className="mb-1">Primary Language</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Read-only Fields */}
        <div>
          <Label className="mb-1">Employee ID</Label>
          <Input value="EMP12345" disabled />
        </div>
        <div>
          <Label className="mb-1">Last 5 of SSN</Label>
          <div className="relative">
            <Input
              type={showSSN ? "text" : "password"}
              value="54321"
              disabled
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowSSN(!showSSN)}
            >
              {showSSN ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <Label className="mb-1">Primary Phone</Label>
          <Input placeholder="(123) 456-7890" />
        </div>
        <div>
          <Label className="mb-1">Primary Email</Label>
          <Input placeholder="email@example.com" />
        </div>
        <div>
          <Label className="mb-1">Other ID</Label>
          <Input placeholder="e.g. HR ID" />
        </div>
        <div>
          <Label className="mb-1">Other Languages</Label>
          <Input placeholder="Other Languages" />
        </div>
      </div>

      {/* Address Selection */}
      <div className="space-y-2">
        <Label className="mb-1">Address</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select unit type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Address Line 1" />
        <Input placeholder="Address Line 2" />
        <Input placeholder="Address Line 3" />
        <Input placeholder="City" />
        <Input placeholder="State" />
        <Input placeholder="Zip Code" />
      </div>

      {/* Agency Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1">Status</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1">Position</Label>
          <Input placeholder="Position title" />
        </div>
        <div>
          <Label className="mb-1">Supervisor</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">John Smith</SelectItem>
              <SelectItem value="2">Jane Doe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1">Hire Date</Label>
          <Input type="date" />
        </div>
        <div>
          <Label className="mb-1">Effective Date</Label>
          <Input
            type="date"
            disabled
            value={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <Label className="mb-1">National Provider ID</Label>
          <Input placeholder="NPI #" />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="flex items-center gap-2">
          <Checkbox id="mobile-user" />
          <Label htmlFor="mobile-user">Mobile User</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="supervisor" />
          <Label htmlFor="supervisor">Supervisor</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="rehire" />
          <Label htmlFor="rehire">Rehire</Label>
        </div>
      </div>

      {/* Save Changes Button */}
      <SaveChangesButton />
    </ScrollArea>
  );
}
