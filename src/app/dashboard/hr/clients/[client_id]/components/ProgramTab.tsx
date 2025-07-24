"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import SaveChangesButton from "./SaveChangesButton";
import AddAuthorizationModal from "../modals/AddAuthorizationModal";
import AddDiagnosisModal from "../modals/AddDiagnosisModal";
import AddPayerModal from "../modals/AddPayerModal";
import AddServiceModal from "../modals/AddServiceModal";
import AddProviderModal from "../modals/AddProviderModal";

export default function ProgramTab() {
  return (
    <ScrollArea className="p-4 space-y-6">
      {/* Status */}
      <div>
        <Label className="mb-1">Status</Label>
        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="w-1/2">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Effective Date" type="date" />
        </div>
      </div>

      {/* Diagnosis */}
      <div>
        <div className="flex justify-between items-center">
          <Label className="mb-1">Diagnosis</Label>
          <AddDiagnosisModal />
        </div>
        <ScrollArea className="h-40 border rounded mt-2">
          {/* Table header */}
          <div className="grid grid-cols-7 p-2 text-xs font-medium bg-muted">
            <span>Rank</span>
            <span>Code</span>
            <span>Description</span>
            <span>Severity</span>
            <span>Exacerbation</span>
            <span>Begin Date</span>
            <span>Admitting</span>
          </div>
          {/* Example rows */}
          <div className="grid grid-cols-7 p-2 text-sm border-t">
            <span>1</span>
            <span>R123</span>
            <span>Diabetes</span>
            <span>Mild</span>
            <span>No</span>
            <span>2024-01-01</span>
            <span>Yes</span>
          </div>
        </ScrollArea>
      </div>

      {/* Payers */}
      <div>
        <div className="flex justify-between items-center">
          <Label className="mb-1">Payers</Label>
          <AddPayerModal />
        </div>
        <ScrollArea className="h-32 border rounded mt-2">
          <div className="grid grid-cols-4 p-2 text-xs font-medium bg-muted">
            <span>Rank</span>
            <span>Payer</span>
            <span>Medicaid ID</span>
            <span>Client Payer ID</span>
          </div>
          <div className="grid grid-cols-4 p-2 text-sm border-t">
            <span>1</span>
            <span>Amerigroup</span>
            <span>MED888</span>
            <span>CPID001</span>
          </div>
        </ScrollArea>
      </div>

      {/* Program Details */}
      <div className="space-y-2">
        <Label className="mb-1">Program Details</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input value="Program Name Here" disabled />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super1">Supervisor A</SelectItem>
              <SelectItem value="super2">Supervisor B</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Enrollment Date" type="date" />
          <Input placeholder="Created Date" type="date" />
          <Input placeholder="SOC Date" type="date" />
          <Input placeholder="EOC Date" type="date" />
          <Input placeholder="Eligible Begin" type="date" />
          <Input placeholder="Eligible End" type="date" />
        </div>
      </div>

      {/* Authorizations */}
      <div>
        <div className="flex justify-between items-center">
          <Label className="mb-1">Authorizations</Label>
          <AddAuthorizationModal />
        </div>
        <div className="flex gap-4 items-center mt-2">
          <Checkbox id="hide-expired" />
          <Label htmlFor="hide-expired">Hide Expired</Label>
          <Checkbox id="hide-voided" />
          <Label htmlFor="hide-voided">Hide Voided</Label>
        </div>
        <ScrollArea className="h-32 border rounded mt-2">
          <div className="grid grid-cols-5 p-2 text-xs font-medium bg-muted">
            <span>Service</span>
            <span>Auth #</span>
            <span>Begin</span>
            <span>End</span>
            <span>Source</span>
          </div>
          <div className="grid grid-cols-5 p-2 text-sm border-t">
            <span>IHCS 1</span>
            <span>A123456</span>
            <span>2024-01-01</span>
            <span>2024-06-01</span>
            <span>Referral</span>
          </div>
        </ScrollArea>
      </div>

      {/* Services */}
      <div>
        <div className="flex justify-between items-center">
          <Label className="mb-1">Services</Label>
          <AddServiceModal />
        </div>
        <ScrollArea className="h-32 border rounded mt-2">
          <div className="grid grid-cols-4 p-2 text-xs font-medium bg-muted">
            <span>Code</span>
            <span>Service Name</span>
            <span>Start</span>
            <span>End</span>
          </div>
          <div className="grid grid-cols-4 p-2 text-sm border-t">
            <span>IHCS1</span>
            <span>Home Visit</span>
            <span>2024-01-01</span>
            <span>2024-05-01</span>
          </div>
        </ScrollArea>
      </div>

      {/* Physicians/Pharmacy */}
      <div>
        <div className="flex justify-between items-center">
          <Label className="mb-1">Physicians / Pharmacy</Label>
          <AddProviderModal />
        </div>
        <ScrollArea className="h-24 border rounded mt-2 p-2">
          <div>Dr. Smith</div>
          <div>Pharmacy X</div>
        </ScrollArea>
      </div>
      {/* Save Button */}
      <SaveChangesButton />
    </ScrollArea>
  );
}
