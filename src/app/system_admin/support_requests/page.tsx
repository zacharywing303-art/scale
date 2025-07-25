"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type SupportRequest = {
  id: string;
  agencyName: string;
  agencyId: string;
  subject: string;
  message: string;
  status: "Open" | "In Progress" | "Resolved";
  submittedAt: string;
};

const mockRequests: SupportRequest[] = [
  {
    id: "req-001",
    agencyName: "Sunrise Care",
    agencyId: "AG123",
    subject: "EVV issue",
    message: "Caregivers cannot clock in via the mobile app.",
    status: "Open",
    submittedAt: "2025-07-22 10:34 AM",
  },
  {
    id: "req-002",
    agencyName: "Family Health",
    agencyId: "AG456",
    subject: "Report not generating",
    message: "Unable to export PDF reports for last month.",
    status: "In Progress",
    submittedAt: "2025-07-21 3:22 PM",
  },
  {
    id: "req-003",
    agencyName: "Harmony Services",
    agencyId: "AG789",
    subject: "Need password reset",
    message: "Admin account locked out.",
    status: "Resolved",
    submittedAt: "2025-07-20 9:10 AM",
  },
];

export default function SupportRequestsPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredRequests = mockRequests.filter(
    (req) =>
      req.agencyName.toLowerCase().includes(search.toLowerCase()) ||
      req.subject.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: SupportRequest["status"]) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Support Requests</h1>
        <div className="w-full max-w-sm flex items-center gap-2">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <Input
            id="search"
            placeholder="Search by agency or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agency</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="font-medium">{req.agencyName}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: {req.agencyId}
                  </div>
                </TableCell>
                <TableCell>{req.subject}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(req.status)}>
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell>{req.submittedAt}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/system_admin/support_requests/${req.id}`)
                    }
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No matching support requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
