// import ClientTabs from "./components/ClientTabs";
// import { ClientHeader } from "./components/ClientHeader";

// interface ClientPageProps {
//   params: {
//     client_id: string;
//   };
// }

// export default function ClientPage({ params }: ClientPageProps) {
//   const { client_id } = params;
//   return (
//     <div className="p-6">
//       <ClientHeader clientId={client_id} />
//       <ClientTabs clientId={client_id} />
//     </div>
//   );
// }
"use client";
import React, { use, useEffect, useState } from "react";
import ClientTabs from "./components/ClientTabs";
import { ClientHeader } from "./components/ClientHeader";

export default function ClientPage({
  params,
}: {
  params: Promise<{ client_id: string }>;
}) {
  const { client_id } = use(params);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${client_id}`
      );
      const data = await res.json();
      setClient(data);
      setLoading(false);
    };
    fetchClient();
  }, [client_id]);

  if (loading) return <p className="p-6">Loading client...</p>;
  if (!client) return <p className="p-6">Client not found</p>;

  return (
    <div className="p-6">
      <ClientHeader client={client} />
      <ClientTabs client={client} />
    </div>
  );
}
