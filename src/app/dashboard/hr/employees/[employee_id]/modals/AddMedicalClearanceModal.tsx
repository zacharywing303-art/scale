"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AddMedicalClearanceModal({
  employeeId,
  onCreated,
}: {
  employeeId: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [clearanceName, setClearanceName] = useState("");
  const [date, setDate] = useState("");

  const save = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${employeeId}/medical`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clearanceName,
          effectiveDate: date,
        }),
      }
    );

    if (!res.ok) {
      toast.error("Failed to add clearance");
      return;
    }

    toast.success("Medical clearance added!");
    setOpen(false);
    setClearanceName("");
    setDate("");
    onCreated();
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Add Medical Clearance
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medical Clearance</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={clearanceName}
                onChange={(e) => setClearanceName(e.target.value)}
                placeholder="e.g. TB Test"
              />
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
