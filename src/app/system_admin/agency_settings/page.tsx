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

const plans = ["Basic", "Standard", "Premium", "Enterprise"]; // extend as needed
const states = ["PA", "NY", "CA", "TX"]; // extend as needed

export default function AgencySettingsPage() {
  const [defaultEVV, setDefaultEVV] = useState(true);
  const [defaultPlan, setDefaultPlan] = useState("Standard");
  const [defaultState, setDefaultState] = useState("NY");

  const [planSettings, setPlanSettings] = useState(() =>
    Object.fromEntries(
      plans.map((plan) => [
        plan,
        {
          monthlyPrice: 0,
          yearlyPrice: 0,
          maxUsers: 10,
          storageLimitGB: 5,
        },
      ])
    )
  );

  const [stateSettings, setStateSettings] = useState(() =>
    Object.fromEntries(
      states.map((state) => [
        state,
        {
          allowMessaging: true,
          allowBilling: true,
          allowEVVSignature: false,
        },
      ])
    )
  );

  const handleSave = () => {
    console.log("Saving settings:", {
      defaultEVV,
      defaultPlan,
      defaultState,
      planSettings,
      stateSettings,
    });

    // Replace with API call
    // await fetch('/api/admin/settings', { method: 'POST', body: JSON.stringify({...}) })
  };

  const updatePlanField = (plan: string, field: string, value: any) => {
    setPlanSettings((prev) => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [field]: value,
      },
    }));
  };

  const updateStateField = (state: string, field: string, value: any) => {
    setStateSettings((prev) => ({
      ...prev,
      [state]: {
        ...prev[state],
        [field]: value,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold">Default Agency Settings</h1>

      {/* EVV Checkbox */}
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

      {/* Default Plan Selection */}
      <div>
        <Label className="block mb-1">Default Subscription Plan</Label>
        <Select value={defaultPlan} onValueChange={setDefaultPlan}>
          <SelectTrigger>
            <SelectValue placeholder="Choose plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plan Configurations */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Plan Configurations</h2>
        {plans.map((plan) => (
          <div key={plan} className="border p-4 rounded space-y-2">
            <h3 className="font-semibold">{plan}</h3>
            <Label className="mb-1">Monthly Price</Label>
            <Input
              type="number"
              value={planSettings[plan].monthlyPrice}
              onChange={(e) =>
                updatePlanField(
                  plan,
                  "monthlyPrice",
                  parseFloat(e.target.value)
                )
              }
              placeholder="Monthly Price"
            />
            <Label className="mb-1">Yearly Price</Label>
            <Input
              type="number"
              value={planSettings[plan].yearlyPrice}
              onChange={(e) =>
                updatePlanField(plan, "yearlyPrice", parseFloat(e.target.value))
              }
              placeholder="Yearly Price"
            />
            <Label className="mb-1">Max Users</Label>
            <Input
              type="number"
              value={planSettings[plan].maxUsers}
              onChange={(e) =>
                updatePlanField(plan, "maxUsers", parseInt(e.target.value))
              }
              placeholder="Max Users"
            />
            <Label className="mb-1">Storage Limit (GB)</Label>
            <Input
              type="number"
              value={planSettings[plan].storageLimitGB}
              onChange={(e) =>
                updatePlanField(
                  plan,
                  "storageLimitGB",
                  parseInt(e.target.value)
                )
              }
              placeholder="Storage Limit (GB)"
            />
          </div>
        ))}
      </div>

      {/* Default State Selection */}
      <div>
        <Label className="block mb-1">Default State</Label>
        <Select value={defaultState} onValueChange={setDefaultState}>
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* State Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">State-Specific Settings</h2>
        {states.map((state) => (
          <div key={state} className="border p-4 rounded space-y-2">
            <h3 className="font-semibold">{state}</h3>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={stateSettings[state].allowMessaging}
                onCheckedChange={(val) =>
                  updateStateField(state, "allowMessaging", Boolean(val))
                }
              />
              <Label>Allow Messaging</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={stateSettings[state].allowBilling}
                onCheckedChange={(val) =>
                  updateStateField(state, "allowBilling", Boolean(val))
                }
              />
              <Label>Allow Billing</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={stateSettings[state].allowEVVSignature}
                onCheckedChange={(val) =>
                  updateStateField(state, "allowEVVSignature", Boolean(val))
                }
              />
              <Label>Allow EVV Signature</Label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}
