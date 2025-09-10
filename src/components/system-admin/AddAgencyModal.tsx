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
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    santraxID: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/agencies/create_with_admin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create agency");
      }

      const data = await res.json();
      toast.success("Agency created successfully");
      onClose();

      // Wait for agencyId to be available before navigating
      let attempts = 0;
      while (!data.agencyId && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        attempts++;
      }
      if (data.agencyId) {
        router.push(`/system_admin/agencies/${data.agencyId}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
              <Label htmlFor="santraxId" className="mb-2">
                Sandata Agency ID
              </Label>
              <Input
                id="santraxID"
                name="santraxID"
                placeholder="STX212345"
                value={form.santraxID}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="name" className="mb-2">
                Agency Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Agency Name in Full in here"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contact@agency.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-2">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Format: 123-456-7890"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactPerson" className="mb-2">
                Contact Person
              </Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                placeholder="Jane Doe"
                value={form.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading ? "Saving..." : "Save Agency"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
