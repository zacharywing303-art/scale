import { Card } from "@/components/ui/card";
import RequestActionButtons from "./RequestActionButtons";

const mockShiftRequests = [
  {
    id: 1,
    employee: "Alex Carter",
    shift: "Morning (8am–12pm)",
    date: "Oct 20",
  },
  { id: 2, employee: "Tina Patel", shift: "Evening (4pm–8pm)", date: "Oct 21" },
];

export default function ShiftRequests() {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Shift Requests</h3>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="p-2">Employee</th>
            <th className="p-2">Shift</th>
            <th className="p-2">Date</th>
            <th className="p-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockShiftRequests.map((req) => (
            <tr key={req.id} className="border-b last:border-0">
              <td className="p-2">{req.employee}</td>
              <td className="p-2">{req.shift}</td>
              <td className="p-2">{req.date}</td>
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
