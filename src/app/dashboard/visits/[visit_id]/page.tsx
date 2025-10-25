"use client";

import { useEffect, useState } from "react";
import TabNavigation from "./tabs/TabNavigation";
import VisitDetailHeader from "./VisitDetailHeader";
import { useParams } from "next/navigation";

export default function VisitDetailsPage() {
  const params = useParams();
  const visitId = params?.visit_id as string;

  const [visit, setVisit] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visitId) return;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/visits/${visitId}`
        );
        if (!res.ok) throw new Error("Failed to load visit");
        const data = await res.json();
        setVisit(data);
      } catch (e: any) {
        setError(e.message || "Error loading visit");
      } finally {
        setLoading(false);
      }
    })();
  }, [visitId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!visit) return <div className="p-6">Visit not found.</div>;

  return (
    <div className="p-6">
      <VisitDetailHeader visit={visit} />
      <TabNavigation visit={visit} />
    </div>
  );
}
// import TabNavigation from "./tabs/TabNavigation";
// import VisitDetailHeader from "./VisitDetailHeader";

// interface VisitDetailsProps {
//   params: {
//     visit: any;
//   };
// }

// export default function VisitDetailsPage({ params }: VisitDetailsProps) {
//   const { visit } = params;
//   return (
//     <div className="p-6">
//       <VisitDetailHeader visit={visit} />
//       <TabNavigation visit={visit} />
//     </div>
//   );
// }
