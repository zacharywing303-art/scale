"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Pencil1Icon } from "@radix-ui/react-icons";

const mockResults = [
  {
    id: 1,
    date: "2025-06-28",
    clientName: "John Doe",
    program: "Adult Day",
    medicaidId: "123456789",
    serviceCode: "S5125",
    amount: 215.0,
    authNumber: "AUTH12345",
    status: "Pending",
    payer: "AmeriHealth",
    reason: "Missing authorization",
    billable: false,
  },
  {
    id: 2,
    date: "2025-06-27",
    clientName: "Jane Smith",
    program: "Home Care",
    medicaidId: "987654321",
    serviceCode: "T1019",
    amount: 150.0,
    authNumber: "AUTH67890",
    status: "Verified",
    payer: "Keystone First",
    reason: "",
    billable: true,
  },
];

export default function CreateInvoicePage() {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    clientName: "",
    program: "",
    payer: "",
    service: "",
    event: "",
    visitStatus: "",
    billable: "",
  });

  const [results, setResults] = useState<typeof mockResults>([]);
  const [searchedAt, setSearchedAt] = useState<string | null>(null);
  const [perPage, setPerPage] = useState("10");

  const handleSearch = () => {
    // simulate result filtering
    setResults(mockResults);
    setSearchedAt(new Date().toLocaleString());
  };

  const totalAmount = results.reduce((acc, row) => acc + row.amount, 0);

  return (
    <div className="p-6 space-y-8">
      {/* Title and Search */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <Label>Date From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dateFrom: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Date To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dateTo: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Client Name</Label>
          <Input
            value={filters.clientName}
            onChange={(e) =>
              setFilters((f) => ({ ...f, clientName: e.target.value }))
            }
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label>Program</Label>
          <Input
            value={filters.program}
            onChange={(e) =>
              setFilters((f) => ({ ...f, program: e.target.value }))
            }
            placeholder="Adult Day"
          />
        </div>
        <div>
          <Label>Payer</Label>
          <Input
            value={filters.payer}
            onChange={(e) =>
              setFilters((f) => ({ ...f, payer: e.target.value }))
            }
            placeholder="Aetna"
          />
        </div>
        <div>
          <Label>Service</Label>
          <Input
            value={filters.service}
            onChange={(e) =>
              setFilters((f) => ({ ...f, service: e.target.value }))
            }
            placeholder="T1019"
          />
        </div>
        <div>
          <Label>Event</Label>
          <Input
            value={filters.event}
            onChange={(e) =>
              setFilters((f) => ({ ...f, event: e.target.value }))
            }
            placeholder="Routine Visit"
          />
        </div>
        <div>
          <Label>Visit Status</Label>
          <Select
            onValueChange={(val) =>
              setFilters((f) => ({ ...f, visitStatus: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Billing Status</Label>
          <Select
            onValueChange={(val) =>
              setFilters((f) => ({ ...f, billable: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Ok / Not Ok to Bill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ok">Ok to Bill</SelectItem>
              <SelectItem value="not-ok">Not Ok to Bill</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Total + Timestamp */}
      {results.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="font-semibold text-lg">
            Total Amount: ${totalAmount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">Searched at: {searchedAt}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-2 border-r">Edit</th>
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">Client</th>
              <th className="px-4 py-2 border-r">Program</th>
              <th className="px-4 py-2 border-r">Medicaid ID</th>
              <th className="px-4 py-2 border-r">Service Code</th>
              <th className="px-4 py-2 border-r">Amount</th>
              <th className="px-4 py-2 border-r">Authorization</th>
              <th className="px-4 py-2 border-r">Status</th>
              <th className="px-4 py-2 border-r">Payer</th>
              <th className="px-4 py-2">Reason Not Billable</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2 border-r">
                  <Button variant="ghost" size="sm">
                    <Pencil1Icon />
                  </Button>
                </td>
                <td className="px-4 py-2 border-r">{r.date}</td>
                <td className="px-4 py-2 border-r">{r.clientName}</td>
                <td className="px-4 py-2 border-r">{r.program}</td>
                <td className="px-4 py-2 border-r">{r.medicaidId}</td>
                <td className="px-4 py-2 border-r">{r.serviceCode}</td>
                <td className="px-4 py-2 border-r">${r.amount.toFixed(2)}</td>
                <td className="px-4 py-2 border-r">{r.authNumber}</td>
                <td className="px-4 py-2 border-r">{r.status}</td>
                <td className="px-4 py-2 border-r">{r.payer}</td>
                <td className="px-4 py-2">{r.reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Label>Rows per page:</Label>
          <Select
            onValueChange={(val) => setPerPage(val)}
            defaultValue={perPage}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button variant="ghost">← Prev</Button>
          <Button variant="ghost">Next →</Button>
        </div>
      </div>
    </div>
  );
}
