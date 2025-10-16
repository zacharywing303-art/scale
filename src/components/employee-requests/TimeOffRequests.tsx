import { Card } from "@/components/ui/card";
import RequestActionButtons from "./RequestActionButtons";

const mockRequests = [
  {
    id: 1,
    employee: "John Smith",
    dates: "Oct 21 - Oct 24",
    reason: "Vacation",
  },
  {
    id: 2,
    employee: "Maria Lopez",
    dates: "Oct 18",
    reason: "Medical Appointment",
  },
];

export default function TimeOffRequests() {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Time Off Requests</h3>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="p-2">Employee</th>
            <th className="p-2">Dates</th>
            <th className="p-2">Reason</th>
            <th className="p-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockRequests.map((req) => (
            <tr key={req.id} className="border-b last:border-0">
              <td className="p-2">{req.employee}</td>
              <td className="p-2">{req.dates}</td>
              <td className="p-2">{req.reason}</td>
              <td className="p-2 text-right">
                <RequestActionButtons
                  onApprove={() => alert(`Approved ${req.employee}`)}
                  onDecline={() => alert(`Declined ${req.employee}`)}
                  onModify={() => alert(`Modify ${req.employee}`)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
