import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

export default function TimelyAuditCard({ onClick }: { onClick?: () => void }) {
  return (
    <Card
      className="p-4 hover:shadow-md cursor-pointer transition"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Timely Audits</h3>
          <p className="text-sm text-gray-500">3 pending this week</p>
        </div>
        <ClipboardCheck className="text-blue-600 w-6 h-6" />
      </div>
    </Card>
  );
}
