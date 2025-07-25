"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function AddAgencyPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [state, setState] = useState("");
  const [allowEvv, setAllowEvv] = useState(false);
  const [status, setStatus] = useState<"Active" | "Inactive" | "Suspended">(
    "Active"
  );
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Call backend API to create agency
    const newAgency = {
      name,
      contactEmail,
      contactPhone,
      state,
      allowEvv,
      status,
      subscriptionPlan,
      paymentMethod,
    };

    console.log("Creating agency:", newAgency);

    // Simulate redirect after save
    router.push("/system_admin/agencies");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <h1 className="text-2xl font-semibold mb-6">Add New Agency</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name" className="mb-1">
            Agency Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="mb-1">
            Contact Email
          </Label>
          <Input
            id="email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className="mb-1">
            Contact Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="state" className="mb-1">
            State
          </Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="status" className="mb-1">
            Status
          </Label>
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as typeof status)}
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allow-evv"
            checked={allowEvv}
            onCheckedChange={(val) => setAllowEvv(!!val)}
          />
          <Label htmlFor="allow-evv">Allow EVV</Label>
        </div>

        <div>
          <Label htmlFor="subscription" className="mb-1">
            Subscription Plan
          </Label>
          <Input
            id="subscription"
            value={subscriptionPlan}
            onChange={(e) => setSubscriptionPlan(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="payment" className="mb-1">
            Payment Method
          </Label>
          <Input
            id="payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/system_admin/agencies")}
          >
            Cancel
          </Button>
          <Button type="submit">Create Agency</Button>
        </div>
      </form>
    </div>
  );
}
