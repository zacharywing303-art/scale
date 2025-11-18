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

export default function CreateContactModal({
  employeeId,
  onCreated,
}: {
  employeeId: string;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    relation: "",
    phone1: "",
    email: "",
    type: "EmployeeContact",
    addressLine1: "",
    addressType: "Home",
    zipcode: "",
    state: "",
    city: "",
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.phone1) {
      toast.error("First name and phone are required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, employeeID: employeeId }),
        }
      );

      if (!res.ok) throw new Error("Failed to create contact");
      toast.success("Contact created successfully");
      setOpen(false);
      onCreated?.();
      setForm({
        firstName: "",
        lastName: "",
        relation: "",
        phone1: "",
        email: "",
        type: "EmployeeContact",
        addressLine1: "",
        addressType: "Home",
        zipcode: "",
        state: "",
        city: "",
      });
    } catch (err) {
      console.error("Error creating contact:", err);
      toast.error("Failed to create contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Contact</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">First Name *</Label>
              <Input
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1">Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="mb-1">Relation</Label>
            <Input
              value={form.relation}
              onChange={(e) => handleChange("relation", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1">Phone *</Label>
            <Input
              value={form.phone1}
              onChange={(e) => {
                const v = e.target.value;
                const digits = v.replace(/\D/g, "").slice(0, 10);
                let formatted = digits;
                if (digits.length === 0) formatted = "";
                else if (digits.length <= 3) formatted = `(${digits}`;
                else if (digits.length <= 6)
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                else
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(
                    3,
                    6
                  )}-${digits.slice(6)}`;
                handleChange("phone1", formatted);
              }}
              onBlur={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                if (digits && digits.length < 10) {
                  toast.error("Phone number must be 10 digits (XXX) XXX-XXXX");
                }
              }}
            />
            {form.phone1.replace(/\D/g, "").length > 0 &&
              form.phone1.replace(/\D/g, "").length < 10 && (
                <p className="text-sm text-red-500">Phone must be 10 digits</p>
              )}
          </div>
          <div>
            <Label className="mb-1">Email</Label>
            <Input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && !/^[^\s@]+@[^\s@]+\.com$/i.test(v)) {
                  toast.error(
                    "Email must be in the format something@something.com"
                  );
                }
              }}
            />
            {form.email &&
              !/^[^\s@]+@[^\s@]+\.com$/i.test(form.email.trim()) && (
                <p className="text-sm text-red-500">
                  Email must be in the format something@something.com
                </p>
              )}
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
