"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface AgencyPasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: {
    name: string;
    email: string;
    agency: string;
    role: string;
    lastPasswordReset?: string; // ISO timestamp
  };
}

export default function AgencyPasswordResetModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}: AgencyPasswordResetModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <h2 className="text-lg font-semibold">Confirm Password Reset</h2>
        </DialogHeader>

        <div className="space-y-3">
          <p>
            Are you sure you want to reset the password for{" "}
            <span className="font-medium">{user.name}</span> (
            <span className="text-muted-foreground">{user.email}</span>) from{" "}
            <span className="italic">{user.agency}</span>?
          </p>

          <div className="text-sm text-muted-foreground">
            <Label>Role:</Label> {user.role}
            <br />
            <Label>Last Password Reset:</Label>{" "}
            {user.lastPasswordReset
              ? format(new Date(user.lastPasswordReset), "PPPpp")
              : "Never"}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Reset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
