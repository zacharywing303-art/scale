"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Section from "@/components/custom/Section";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuthorizationsTabProps {
  visit: any;
}

export default function AuthorizationsTab({ visit }: AuthorizationsTabProps) {
  return (
    <div className="space-y-6 p-4">
      <Section title="Authorization Info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Authorization ID</Label>
            <Input disabled value="AUTH123456" />
          </div>
          <div>
            <Label>Service</Label>
            <Input disabled value="Personal Care" />
          </div>
          <div>
            <Label>Start Date</Label>
            <Input disabled value="2024-01-01" />
          </div>
          <div>
            <Label>End Date</Label>
            <Input disabled value="2024-12-31" />
          </div>
          <div>
            <Label>Authorized Hours</Label>
            <Input disabled value="1200" />
          </div>
          <div>
            <Label>Used Hours</Label>
            <Input disabled value="780" />
          </div>
        </div>
      </Section>

      <Section title="Case Manager Info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Case Manager Name</Label>
            <Input disabled value="Lisa Thompson" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input disabled value="(555) 789-1234" />
          </div>
          <div>
            <Label>Email</Label>
            <Input disabled value="lisa.thompson@agency.org" />
          </div>
        </div>
      </Section>
    </div>
  );
}
