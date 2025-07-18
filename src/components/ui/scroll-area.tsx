"use client";

import * as React from "react";

export function ScrollArea({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto w-full border rounded-md", className)}>
      {children}
    </div>
  );
}

// Optional utility
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
