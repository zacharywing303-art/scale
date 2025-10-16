import { Card } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function BillingSummaryCard({
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
          <h3 className="text-lg font-semibold">Billing Summary</h3>
          <p className="text-sm text-gray-500">Current Period: $12,430</p>
        </div>
        <CreditCard className="text-indigo-600 w-6 h-6" />
      </div>
    </Card>
  );
}
