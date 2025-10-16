import { Card } from "@/components/ui/card";
import RequestActionButtons from "./RequestActionButtons";

const mockClientRequests = [
  { id: 1, client: "Jane Doe", requestedBy: "Lisa Brown", status: "Pending" },
  { id: 2, client: "David King", requestedBy: "Mark Evans", status: "Pending" },
];

export default function ClientAcceptanceRequests() {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Client Acceptance Requests</h3>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="p-2">Client</th>
            <th className="p-2">Requested By</th>
            <th className="p-2">Status</th>
            <th className="p-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockClientRequests.map((req) => (
            <tr key={req.id} className="border-b last:border-0">
              <td className="p-2">{req.client}</td>
              <td className="p-2">{req.requestedBy}</td>
              <td className="p-2">{req.status}</td>
              <td className="p-2 text-right">
                <RequestActionButtons
                  onApprove={() => alert(`Approved client ${req.client}`)}
                  onDecline={() => alert(`Declined client ${req.client}`)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
