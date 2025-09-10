"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Agency } from "@/app/system_admin/agencies/Agency";
import StateSelect from "../StateSelect";
import { Label } from "../ui/label";

interface SettingsFormProps {
  agency: Agency;
  onClose: () => void;
}

export default function SystemSettingsForm({
  agency,
  onClose,
}: SettingsFormProps) {
  const [allowEvv, setAllowEvv] = useState(agency.allowEvv ?? false);
  const [status, setStatus] = useState(agency.status ?? "Active");
  const [state, setState] = useState(agency.state ?? "");
  const [subscriptionPlan, setSubscriptionPlan] = useState(
    agency.subscriptionPlan ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/agencies/${agency.id}/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            allowEvv,
            status,
            state,
            subscriptionPlan,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save settings");
      }

      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="space-y-4 p-6 bg-white rounded shadow max-w-md mx-auto"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <h2 className="text-xl font-semibold mb-4">
        Agency Settings - {agency.name || agency.id}
      </h2>

      <div className="flex items-center gap-2">
        <Checkbox
          id="allow-evv"
          checked={allowEvv}
          onCheckedChange={(val) => setAllowEvv(Boolean(val))}
        />
        <Label htmlFor="allow-evv" className="text-sm font-medium">
          Allow EVV
        </Label>
      </div>

      <div>
        <Label htmlFor="status" className="block text-sm font-medium mb-1">
          Status
        </Label>
        <Select
          value={status}
          onValueChange={(val) =>
            setStatus(val as "Active" | "Inactive" | "Suspended")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={agency.status || "Select status"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="state" className="block text-sm font-medium mb-1">
          State
        </Label>
        <Select value={state} onValueChange={(val) => setState(val)}>
          <SelectTrigger>
            <SelectValue placeholder={agency.state || "Select state"} />
          </SelectTrigger>
          <SelectContent>
            <StateSelect />
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="subscription-plan"
          className="block text-sm font-medium mb-1"
        >
          Subscription Plan
        </Label>
        <Select
          value={subscriptionPlan}
          onValueChange={(val) =>
            setSubscriptionPlan(
              val as "Standard" | "Premium" | "Calculated" | "Exclusive"
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subscription plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
            <SelectItem value="Calculated">Calculated</SelectItem>
            <SelectItem value="Exclusive">Exclusive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <div className="text-sm text-red-500 mt-2">⚠️ {error}</div>}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
