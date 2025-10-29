"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function GenerateAuditModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const [frequency, setFrequency] = useState("WEEKLY");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(false);

  const [audits, setAudits] = useState<any[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<string>("");

  // 🧠 Load existing audits
  useEffect(() => {
    (async () => {
      try {
        const user = await getLoggedInUser();
        if (!user?.agency?.id) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits/agency/${user.agency.id}`
        );
        if (!res.ok) throw new Error("Failed to load previous audits");
        const data = await res.json();
        setAudits(data || []);
      } catch (err: any) {
        console.error("Error fetching audits:", err);
      }
    })();
  }, []);

  const handleGenerate = async () => {
    try {
      const user = await getLoggedInUser();
      if (!user?.agency?.id) {
        toast.error("Missing agency context");
        return;
      }

      if (frequency === "CUSTOM" && (!customStart || !customEnd)) {
        toast.error("Select both start and end dates");
        return;
      }

      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/timely-audits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agencyId: user.agency.id,
            frequency,
            customStart,
            customEnd,
            createdById: user.id,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();
      toast.success("Audit generated successfully!");
      onClose();
      router.push(
        `/dashboard/hr/document-review/timely-audit/${data.audit.id}`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to generate audit");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToAudit = () => {
    if (!selectedAudit) {
      toast.error("Select an audit first");
      return;
    }
    onClose();
    router.push(`/dashboard/hr/document-review/timely-audit/${selectedAudit}`);
  };

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-xl font-semibold">Timely Audits</h2>

      {/* --- Section 1: View Previous Audits --- */}
      <div className="space-y-2">
        <Label>View Previous Audit</Label>
        <Select
          value={selectedAudit}
          onValueChange={(val) => setSelectedAudit(val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select existing audit" />
          </SelectTrigger>
          <SelectContent>
            {audits.length === 0 && (
              <SelectItem disabled value="none">
                No audits found
              </SelectItem>
            )}
            {audits.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    {a.frequency} – {new Date(a.startDate).toLocaleDateString()}{" "}
                    → {new Date(a.endDate).toLocaleDateString()}
                  </span>
                  {a.completed ? (
                    <span className="text-green-600 text-xs font-semibold">
                      ✅ Completed
                    </span>
                  ) : (
                    <span className="text-amber-600 text-xs font-semibold">
                      ⏳ In Progress
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleGoToAudit}
          disabled={!selectedAudit}
          className="w-full mt-2"
          variant="outline"
        >
          Go to Audit
        </Button>
      </div>

      <hr className="my-3 border-gray-200" />

      {/* --- Section 2: Generate New Audit --- */}
      <div className="space-y-3">
        <Label>Generate New Audit</Label>

        <div>
          <Label>Frequency</Label>
          <Select value={frequency} onValueChange={(val) => setFrequency(val)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
              <SelectItem value="CUSTOM">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {frequency === "CUSTOM" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          </div>
        )}

        <Button className="w-full" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Audit"}
        </Button>
      </div>
    </div>
  );
}
