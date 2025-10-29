"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

export default function TimelyAuditCard({ onClick }: { onClick?: () => void }) {
  const [statusText, setStatusText] = useState("Loading...");
  const [statusColor, setStatusColor] = useState("text-gray-400");

  useEffect(() => {
    async function fetchAuditStatus() {
      try {
        const user = await getLoggedInUser();
        if (!user?.agency?.id) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/agency/${user.agency.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch audits");
        const audits = await res.json();

        if (!audits.length) {
          setStatusText("No audits yet");
          setStatusColor("text-gray-400");
          return;
        }

        const latest = audits[0];
        const latestDate = new Date(latest.startDate);
        const now = new Date();

        const sameWeek =
          Math.abs(now.getTime() - latestDate.getTime()) /
            (1000 * 60 * 60 * 24) <=
          7;

        if (latest.completed) {
          setStatusText(
            sameWeek ? "✅ Completed this week" : "✅ Last audit complete"
          );
          setStatusColor("text-green-600");
        } else {
          setStatusText(sameWeek ? "🟡 Pending this week" : "🟡 Audit pending");
          setStatusColor("text-yellow-600");
        }
      } catch (err) {
        console.error(err);
        setStatusText("Error loading audits");
        setStatusColor("text-red-500");
      }
    }
    fetchAuditStatus();
  }, []);

  return (
    <Card
      className="p-4 hover:shadow-md cursor-pointer transition relative"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Timely Audits</h3>
          <p className={`text-sm ${statusColor}`}>{statusText}</p>
        </div>
        <ClipboardCheck className="text-blue-600 w-6 h-6" />
      </div>
    </Card>
  );
}
