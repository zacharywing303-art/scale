"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
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
  const [paymentMethod, setPaymentMethod] = useState(
    agency.paymentMethod ?? ""
  );

  const handleSave = () => {
    // TODO: Submit updated settings to backend
    console.log("Saving agency settings:", {
      id: agency.id,
      allowEvv,
      status,
      state,
      subscriptionPlan,
      paymentMethod,
    });
    onClose();
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
        <label htmlFor="allow-evv" className="text-sm font-medium">
          Allow EVV
        </label>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-1">
          Status
        </label>
        <Select
          value={status}
          onValueChange={(val) =>
            setStatus(val as "Active" | "Inactive" | "Suspended")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium mb-1">
          State
        </label>
        <Input
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="subscription-plan"
          className="block text-sm font-medium mb-1"
        >
          Subscription Plan
        </label>
        <Input
          id="subscription-plan"
          value={subscriptionPlan}
          onChange={(e) => setSubscriptionPlan(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="payment-method"
          className="block text-sm font-medium mb-1"
        >
          Payment Method
        </label>
        <Input
          id="payment-method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Settings</Button>
      </div>
    </form>
  );
}
