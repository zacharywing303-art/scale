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
import { Checkbox } from "@/components/ui/checkbox";

const availablePermissions = [
  "Manage Clients",
  "View Reports",
  "Schedule Visits",
  "Manage Employees",
  "Billing",
  "Edit Authorizations",
  "Access Admin Panel",
];

interface CreateNewUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, permissions: string[]) => void;
}

export default function CreateNewUserModal({
  open,
  onClose,
  onSave,
}: CreateNewUserModalProps) {
  const [title, setTitle] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = () => {
    onSave(title, selectedPermissions);
    setTitle("");
    setSelectedPermissions([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User Type</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title (e.g., Coordinator)"
            />
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {availablePermissions.map((perm) => (
                <label key={perm} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedPermissions.includes(perm)}
                    onCheckedChange={() => togglePermission(perm)}
                  />
                  <span className="text-sm">{perm}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
