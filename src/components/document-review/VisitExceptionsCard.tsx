import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function VisitExceptionsCard({
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
          <h3 className="text-lg font-semibold">Visit Exceptions</h3>
          <p className="text-sm text-gray-500">5 visits flagged</p>
        </div>
        <AlertTriangle className="text-red-600 w-6 h-6" />
      </div>
    </Card>
  );
}
