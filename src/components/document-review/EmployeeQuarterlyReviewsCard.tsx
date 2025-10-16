import { Card } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export default function EmployeeQuarterlyReviewsCard({
  onClick,
}: {
  onClick?: () => void;
}) {
  return (
    <Card
      className="p-4 hover:shadow-md cursor-pointer transition"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Employee Quarterly Reviews</h3>
          <p className="text-sm text-gray-500">4 pending</p>
        </div>
        <UserCheck className="text-amber-600 w-6 h-6" />
      </div>
    </Card>
  );
}
