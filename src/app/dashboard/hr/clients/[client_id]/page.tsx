import ClientTabs from "./components/ClientTabs";
import { ClientHeader } from "./components/ClientHeader";

interface ClientPageProps {
  params: {
    client_id: string;
  };
}

export default function ClientPage({ params }: ClientPageProps) {
  const { client_id } = params;
  return (
    <div className="p-6">
      <ClientHeader clientId={client_id} />
      <ClientTabs clientId={client_id} />
    </div>
  );
}
