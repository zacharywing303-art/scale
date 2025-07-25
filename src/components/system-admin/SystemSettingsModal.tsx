"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Agency } from "@/app/system_admin/agencies/Agency";
import SystemSettingsForm from "./SettingForm";

interface SystemSettingsModalProps {
  agency: Agency;
  open: boolean;
  onClose: () => void;
}

export default function SystemSettingsModal({
  agency,
  open,
  onClose,
}: SystemSettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Agency Settings</DialogTitle>
        </DialogHeader>
        <SystemSettingsForm agency={agency} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
