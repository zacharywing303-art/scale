"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AgencySettingsPage() {
  const [defaultEVV, setDefaultEVV] = useState(true);
  const [defaultPlan, setDefaultPlan] = useState("Standard");
  const [defaultState, setDefaultState] = useState("NY");
  const [maxUsers, setMaxUsers] = useState(50);
  const [enableStorageLimit, setEnableStorageLimit] = useState(false);
  const [storageLimitGB, setStorageLimitGB] = useState(10);

  const handleSave = () => {
    // Replace with API call
    console.log("Saving agency default settings:", {
      defaultEVV,
      defaultPlan,
      defaultState,
      maxUsers,
      enableStorageLimit,
      storageLimitGB,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold">Default Agency Settings</h1>

      <div className="flex items-center gap-3">
        <Checkbox
          id="default-evv"
          checked={defaultEVV}
          onCheckedChange={(val) => setDefaultEVV(Boolean(val))}
        />
        <Label htmlFor="default-evv">
          Enable EVV by default for new agencies
        </Label>
      </div>

      <div>
        <Label className="block mb-1">Default Subscription Plan</Label>
        <Select
          value={defaultPlan}
          onValueChange={(val) => setDefaultPlan(val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Basic">Basic</SelectItem>
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="block mb-1">Default State</Label>
        <Input
          value={defaultState}
          onChange={(e) => setDefaultState(e.target.value)}
        />
      </div>

      <div>
        <Label className="block mb-1">Max Users per Agency</Label>
        <Input
          type="number"
          value={maxUsers}
          onChange={(e) => setMaxUsers(parseInt(e.target.value))}
        />
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="storage-limit"
          checked={enableStorageLimit}
          onCheckedChange={(val) => setEnableStorageLimit(Boolean(val))}
        />
        <Label htmlFor="storage-limit">Enable storage limit for agencies</Label>
      </div>

      {enableStorageLimit && (
        <div>
          <Label className="block mb-1">Storage Limit (in GB)</Label>
          <Input
            type="number"
            value={storageLimitGB}
            onChange={(e) => setStorageLimitGB(parseInt(e.target.value))}
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}
