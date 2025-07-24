"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

// Example mock history – replace with real data
const historyData = [
  {
    id: 1,
    updatedBy: "Jane Doe",
    date: "2025-07-20",
    time: "10:15 AM",
    change: "Updated client address from '123 Main St' to '456 Oak St'",
  },
  {
    id: 2,
    updatedBy: "John Smith",
    date: "2025-07-18",
    time: "3:42 PM",
    change: "Changed primary payer to 'Medicaid'",
  },
  {
    id: 3,
    updatedBy: "Jane Doe",
    date: "2025-07-10",
    time: "9:30 AM",
    change: "Added new diagnosis: 'Autism Spectrum Disorder'",
  },
];

export default function ViewHistoryModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">View History</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit History</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] space-y-4 mt-4">
          {historyData.map((item) => (
            <div key={item.id} className="border-b pb-3 space-y-1">
              <p className="text-sm text-muted-foreground">
                <strong>{item.updatedBy}</strong> made an update on{" "}
                <strong>{item.date}</strong> at <strong>{item.time}</strong>
              </p>
              <p className="text-sm">{item.change}</p>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
