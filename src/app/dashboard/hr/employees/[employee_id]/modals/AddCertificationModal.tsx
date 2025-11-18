"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AddCertificationModal({
  employeeId,
  onCreated,
}: {
  employeeId: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [certificationID, setCertificationID] = useState("");
  const [dateObtained, setDateObtained] = useState("");

  const save = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${employeeId}/certifications`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          certificationID,
          dateObtained,
        }),
      }
    );

    if (!res.ok) {
      toast.error("Failed to add certification");
      return;
    }

    toast.success("Certification added!");
    setOpen(false);
    setName("");
    setCertificationID("");
    setDateObtained("");
    onCreated();
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Add Certification
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Certification</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="CPR, CNA, etc"
              />
            </div>

            <div>
              <Label>Certification ID</Label>
              <Input
                value={certificationID}
                onChange={(e) => setCertificationID(e.target.value)}
                placeholder="ID# (optional)"
              />
            </div>

            <div>
              <Label>Date Obtained</Label>
              <Input
                type="date"
                value={dateObtained}
                onChange={(e) => setDateObtained(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
