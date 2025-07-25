"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AddAgencyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddAgencyModal({ open, onClose }: AddAgencyModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    contactPerson: "",
    address: "",
    agencyId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to backend
    console.log("Submitting new agency:", form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Agency</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="agencyId" className="mb-1">
                Agency ID
              </Label>
              <Input
                id="agencyId"
                name="agencyId"
                placeholder="AG123"
                value={form.agencyId}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="name" className="mb-1">
                Agency Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Sunrise Health Services"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-1">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contact@agency.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-1">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(555) 123-4567"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="contactPerson" className="mb-1">
                Contact Person
              </Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                placeholder="Jane Doe"
                value={form.contactPerson}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="address" className="mb-1">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, City, State"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary">
              Save Agency
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
