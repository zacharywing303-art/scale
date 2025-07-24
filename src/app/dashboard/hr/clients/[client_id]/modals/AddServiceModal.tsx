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

export default function AddServiceModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Service</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1">Service Name</Label>
            <Input placeholder="e.g. IHCS" />
          </div>
          <div>
            <Label className="mb-1">Start Date</Label>
            <Input type="date" />
          </div>
          <div>
            <Label className="mb-1">End Date</Label>
            <Input type="date" />
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
