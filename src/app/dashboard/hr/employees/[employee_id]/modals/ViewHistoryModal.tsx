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
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

// Example mock history – replace with real data
// const historyData = [
//   {
//     id: 1,
//     updatedBy: "Jane Doe",
//     date: "2025-07-20",
//     time: "10:15 AM",
//     change: "Updated client address from '123 Main St' to '456 Oak St'",
//   },
//   {
//     id: 2,
//     updatedBy: "John Smith",
//     date: "2025-07-18",
//     time: "3:42 PM",
//     change: "Changed primary payer to 'Medicaid'",
//   },
//   {
//     id: 3,
//     updatedBy: "Jane Doe",
//     date: "2025-07-10",
//     time: "9:30 AM",
//     change: "Added new diagnosis: 'Autism Spectrum Disorder'",
//   },
// ];

// export default function ViewHistoryModal() {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="secondary">View History</Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Edit History</DialogTitle>
//         </DialogHeader>

//         <ScrollArea className="max-h-[400px] space-y-4 mt-4">
//           {historyData.map((item) => (
//             <div key={item.id} className="border-b pb-3 space-y-1">
//               <p className="text-sm text-muted-foreground">
//                 <strong>{item.updatedBy}</strong> made an update on{" "}
//                 <strong>{item.date}</strong> at <strong>{item.time}</strong>
//               </p>
//               <p className="text-sm">{item.change}</p>
//             </div>
//           ))}
//         </ScrollArea>
//       </DialogContent>
//     </Dialog>
//   );
// }

type ClientHistory = {
  id: string;
  clientId: string;
  title: string;
  reason?: string | null;
  changedBy: string;
  changedAt: string;
  changes?: Record<string, { old: any; new: any }> | null;
};

export default function ViewHistoryModal({
  employeeId,
}: {
  employeeId: string;
}) {
  const [history, setHistory] = useState<ClientHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${employeeId}/history`
      );
      if (!res.ok) throw new Error("Failed to load employee history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
      toast.error("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchHistory()}>
      <DialogTrigger asChild>
        <Button variant="secondary">View History</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit History</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center items-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No history found for this employee.
            </p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="border-b pb-3 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <strong>{item.changedBy}</strong> made an update on{" "}
                  <strong>{format(new Date(item.changedAt), "PPpp")}</strong>
                </p>
                <p className="text-sm font-medium">{item.title}</p>
                {item.reason && (
                  <p className="text-xs text-muted-foreground italic">
                    Reason: {item.reason}
                  </p>
                )}

                {item.changes && (
                  <div className="mt-2 ml-2 space-y-1">
                    {Object.entries(item.changes).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="font-semibold">{key}: </span>
                        <span className="text-red-500 line-through">
                          {String(value.old ?? "—")}
                        </span>{" "}
                        →{" "}
                        <span className="text-green-600">
                          {String(value.new ?? "—")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
