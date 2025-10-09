// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";

// const messageCount = 5;

// export default function InboxSummary() {
//   const router = useRouter();

//   return (
//     <div
//       onClick={() => router.push("/dashboard/home/inbox")}
//       className="bg-white dark:bg-card border border-border rounded-lg p-6 shadow-md cursor-pointer hover:shadow-lg transition"
//     >
//       <h3 className="text-lg font-semibold text-primary mb-2">Inbox</h3>
//       <p className="text-sm text-muted-foreground">You have</p>
//       <p className="text-3xl font-bold text-primary">{messageCount}</p>
//       <p className="text-sm text-muted-foreground">new messages</p>
//     </div>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InboxSummary() {
  const router = useRouter();
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/api/chat/unread_count?userId=${encodeURIComponent(
            localStorage.getItem("userId") ?? ""
          )}`
        );
        const data = await res.json();
        setMessageCount(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    fetchCount();
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
