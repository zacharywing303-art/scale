import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function GPSExceptionsCard({
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
          <h3 className="text-lg font-semibold">GPS Exceptions</h3>
          <p className="text-sm text-gray-500">Review GPS distance issues</p>
        </div>
        <MapPin className="text-blue-600 w-6 h-6" />
      </div>
    </Card>
  );
}
