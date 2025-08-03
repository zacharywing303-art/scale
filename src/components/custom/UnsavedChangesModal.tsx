"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesModalProps {
  open: boolean;
  onDiscard: () => void;
  onStay: () => void;
  onSave: () => void;
}

export default function UnsavedChangesModal({
  open,
  onDiscard,
  onStay,
  onSave,
}: UnsavedChangesModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unsaved Changes</DialogTitle>
        </DialogHeader>
        <p className="text-sm">
          You have unsaved changes. What would you like to do?
        </p>
        <DialogFooter className="mt-4">
          <Button variant="destructive" onClick={onDiscard}>
            Yes, go back
          </Button>
          <Button variant="secondary" onClick={onStay}>
            No, stay here
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
