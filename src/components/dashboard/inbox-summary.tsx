"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getChatSocket } from "@/lib/socket/chat";

export default function InboxSummary() {
  const router = useRouter();
  const [messageCount, setMessageCount] = useState(0);

  const fetchCount = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/unread_count?userId=${userId}`
      );
      const data = await res.json();
      setMessageCount(data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    fetchCount();

    const socket = getChatSocket({
      userId: localStorage.getItem("userId") ?? "",
      displayName: localStorage.getItem("userName") ?? "",
      participantType: "USER",
      agencyCode: localStorage.getItem("agencyCode") ?? "",
      role: "AGENCY_USER",
    });

    socket.on("newMessage", fetchCount);
    socket.on("threadUpdated", fetchCount);

    return () => {
      socket.off("newMessage", fetchCount);
      socket.off("threadUpdated", fetchCount);
      socket.disconnect();
    };
  }, []);

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
