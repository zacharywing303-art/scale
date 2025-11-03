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
  clientId,
  onCreated,
}: {
  clientId: string;
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
    type: "ClientContact",
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
          body: JSON.stringify({ ...form, clientID: clientId }),
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
        type: "ClientContact",
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
              <Label>First Name *</Label>
              <Input
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Relation</Label>
            <Input
              value={form.relation}
              onChange={(e) => handleChange("relation", e.target.value)}
            />
          </div>
          <div>
            <Label>Phone *</Label>
            <Input
              value={form.phone1}
              onChange={(e) => handleChange("phone1", e.target.value)}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
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
