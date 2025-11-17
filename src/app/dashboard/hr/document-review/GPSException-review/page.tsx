"use client";

import { useEffect, useState } from "react";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  MapPin,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";
import clsx from "clsx";

// Dynamically import SimpleMap (no SSR)
const SimpleMap = dynamic(() => import("@/components/maps/SimpleMap"), {
  ssr: false,
  loading: () => (
    <div className="h-48 flex items-center justify-center text-gray-400">
      <Loader2 className="animate-spin w-6 h-6" />
    </div>
  ),
});

interface GpsException {
  id: string;
  type: "IN" | "OUT";
  distance: number;
  reason: string | null;
  createdAt: string;
  visit: {
    id: number;
    callIn: string | null;
    callOut: string | null;
    clientName: string;
    employeeName: string;
    latitudeIn: number | null;
    longitudeIn: number | null;
    latitudeOut: number | null;
    longitudeOut: number | null;
  };
}

export default function GPSExceptionReviewPage() {
  const user = getLoggedInUser();
  const [data, setData] = useState<GpsException[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  async function load() {
    if (!user?.agency?.id) return;
    setLoading(true);

    const query = new URLSearchParams();
    if (!showAll) query.set("unreviewed", "true");
    if (showAll && dateRange.from && dateRange.to) {
      query.set("from", dateRange.from);
      query.set("to", dateRange.to);
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visits/gps-exceptions/${
        user.agency.id
      }?${query.toString()}`
    );
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [showAll]);

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">GPS Exceptions</h2>
      <p className="text-gray-600">
        GPS-based compliance exceptions detected at clock in/out
      </p>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button variant="secondary" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show Unreviewed Only" : "Show All Exceptions"}
        </Button>

        {showAll && (
          <>
            <input
              type="date"
              className="border p-2 rounded"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
            />
            <input
              type="date"
              className="border p-2 rounded"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
            />
            <Button onClick={load}>Apply</Button>
          </>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
        </div>
      ) : data.length === 0 ? (
        <p className="text-gray-500 italic">No GPS exceptions found.</p>
      ) : (
        <div className="space-y-4">
          {data.map((ex) => {
            const isOpen = expanded === ex.id;
            const time = ex.type === "IN" ? ex.visit.callIn : ex.visit.callOut;

            return (
              <Card key={ex.id} className="p-4 border rounded-lg">
                {/* Header */}
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(ex.id)}
                >
                  <div>
                    <div className="font-semibold">
                      {ex.visit.clientName} — {ex.visit.employeeName}
                    </div>

                    <div
                      className={clsx(
                        "text-sm flex gap-1 items-center font-semibold",
                        ex.type === "IN" && "text-red-600",
                        ex.type === "OUT" && "text-orange-600"
                      )}
                    >
                      <AlertTriangle size={16} />
                      {ex.type === "IN" ? "Clock-In" : "Clock-Out"}:{" "}
                      {time ? new Date(time).toLocaleString() : "N/A"}
                    </div>

                    <div className="text-xs text-gray-500">
                      Distance: {ex.distance.toFixed(2)} miles
                    </div>
                  </div>

                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>

                {/* Collapsed area */}
                <div
                  className={clsx(
                    "transition-all overflow-hidden",
                    isOpen ? "max-h-[400px] mt-4" : "max-h-0"
                  )}
                >
                  <div className="border-t pt-4 space-y-4">
                    {/* Map */}
                    <div className="h-64 border rounded overflow-hidden">
                      <SimpleMap
                        points={[
                          ex.type === "IN"
                            ? {
                                lat: ex.visit.latitudeIn!,
                                lng: ex.visit.longitudeIn!,
                              }
                            : {
                                lat: ex.visit.latitudeOut!,
                                lng: ex.visit.longitudeOut!,
                              },
                        ]}
                      />
                    </div>

                    {/* Reason */}
                    {ex.reason && (
                      <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                        {ex.reason}
                      </p>
                    )}

                    {/* Reviewed button (UI only for now) */}
                    <Button className="flex gap-2 items-center">
                      <CheckCircle size={16} /> Mark Reviewed
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   AlertTriangle,
//   MapPin,
//   ChevronDown,
//   ChevronUp,
//   CheckCircle,
// } from "lucide-react";
// import dynamic from "next/dynamic";
// import { getLoggedInUser } from "@/lib/auth/authHelpers";

// const Map = dynamic(() => import("@/components/maps/SimpleMap"), {
//   ssr: false,
// });

// interface GpsException {
//   id: string;
//   type: "IN" | "OUT";
//   distance: number;
//   reason: string;
//   createdAt: string;
//   visit: {
//     id: number;
//     callIn: string | null;
//     callOut: string | null;
//     clientName: string;
//     employeeName: string;
//     latitudeIn: number | null;
//     longitudeIn: number | null;
//     latitudeOut: number | null;
//     longitudeOut: number | null;
//   };
// }

// export default function GPSExceptionReviewPage() {
//   const user = getLoggedInUser();
//   const [data, setData] = useState<GpsException[]>([]);
//   const [expanded, setExpanded] = useState<string | null>(null);
//   const [showAll, setShowAll] = useState(false);
//   const [dateRange, setDateRange] = useState({ from: "", to: "" });

//   async function load() {
//     if (!user?.agency?.id) return;
//     const query = new URLSearchParams();
//     if (!showAll) query.set("unreviewed", "true");
//     if (showAll && dateRange.from && dateRange.to) {
//       query.set("from", dateRange.from);
//       query.set("to", dateRange.to);
//     }
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/visits/gps-exceptions/${
//         user.agency.id
//       }?${query.toString()}`
//     );
//     const json = await res.json();
//     setData(json);
//   }

//   useEffect(() => {
//     load();
//   }, [showAll]);

//   return (
//     <div className="p-6 space-y-6">
//       <h2 className="text-2xl font-bold">GPS Exceptions</h2>

//       {/* Filter Bar */}
//       <div className="flex items-center gap-4">
//         <Button onClick={() => setShowAll(!showAll)}>
//           {showAll ? "Show Unreviewed Only" : "Show All"}
//         </Button>

//         {showAll && (
//           <>
//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={dateRange.from}
//               onChange={(e) =>
//                 setDateRange({ ...dateRange, from: e.target.value })
//               }
//             />
//             <input
//               type="date"
//               className="border p-2 rounded"
//               value={dateRange.to}
//               onChange={(e) =>
//                 setDateRange({ ...dateRange, to: e.target.value })
//               }
//             />
//             <Button onClick={load}>Apply</Button>
//           </>
//         )}
//       </div>

//       {/* List */}
//       <div className="space-y-4">
//         {data.map((ex) => {
//           const isOpen = expanded === ex.id;
//           const time = ex.type === "IN" ? ex.visit.callIn : ex.visit.callOut;

//           return (
//             <Card key={ex.id} className="p-4 border rounded-lg">
//               <div
//                 className="flex justify-between items-center cursor-pointer"
//                 onClick={() => setExpanded(isOpen ? null : ex.id)}
//               >
//                 <div>
//                   <div className="font-semibold">
//                     {ex.visit.clientName} — {ex.visit.employeeName}
//                   </div>
//                   <div className="text-sm">
//                     {ex.type === "IN" ? (
//                       <span className="text-red-600 font-semibold flex gap-1 items-center">
//                         <AlertTriangle size={16} /> Clock-In:{" "}
//                         {new Date(time!).toLocaleString()}
//                       </span>
//                     ) : (
//                       <span className="text-yellow-600 font-semibold flex gap-1 items-center">
//                         <AlertTriangle size={16} /> Clock-Out:{" "}
//                         {new Date(time!).toLocaleString()}
//                       </span>
//                     )}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     Distance: {ex.distance.toFixed(2)} miles
//                   </div>
//                 </div>

//                 {isOpen ? <ChevronUp /> : <ChevronDown />}
//               </div>

//               {isOpen && (
//                 <div className="mt-4 border-t pt-4 space-y-4">
//                   {/* Map */}
//                   <div className="h-64 border rounded overflow-hidden">
//                     <Map
//                       points={[
//                         ex.type === "IN"
//                           ? {
//                               lat: ex.visit.latitudeIn!,
//                               lng: ex.visit.longitudeIn!,
//                             }
//                           : {
//                               lat: ex.visit.latitudeOut!,
//                               lng: ex.visit.longitudeOut!,
//                             },
//                       ]}
//                     />
//                   </div>

//                   {/* Review button (UI only for now) */}
//                   <Button className="flex gap-2 items-center">
//                     <CheckCircle size={16} /> Mark Reviewed
//                   </Button>
//                 </div>
//               )}
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
