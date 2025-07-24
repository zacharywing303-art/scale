"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
  actionSlot?: React.ReactNode;
}

export default function Section({
  title,
  className,
  children,
  actionSlot,
}: SectionProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <div className="bg-muted rounded-md border p-4 space-y-4">{children}</div>
      {actionSlot && <div className="mt-4">{actionSlot}</div>}
    </div>
  );
}
