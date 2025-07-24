"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import Section from "@/components/custom/Section";

interface GPSTabProps {
  visit: any;
}

export default function GPSTab({ visit }: GPSTabProps) {
  return (
    <div className="p-4 space-y-4">
      <Section title="Visit Location (Map)">
        <div className="w-full h-96 border rounded bg-muted flex items-center justify-center text-muted-foreground">
          <MapPlaceholder />
        </div>
      </Section>
    </div>
  );
}

function MapPlaceholder() {
  return <span>Map View Placeholder (GPS logic to be implemented)</span>;
}
