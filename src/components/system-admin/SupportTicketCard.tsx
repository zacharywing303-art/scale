// components/system-admin/supportticketcard.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SupportTicketCardProps {
  id: string;
  subject: string;
  agencyName: string;
  createdAt: string;
  status: "Open" | "In Progress" | "Resolved";
}

export default function SupportTicketCard({
  id,
  subject,
  agencyName,
  createdAt,
  status,
}: SupportTicketCardProps) {
  return (
    <Card className="mb-4 shadow-sm">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{subject}</h3>
          <span
            className={`text-sm px-2 py-1 rounded-full ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Agency: {agencyName}</p>
        <p className="text-sm text-muted-foreground">Created: {createdAt}</p>
        <div className="flex justify-end">
          <Link href={`/system_admin/support_requests/${id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "Open":
      return "bg-yellow-100 text-yellow-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Resolved":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
