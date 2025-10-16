import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function HoursWorkedCard({ onClick }: { onClick?: () => void }) {
  return (
    <Card
      className="p-4 hover:shadow-md cursor-pointer transition"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Hours Worked</h3>
          <p className="text-sm text-gray-500">Total: 320 hrs this week</p>
        </div>
        <Clock className="text-purple-600 w-6 h-6" />
      </div>
    </Card>
  );
}
