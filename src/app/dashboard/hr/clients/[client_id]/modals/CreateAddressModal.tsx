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

export default function CreateAddressModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Address</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Address</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1">Line 1</Label>
            <Input placeholder="Address Line 1" />
          </div>
          <div>
            <Label className="mb-1">Line 2</Label>
            <Input placeholder="Address Line 2" />
          </div>
          <div>
            <Label className="mb-1">City</Label>
            <Input />
          </div>
          <div>
            <Label className="mb-1">State</Label>
            <Input />
          </div>
          <div>
            <Label className="mb-1">Zip Code</Label>
            <Input />
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
