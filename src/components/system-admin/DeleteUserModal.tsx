"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteSystemUserModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void; // Optional external handler
  userName: string;
  userId: string;
}

export default function DeleteSystemUserModal({
  open,
  onClose,
  onConfirm,
  userName,
  userId,
}: DeleteSystemUserModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      // TODO: Replace with actual delete API call
      console.log("Deleting user:", userId);
      toast.success(`User "${userName}" deleted successfully.`);
      if (onConfirm) onConfirm();
      onClose();
    } catch (error) {
      toast.error("Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm User Deletion</DialogTitle>
        </DialogHeader>

        <p>
          Are you sure you want to permanently delete{" "}
          <strong>{userName}</strong>? This action cannot be undone.
        </p>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
