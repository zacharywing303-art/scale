"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Section from "@/components/custom/Section";
import { Label } from "@/components/ui/label";

interface ClientTabProps {
  visit: any;
}

export default function ClientTab({ visit }: ClientTabProps) {
  return (
    <div className="space-y-6 p-4">
      <Section title="Client Information">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Label htmlFor="client-name">Client Name</Label>
          <Input id="client-name" value="John Doe" disabled />
          <Label htmlFor="client-id">Client ID</Label>
          <Input id="client-id" value="CL1234" disabled />
          <Label htmlFor="medicaid-id">Medicaid ID</Label>
          <Input id="medicaid-id" value="MC5678" disabled />
        </div>
      </Section>

      <Section title="Emergency Contact">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Label htmlFor="emergency-contact-name">Contact Name</Label>
          <Input id="emergency-contact-name" value="Jane Doe" disabled />
          <Label htmlFor="emergency-contact-phone">Phone</Label>
          <Input id="emergency-contact-phone" value="(555) 123-4567" disabled />
          <Label htmlFor="emergency-contact-relation">Relation</Label>
          <Input id="emergency-contact-relation" value="Spouse" disabled />
        </div>
      </Section>

      <Section title="Change Client">
        <div className="flex gap-4 items-end">
          <Input
            placeholder="Search by name, ID, Medicaid ID"
            className="w-full"
          />
          <Button>Search & Change</Button>
        </div>
      </Section>
    </div>
  );
}
