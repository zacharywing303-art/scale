"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, EyeIcon, RefreshCcwDot } from "lucide-react";
import { Agency } from "@/app/system_admin/agencies/Agency"; // shared type

export default function BillingAgenciesPage() {
  const [search, setSearch] = useState("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/agencies");
        if (!res.ok) throw new Error("Failed to fetch agencies");
        const data = await res.json();
        setAgencies(data);
      } catch (err: any) {
        setError(err.message || "Error fetching agencies");
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const filteredAgencies = agencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(search.toLowerCase()) ||
      agency.id.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: Agency["paymentStatus"]) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Failed":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Not Required":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Billing Agencies</h1>

      <Input
        type="text"
        placeholder="Search agencies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Renewal</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgencies.map((agency) => (
              <TableRow key={agency.id}>
                <TableCell>{agency.name}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(
                      agency.paymentStatus
                    )}`}
                  >
                    {agency.paymentStatus || "Not Required"}
                  </span>
                </TableCell>
                <TableCell>
                  {agency.subscriptionPlan || "None Assigned"}
                </TableCell>
                <TableCell>{agency.paymentMethod || "N/A"}</TableCell>
                <TableCell>Not Available</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/system_admin/agencies/${agency.id}?tab=billing`
                      )
                    }
                    title="View Billing Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" title="Retry Payment">
                    <RefreshCcwDot className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" title="Upgrade Plan">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredAgencies.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No agencies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
