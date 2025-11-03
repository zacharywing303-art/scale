"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const US_STATES = [
  { abbr: "AL", name: "Alabama" },
  { abbr: "AK", name: "Alaska" },
  { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" },
  { abbr: "CA", name: "California" },
  { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" },
  { abbr: "DE", name: "Delaware" },
  { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" },
  { abbr: "HI", name: "Hawaii" },
  { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" },
  { abbr: "IN", name: "Indiana" },
  { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" },
  { abbr: "KY", name: "Kentucky" },
  { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" },
  { abbr: "MD", name: "Maryland" },
  { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" },
  { abbr: "MN", name: "Minnesota" },
  { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" },
  { abbr: "MT", name: "Montana" },
  { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" },
  { abbr: "NH", name: "New Hampshire" },
  { abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" },
  { abbr: "NY", name: "New York" },
  { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" },
  { abbr: "OH", name: "Ohio" },
  { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" },
  { abbr: "PA", name: "Pennsylvania" },
  { abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" },
  { abbr: "SD", name: "South Dakota" },
  { abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" },
  { abbr: "UT", name: "Utah" },
  { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" },
  { abbr: "WA", name: "Washington" },
  { abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" },
  { abbr: "WY", name: "Wyoming" },
];

export default function CreateAddressModal({
  clientId,
  onCreated,
}: {
  clientId: string;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [suggested, setSuggested] = useState<any | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    addressLabel: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    addressType: "Home",
    city: "",
    state: "",
    zipcode: "",
    county: "",
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.addressLine1.trim()) newErrors.addressLine1 = true;
    if (!form.city.trim()) newErrors.city = true;
    if (!form.state.trim()) newErrors.state = true;
    if (!/^\d{5}(-\d{4})?$/.test(form.zipcode)) newErrors.zipcode = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      toast.error("Please correct highlighted fields");
      return false;
    }
    return true;
  };

  /** Normalize state input */
  const normalizeState = (input: string) => {
    const found =
      US_STATES.find(
        (s) =>
          s.abbr.toLowerCase() === input.toLowerCase() ||
          s.name.toLowerCase() === input.toLowerCase()
      ) || null;
    return found ? found.abbr : input.toUpperCase();
  };

  /** 🔎 Validate with Google Maps API */
  /** 🔎 Verify address securely via backend */
  const verifyAddress = async () => {
    if (!validateForm()) return;
    setVerifying(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify-address`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            addressLine1: form.addressLine1,
            city: form.city,
            state: form.state,
            zipcode: form.zipcode,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to verify address");

      setSuggested(data.standardized);
      toast.success("Suggested verified address found");
    } catch (err) {
      console.error("Error verifying address:", err);
      toast.error("Failed to verify address");
    } finally {
      setVerifying(false);
    }
  };

  /** 📨 Save address (with lat/long if verified) */
  const handleSubmit = async (useSuggested = false) => {
    if (!validateForm()) return;

    const normalizedState = normalizeState(form.state);

    const addressToSave =
      useSuggested && suggested
        ? {
            ...form,
            addressLine1: suggested.addressLine1,
            city: suggested.city,
            state: suggested.state,
            zipcode: suggested.zipcode,
            county: suggested.county,
            latitude: suggested.latitude,
            longitude: suggested.longitude,
          }
        : { ...form, state: normalizedState };

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/addresses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...addressToSave, clientID: clientId }),
        }
      );

      if (!res.ok) throw new Error("Failed to create address");
      toast.success("Address saved successfully");
      setOpen(false);
      onCreated?.();
      resetForm();
    } catch (err) {
      console.error("Error creating address:", err);
      toast.error("Failed to create address");
    } finally {
      setLoading(false);
    }
  };

  const parseSuggested = (s: any) => {
    const get = (type: string) =>
      s.components.find((c: any) => c.types.includes(type))?.long_name || "";
    return {
      addressLabel: form.addressLabel,
      addressLine1: `${get("street_number")} ${get("route")}`.trim(),
      city: get("locality") || get("sublocality") || "",
      state: get("administrative_area_level_1") || "",
      zipcode: get("postal_code") || "",
      addressLine2: form.addressLine2,
      addressType: form.addressType,
      county: get("administrative_area_level_2") || "",
    };
  };

  const resetForm = () => {
    setForm({
      addressLabel: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      addressType: "Home",
      city: "",
      state: "",
      zipcode: "",
      county: "",
    });
    setSuggested(null);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Address</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="mb-1">Label</Label>
            <Input
              value={form.addressLabel}
              onChange={(e) => handleChange("addressLabel", e.target.value)}
              placeholder="e.g. Home, Apartment, etc."
            />
          </div>

          <div>
            <Label className="mb-1">Address Line 1 *</Label>
            <Input
              className={errors.addressLine1 ? "border-red-500" : ""}
              value={form.addressLine1}
              onChange={(e) => handleChange("addressLine1", e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1">City *</Label>
            <Input
              className={errors.city ? "border-red-500" : ""}
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">State *</Label>
              <Select
                value={form.state}
                onValueChange={(v) => handleChange("state", v)}
              >
                <SelectTrigger
                  className={`w-full ${errors.state ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s.abbr} value={s.abbr}>
                      {s.name} ({s.abbr})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1">Zip Code *</Label>
              <Input
                className={errors.zipcode ? "border-red-500" : ""}
                value={form.zipcode}
                onChange={(e) => handleChange("zipcode", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Verification & Suggestion */}
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={verifyAddress}
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Verify Address"}
          </Button>

          {suggested && (
            <div className="mt-3 p-3 border rounded-md bg-muted">
              <p className="font-medium">Suggested Address:</p>
              <p className="text-sm text-muted-foreground">
                {suggested.formattedAddress}
              </p>
              {suggested.latitude && suggested.longitude && (
                <p className="text-xs text-muted-foreground">
                  Lat: {suggested.latitude}, Lng: {suggested.longitude}
                </p>
              )}

              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                >
                  Use Suggested
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                >
                  Keep My Entry
                </Button>
              </div>
            </div>
          )}
        </div>

        {!suggested && (
          <DialogFooter className="pt-4">
            <Button onClick={() => handleSubmit(false)} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
