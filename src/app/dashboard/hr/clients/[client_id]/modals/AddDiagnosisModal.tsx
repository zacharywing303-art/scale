"use client";

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

export default function AddDiagnosisModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Diagnosis</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Diagnosis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1">ICD Code</Label>
            <Input placeholder="e.g. F84.0" />
          </div>
          <div>
            <Label className="mb-1">Description</Label>
            <Input placeholder="e.g. Autism Spectrum Disorder" />
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
