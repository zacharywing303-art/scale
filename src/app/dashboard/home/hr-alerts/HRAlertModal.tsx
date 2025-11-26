"use client";

import { useEffect, useState } from "react";
import {
  X,
  ArrowRight,
  AlertTriangle,
  Info,
  XCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { toast } from "sonner";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent, // ✅ use shadcn version, not Radix core
} from "@/components/ui/select";

interface HRAlert {
  id: string;
  alertType: string;
  message: string;
  severity: "warning" | "info" | "error";
  link?: string | null;
}

const SeverityIcon = ({ type }: { type: string }) => {
  if (type === "error")
    return <XCircle className="w-5 h-5 text-red-600 mr-2" />;
  if (type === "warning")
    return <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />;
  return <Info className="w-5 h-5 text-blue-600 mr-2" />;
};

export default function HRAlertModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [alerts, setAlerts] = useState<HRAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<HRAlert[]>([]);
  const [filter, setFilter] = useState<"all" | "warning" | "error" | "info">(
    "all"
  );

  const [page, setPage] = useState(1);
  const pageSize = 6;
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginated = filteredAlerts.slice(startIdx, endIdx);
  const totalPages = Math.ceil(filteredAlerts.length / pageSize);

  useEffect(() => {
    if (!isOpen) return;

    async function load() {
      const user = await getLoggedInUser();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/hr/alerts/${user?.agency?.id}`
      );
      const data = await res.json();

      setAlerts(data);
      setFilteredAlerts(data);
      setPage(1);
    }

    load();
  }, [isOpen]);

  const applyFilter = (type: typeof filter) => {
    setFilter(type);
    setPage(1);

    if (type === "all") {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter((a) => a.severity === type));
    }
  };

  const dismissAlert = async (alert: HRAlert) => {
    const user = await getLoggedInUser();

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hr/alerts/${user?.agency?.id}/dismiss`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertType: alert.alertType }),
      }
    );

    toast.success("Alert dismissed");

    const updated = alerts.filter((a) => a.alertType !== alert.alertType);
    setAlerts(updated);
    setFilteredAlerts(
      filter === "all" ? updated : updated.filter((a) => a.severity === filter)
    );
  };

  const dismissAll = async () => {
    const user = await getLoggedInUser();

    await Promise.all(
      alerts.map((a) =>
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/hr/alerts/${user?.agency?.id}/dismiss`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alertType: a.alertType }),
          }
        )
      )
    );

    toast.success("All alerts dismissed");
    setAlerts([]);
    setFilteredAlerts([]);
  };

  const doNotShowAgain = async (alert: HRAlert) => {
    const user = await getLoggedInUser();

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/hr/alerts/${user?.agency?.id}/dismiss`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertType: alert.alertType,
          doNotShow: true,
        }),
      }
    );

    toast.success("Alert hidden permanently");

    const updated = alerts.filter((a) => a.alertType !== alert.alertType);
    setAlerts(updated);
    setFilteredAlerts(
      filter === "all" ? updated : updated.filter((a) => a.severity === filter)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-card w-full max-w-2xl rounded shadow-lg relative p-6 max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>

        {/* Title Row */}
        <div className="flex justify-between items-center mb-5 pr-8">
          {/* pr-8 so header content doesn’t sit under the X */}
          <h2 className="text-xl font-semibold">HR Alerts</h2>

          <div className="flex gap-2">
            <Select
              value={filter}
              onValueChange={(value) => applyFilter(value as typeof filter)}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            {alerts.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
                onClick={dismissAll}
              >
                <Trash2 className="w-4 h-4" />
                Dismiss All
              </Button>
            )}
          </div>
        </div>

        {/* ALERT LIST */}
        <div className="space-y-4">
          {paginated.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between p-3 border rounded bg-muted/20 hover:bg-muted/40 transition"
            >
              <div className="flex items-start">
                <SeverityIcon type={alert.severity} />

                <div>
                  <h3 className="font-medium">{alert.message}</h3>
                </div>
              </div>

              <div className="flex flex-col space-y-2 items-end">
                {/* LINK */}
                {alert.link && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (window.location.href = alert.link!)}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}

                {/* Dismiss */}
                <button
                  className="text-xs text-gray-600 hover:text-red-600"
                  onClick={() => dismissAlert(alert)}
                >
                  Dismiss
                </button>

                {/* Do Not Show Again */}
                <button
                  className="text-xs text-gray-400 hover:text-gray-700"
                  onClick={() => doNotShowAgain(alert)}
                >
                  Do Not Show Again
                </button>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <p className="text-center text-muted-foreground pt-4">
              🎉 No HR alerts at this time
            </p>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <span className="text-sm">
              Page {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import {
//   X,
//   ArrowRight,
//   AlertTriangle,
//   Info,
//   XCircle,
//   Filter,
//   Trash2,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { format } from "date-fns";
// import { getLoggedInUser } from "@/lib/auth/authHelpers";
// import { toast } from "sonner"; // or use shadcn toast if preferred
// import {
//   Select,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { SelectContent } from "@radix-ui/react-select";

// interface HRAlert {
//   id: string;
//   alertType: string;
//   message: string;
//   severity: "warning" | "info" | "error";
//   link?: string | null;
// }

// /** ICON HELPER */
// const SeverityIcon = ({ type }: { type: string }) => {
//   if (type === "error")
//     return <XCircle className="w-5 h-5 text-red-600 mr-2" />;
//   if (type === "warning")
//     return <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />;
//   return <Info className="w-5 h-5 text-blue-600 mr-2" />;
// };

// export default function HRAlertModal({
//   isOpen,
//   onClose,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
// }) {
//   const [alerts, setAlerts] = useState<HRAlert[]>([]);
//   const [filteredAlerts, setFilteredAlerts] = useState<HRAlert[]>([]);
//   const [filter, setFilter] = useState<"all" | "warning" | "error" | "info">(
//     "all"
//   );

//   // Pagination
//   const [page, setPage] = useState(1);
//   const pageSize = 6;
//   const startIdx = (page - 1) * pageSize;
//   const endIdx = startIdx + pageSize;
//   const paginated = filteredAlerts.slice(startIdx, endIdx);
//   const totalPages = Math.ceil(filteredAlerts.length / pageSize);

//   //"Do Not Show Again" local state
//   const doNotShowMap = useState<Record<string, boolean>>({})[0];

//   useEffect(() => {
//     if (!isOpen) return;

//     async function load() {
//       const user = await getLoggedInUser();
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/hr/alerts/${user?.agency?.id}`
//       );
//       const data = await res.json();

//       setAlerts(data);
//       setFilteredAlerts(data);
//     }

//     load();
//   }, [isOpen]);

//   /** Filter alerts by severity */
//   const applyFilter = (type: typeof filter) => {
//     setFilter(type);
//     setPage(1);

//     if (type === "all") {
//       setFilteredAlerts(alerts);
//     } else {
//       setFilteredAlerts(alerts.filter((a) => a.severity === type));
//     }
//   };

//   /** Dismiss a single alert */
//   const dismissAlert = async (alert: HRAlert) => {
//     const user = await getLoggedInUser();

//     await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/hr/alerts/${user?.agency?.id}/dismiss`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ alertType: alert.alertType }),
//       }
//     );

//     toast.success("Alert dismissed");

//     const updated = alerts.filter((a) => a.alertType !== alert.alertType);
//     setAlerts(updated);

//     applyFilter(filter);
//   };

//   /** Dismiss all alerts */
//   const dismissAll = async () => {
//     const user = await getLoggedInUser();

//     await Promise.all(
//       alerts.map((a) =>
//         fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/hr/alerts/${user?.agency?.id}/dismiss`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ alertType: a.alertType }),
//           }
//         )
//       )
//     );

//     toast.success("All alerts dismissed");
//     setAlerts([]);
//     setFilteredAlerts([]);
//   };

//   /** Do Not Show Again for a specific alert */
//   const doNotShowAgain = async (alert: HRAlert) => {
//     const user = await getLoggedInUser();

//     await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/hr/alerts/${user?.agency?.id}/dismiss`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           alertType: alert.alertType,
//           doNotShow: true,
//         }),
//       }
//     );

//     toast.success("Alert hidden permanently");

//     const updated = alerts.filter((a) => a.alertType !== alert.alertType);
//     setAlerts(updated);
//     applyFilter(filter);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//       <div className="bg-white dark:bg-card w-full max-w-2xl rounded shadow-lg relative p-6 max-h-[90vh] overflow-y-auto">
//         {/* Close */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
//         >
//           <X />
//         </button>

//         {/* Title Row */}
//         <div className="flex justify-between items-center mb-5">
//           <h2 className="text-xl font-semibold">HR Alerts</h2>

//           <div className="flex gap-2">
//             {/* FILTER DROPDOWN */}
//             <Select
//               value={filter}
//               onValueChange={(value) => applyFilter(value as typeof filter)}
//             >
//               <SelectTrigger className="w-[170px]">
//                 <SelectValue placeholder="Filter" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Alerts</SelectItem>
//                 <SelectItem value="error">Errors</SelectItem>
//                 <SelectItem value="warning">Warnings</SelectItem>
//                 <SelectItem value="info">Info</SelectItem>
//               </SelectContent>
//             </Select>

//             {/* DISMISS ALL */}
//             {alerts.length > 0 && (
//               <Button
//                 variant="destructive"
//                 size="sm"
//                 className="flex items-center gap-1"
//                 onClick={dismissAll}
//               >
//                 <Trash2 className="w-4 h-4" />
//                 Dismiss All
//               </Button>
//             )}
//           </div>
//         </div>

//         {/* ALERT LIST */}
//         <div className="space-y-4">
//           {paginated.map((alert) => (
//             <div
//               key={alert.id}
//               className="flex items-start justify-between p-3 border rounded bg-muted/20 hover:bg-muted/40 transition"
//             >
//               <div className="flex items-start">
//                 <SeverityIcon type={alert.severity} />

//                 <div>
//                   <h3 className="font-medium">{alert.message}</h3>
//                 </div>
//               </div>

//               <div className="flex flex-col space-y-2 items-end">
//                 {/* LINK */}
//                 {alert.link && (
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => (window.location.href = alert.link!)}
//                   >
//                     <ArrowRight className="w-4 h-4" />
//                   </Button>
//                 )}

//                 {/* Dismiss */}
//                 <button
//                   className="text-xs text-gray-600 hover:text-red-600"
//                   onClick={() => dismissAlert(alert)}
//                 >
//                   Dismiss
//                 </button>

//                 {/* Do Not Show Again */}
//                 <button
//                   className="text-xs text-gray-400 hover:text-gray-700"
//                   onClick={() => doNotShowAgain(alert)}
//                 >
//                   Do Not Show Again
//                 </button>
//               </div>
//             </div>
//           ))}

//           {alerts.length === 0 && (
//             <p className="text-center text-muted-foreground pt-4">
//               🎉 No HR alerts at this time
//             </p>
//           )}
//         </div>

//         {/* PAGINATION */}
//         {totalPages > 1 && (
//           <div className="flex justify-center items-center gap-3 mt-6">
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page === 1}
//               onClick={() => setPage((p) => p - 1)}
//             >
//               Previous
//             </Button>

//             <span className="text-sm">
//               Page {page} / {totalPages}
//             </span>

//             <Button
//               variant="outline"
//               size="sm"
//               disabled={page === totalPages}
//               onClick={() => setPage((p) => p + 1)}
//             >
//               Next
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
