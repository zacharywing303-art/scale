"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VisitDetailHeader from "./VisitDetailHeader";
import GeneralTab from "./tabs/GeneralTab";
import ClientTab from "./tabs/ClientTab";
import EmployeeTab from "./tabs/EmployeeTab";
import AuthorizationsTab from "./tabs/AuthorizationsTab";
import CallLogTab from "./tabs/CallLogTab";
import ExceptionsTab from "./tabs/ExceptionsTab";
import GPSTab from "./tabs/GPSTab";
import NotesTab from "./tabs/NoteTab";
import ClaimsTab from "./tabs/ClaimsTab";
import HistoryTab from "./tabs/HistoryTab";
import TabNavigation from "./tabs/TabNavigation";

interface VisitDetailModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  visit: any; // Replace 'any' with the actual type of 'visit' if available
}

export default function VisitDetailModal({
  open,
  onClose,
  visit,
}: VisitDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[75%] h-[90vh] overflow-hidden">
        <DialogHeader>
          <VisitDetailHeader visit={visit} />
          <TabNavigation visit={visit} />
        </DialogHeader>
        <div className="flex flex-col h-full"></div>
      </DialogContent>
    </Dialog>
  );
}
