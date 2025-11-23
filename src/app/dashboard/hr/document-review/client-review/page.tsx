"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PeriodSelector, {
  PeriodType,
} from "@/components/reviews/PeriodSelector";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import GoBackButton from "@/components/custom/GoBackButton";

export default function ClientReviewPage() {
  const user = getLoggedInUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskFrom = searchParams.get("from");
  const taskTo = searchParams.get("to");
  const taskFrequency = searchParams.get("frequency");
  const taskId = searchParams.get("taskId");

  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<string>("");
  const isTaskTriggered = !!taskId;

  const [clients, setClients] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<{
    type: PeriodType;
    from?: string;
    to?: string;
    month?: number;
    year?: number;
    quarter?: "Q1" | "Q2" | "Q3" | "Q4";
  }>({ type: "WEEKLY" });

  useEffect(() => {
    if (!user?.agency?.id) return;
    (async () => {
      try {
        const agencyId = user?.agency?.id;

        const [cliRes, histRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/clients/agency/${agencyId}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/clients/history/${agencyId}?limit=10`
          ),
        ]);

        const cliData = await cliRes.json();
        const histData = await histRes.json();
        setClients(cliData || []);
        setHistory(histData || []);
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ⭐ Auto-fill period when coming from Unity Task
  useEffect(() => {
    if (!taskFrom || !taskTo || !taskFrequency) return;

    // Map string → PeriodSelector valid types
    const freq = taskFrequency.toUpperCase();

    setPeriod({
      type: freq as any,
      from: taskFrom,
      to: taskTo,
    });
  }, [taskFrom, taskTo, taskFrequency]);

  const toggleClient = (id: string) =>
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAll = () => setSelectedClients(clients.map((c) => c.id));

  const clearAll = () => setSelectedClients([]);

  const handleConductReview = async () => {
    if (!user?.agency?.id || !user?.id) return;

    if (period.type !== "ALL_TIME" && (!period.from || !period.to)) {
      toast.error("Select a valid review period.");
      return;
    }

    if (selectedClients.length === 0) {
      toast.error("Select at least one client.");
      return;
    }

    if (period.type === "CUSTOM" && period.from && period.to) {
      const diff =
        (new Date(period.to).getTime() - new Date(period.from).getTime()) /
        (1000 * 60 * 60 * 24);
      if (diff > 366) {
        toast.error("Custom range cannot exceed 366 days.");
        return;
      }
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/clients/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agencyId: user.agency.id,
            clientIds: selectedClients,
            periodStart: period.type === "ALL_TIME" ? undefined : period.from,
            periodEnd: period.type === "ALL_TIME" ? undefined : period.to,
            frequency: period.type,
            createdById: user.id,
            unityTaskId: taskId ?? undefined,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to generate review");

      const data = await res.json();
      router.push(
        `/dashboard/hr/document-review/client-review/result?reviewId=${data.reviewId}`
      );
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="p-6">Loading client reviews…</div>;

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN"]}>
      <div className="p-6 space-y-6">
        {taskId && (
          <div className="p-4 rounded-md bg-amber-100 border border-amber-300 text-amber-800">
            <p className="font-medium">
              This review was triggered by a Unity Task
            </p>
            <p className="text-sm mt-1">
              Review period was automatically populated based on task frequency.
            </p>
          </div>
        )}

        <h1 className="text-2xl font-bold">Conduct Client Review</h1>
        <GoBackButton />

        <Card className="p-4 space-y-2">
          <Label>Last Generated Reviews</Label>
          <Select value={selectedHistory} onValueChange={setSelectedHistory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a previous review..." />
            </SelectTrigger>
            <SelectContent>
              {history.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {new Date(h.createdAt).toLocaleDateString()} — {h.frequency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedHistory && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/dashboard/hr/document-review/client-review/result?reviewId=${selectedHistory}`
                )
              }
            >
              Open Review
            </Button>
          )}
        </Card>

        <Card className="p-4">
          <PeriodSelector
            value={period}
            onChange={(v) => {
              if (isTaskTriggered) {
                // Don't allow changing the type
                setPeriod({ ...v, type: taskFrequency });
              } else {
                setPeriod(v);
              }
            }}
          />
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <Label>Select Clients</Label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectAll}>
                Select All
              </Button>
              <Button size="sm" variant="ghost" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border rounded p-3 space-y-2">
            {clients.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedClients.includes(c.id)}
                  onCheckedChange={() => toggleClient(c.id)}
                />
                <span className="text-sm">
                  {c.name} ({c.clientID})
                </span>
              </div>
            ))}
          </div>

          <Button onClick={handleConductReview} className="w-full">
            Conduct Review
          </Button>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
