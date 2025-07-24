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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AddAuthorizationModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Authorization</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Authorization</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1">Authorization Number</Label>
            <Input placeholder="e.g. AUTH-12345" />
          </div>
          <div>
            <Label className="mb-1">Payer</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payer1">Payer 1</SelectItem>
                <SelectItem value="payer2">Payer 2</SelectItem>
              </SelectContent>
            </Select>
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
