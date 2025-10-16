import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ClientQuarterlyReviewsCard({
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
          <h3 className="text-lg font-semibold">Client Quarterly Reviews</h3>
          <p className="text-sm text-gray-500">2 due this month</p>
        </div>
        <Users className="text-teal-600 w-6 h-6" />
      </div>
    </Card>
  );
}
