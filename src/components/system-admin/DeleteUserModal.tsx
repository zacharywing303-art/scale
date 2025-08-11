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
  userName: string;
  userId: string;
  onConfirm?: () => void;
}

export default function DeleteSystemUserModal({
  open,
  onClose,
  userName,
  userId,
  onConfirm,
}: DeleteSystemUserModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete agency");

      toast.success(`Agency deleted successfully.`);
      window.location.reload();
      if (onConfirm) onConfirm(); // refetch list
      onClose();
    } catch (error) {
      toast.error("Failed to delete agency.");
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
