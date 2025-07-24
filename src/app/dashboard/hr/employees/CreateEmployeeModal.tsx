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

export default function CreateEmployeeModal() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [last5SSN, setLast5SSN] = useState("");
  const [program, setProgram] = useState("");

  const handleSubmit = () => {
    // TODO: Connect to backend logic
    console.log({ firstName, lastName, last5SSN, program });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Create New Employee</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Employee</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-1">First Name</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1">Last Name</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1">Last 5 SSN</Label>
            <Input
              value={last5SSN}
              onChange={(e) => setLast5SSN(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1">Program</Label>
            <Select value={program} onValueChange={(val) => setProgram(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="programA">Program A</SelectItem>
                <SelectItem value="programB">Program B</SelectItem>
                <SelectItem value="programC">Program C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button type="submit" onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
