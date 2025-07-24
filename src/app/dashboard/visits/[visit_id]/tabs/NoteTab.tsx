"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Section from "@/components/custom/Section";

interface NotesTabProps {
  visit: any;
}

export default function NotesTab({ visit }: NotesTabProps) {
  return (
    <div className="p-4 space-y-6">
      <Section title="Visit Note">
        <Label>Visit Note</Label>
        <Textarea
          disabled
          value="Client required assistance with mobility and meal prep. Employee provided full support and documented activities accordingly."
          className="min-h-[150px]"
        />
      </Section>

      <Section title="Full Note Document">
        <Button disabled variant="outline">
          Open PDF/Doc Version (Coming Soon)
        </Button>
      </Section>
    </div>
  );
}
