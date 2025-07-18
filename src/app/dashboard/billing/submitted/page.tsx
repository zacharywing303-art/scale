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

const submittedInvoices = [
  {
    id: 1,
    date: "2025-06-10",
    client: "John Doe",
    payer: "AmeriHealth",
    invoiceId: "INV-001",
    amount: 300.25,
  },
  {
    id: 2,
    date: "2025-06-18",
    client: "Jane Smith",
    payer: "Keystone First",
    invoiceId: "INV-002",
    amount: 442.0,
  },
  {
    id: 3,
    date: "2025-06-20",
    client: "George Brown",
    payer: "AmeriHealth",
    invoiceId: "INV-003",
    amount: 180.0,
  },
];

export default function SubmittedBillingPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [payer, setPayer] = useState("");
  const [results, setResults] = useState<typeof submittedInvoices>([]);

  const handleSearch = () => {
    const filtered = submittedInvoices.filter((inv) => {
      const dateOk =
        (!dateFrom || inv.date >= dateFrom) && (!dateTo || inv.date <= dateTo);
      const payerOk = payer ? inv.payer === payer : true;
      return dateOk && payerOk;
    });
    setResults(filtered);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Submitted Invoices</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="from">Date From</Label>
          <Input
            id="from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="to">Date To</Label>
          <Input
            id="to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="payer">Payer</Label>
          <Select value={payer} onValueChange={setPayer}>
            <SelectTrigger>
              <SelectValue placeholder="Select Payer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AmeriHealth">AmeriHealth</SelectItem>
              <SelectItem value="Keystone First">Keystone First</SelectItem>
              <SelectItem value="Aetna">Aetna</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSearch}>Search</Button>

      {/* Results Table */}
      <div className="mt-6 overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-2 border-r">Invoice ID</th>
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">Client</th>
              <th className="px-4 py-2 border-r">Payer</th>
              <th className="px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {results.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="px-4 py-2 border-r">{inv.invoiceId}</td>
                <td className="px-4 py-2 border-r">{inv.date}</td>
                <td className="px-4 py-2 border-r">{inv.client}</td>
                <td className="px-4 py-2 border-r">{inv.payer}</td>
                <td className="px-4 py-2">${inv.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
