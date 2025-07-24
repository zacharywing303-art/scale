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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function AddProviderModal() {
  const [type, setType] = useState<"pharmacy" | "physician">("pharmacy");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Pharmacy/Physician</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add {type === "pharmacy" ? "Pharmacy" : "Physician"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-1">Type</Label>
            <Select
              value={type}
              onValueChange={(val) => setType(val as "pharmacy" | "physician")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="physician">Physician</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "pharmacy" ? (
            <>
              <div>
                <Label className="mb-1">Pharmacy Name</Label>
                <Input placeholder="e.g. Main Pharmacy" />
              </div>
              <div>
                <Label className="mb-1">Phone Number</Label>
                <Input placeholder="e.g. (123) 456-7890" />
              </div>
              <div>
                <Label className="mb-1">Address</Label>
                <Input placeholder="Pharmacy address" />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="mb-1">Physician Name</Label>
                <Input placeholder="e.g. Dr. Smith" />
              </div>
              <div>
                <Label className="mb-1">Specialty</Label>
                <Input placeholder="e.g. Pediatrics" />
              </div>
              <div>
                <Label className="mb-1">Phone Number</Label>
                <Input placeholder="e.g. (123) 456-7890" />
              </div>
              <div>
                <Label className="mb-1">Address</Label>
                <Input placeholder="Physician address" />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
