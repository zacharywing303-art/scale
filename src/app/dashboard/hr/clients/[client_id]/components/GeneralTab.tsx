"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import SaveChangesButton from "./SaveChangesButton";
import CreateAddressModal from "../modals/CreateAddressModal";
import CreateContactModal from "../modals/CreateContactModal";

export default function GeneralTab() {
  return (
    <ScrollArea className="p-4 space-y-6">
      {/* Uneditable fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "First Name", value: "Jane" },
          { label: "Last Name", value: "Doe" },
          { label: "Title", value: "Ms." },
          { label: "Middle Initial", value: "A" },
          { label: "Suffix", value: "Jr." },
          { label: "SSN", value: "123-45-6789" },
          { label: "Gender", value: "Female" },
          { label: "Birth Date", value: "01/01/1980" },
          { label: "Primary Language", value: "English" },
          { label: "Medicaid ID", value: "MED12345" },
          { label: "Client ID", value: "CLT67890" },
          { label: "Primary Phone Number", value: "(123) 456-7890" },
          { label: "Primary Email", value: "jane.doe@example.com" },
          { label: "Other ID", value: "OTH9999" },
        ].map(({ label, value }) => (
          <div key={label}>
            <Label className="mb-1">{label}</Label>
            <Input value={value} disabled />
          </div>
        ))}
      </div>

      {/* Address Selection */}
      <div className="space-y-2">
        <Label>Address</Label>
        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Address" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">123 Main St</SelectItem>
              <SelectItem value="apt">456 Apartment Rd</SelectItem>
            </SelectContent>
          </Select>
          <CreateAddressModal />
        </div>
        <Input placeholder="Unit Type" />
        <Input placeholder="Address Line 1" />
        <Input placeholder="Address Line 2" />
        <Input placeholder="Address Line 3" />
        <Input placeholder="City" />
        <Input placeholder="State" />
        <Input placeholder="Zip Code" />
      </div>

      {/* Editable Contacts and Other Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Other Languages" />
        <Input placeholder="Phone Number 2" />
        <Input placeholder="Phone Number 3" />
        <Input placeholder="Phone Number 4" />
        <Input placeholder="Email 2" />
      </div>

      {/* Contacts */}
      <div>
        <Label className="block mb-2">Contacts</Label>
        <CreateContactModal />
        {/* Sample Contacts */}
        <div className="space-y-3 mt-4">
          {[
            {
              name: "Mary Johnson",
              relationship: "Mother",
              phone: "555-123-4567",
            },
            {
              name: "David Lee",
              relationship: "Brother",
              phone: "555-987-6543",
            },
          ].map((contact, idx) => (
            <div key={idx} className="border p-3 rounded-md shadow-sm bg-white">
              <p className="font-medium">{contact.name}</p>
              <p className="text-sm text-muted-foreground">
                {contact.relationship} — {contact.phone}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Save Button */}
      <SaveChangesButton />
    </ScrollArea>
  );
}
