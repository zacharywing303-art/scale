"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => void;
  existingEmployees: { id: string; name: string }[];
}

export default function AddUserModal({
  open,
  onClose,
  onSubmit,
  existingEmployees,
}: AddUserModalProps) {
  const [useExisting, setUseExisting] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleSubmit = () => {
    if (!useExisting) {
      onSubmit(form);
    } else {
      const [firstName, lastName] = selectedEmployee.split(" ");
      onSubmit({ firstName, lastName, email: "", phone: "" }); // fill if needed
    }
    setForm({ firstName: "", lastName: "", email: "", phone: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add User to Role</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={useExisting ? "default" : "outline"}
              onClick={() => setUseExisting(true)}
            >
              Select Existing
            </Button>
            <Button
              variant={!useExisting ? "default" : "outline"}
              onClick={() => setUseExisting(false)}
            >
              Add New
            </Button>
          </div>

          {useExisting ? (
            <div>
              <Label className="mb-1">Select Employee</Label>
              <Select onValueChange={(val) => setSelectedEmployee(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {existingEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.name}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="mb-1">First Name</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-1">Last Name</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1">Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label className="mb-1">Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
