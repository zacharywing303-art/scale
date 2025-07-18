"use client";

import React from "react";
import { useRouter } from "next/navigation";

const messageCount = 5;

export default function InboxSummary() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/dashboard/home/inbox")}
      className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md cursor-pointer hover:shadow-lg transition"
    >
      <h3 className="text-lg font-semibold text-primary mb-2">Inbox</h3>
      <p className="text-sm text-muted-foreground">You have</p>
      <p className="text-3xl font-bold text-primary">{messageCount}</p>
      <p className="text-sm text-muted-foreground">new messages</p>
    </div>
  );
}
