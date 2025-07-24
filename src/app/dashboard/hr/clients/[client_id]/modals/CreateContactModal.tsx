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

export default function CreateContactModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Contact</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1">Name</Label>
            <Input placeholder="e.g. Mary Johnson" />
          </div>
          <div>
            <Label className="mb-1">Relationship</Label>
            <Input placeholder="e.g. Mother" />
          </div>
          <div>
            <Label className="mb-1">Phone</Label>
            <Input placeholder="e.g. (555) 123-4567" />
          </div>
          <div>
            <Label className="mb-1">Email</Label>
            <Input placeholder="e.g. mary@example.com" />
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
