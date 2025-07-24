"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SaveChangesButton from "./SaveChangesButton";

const mockInvoices = [
  {
    id: "INV001",
    service: "IHCS",
    date: "2025-07-01",
    total: "$180.00",
    status: "Paid",
  },
  {
    id: "INV002",
    service: "Team Meeting",
    date: "2025-07-10",
    total: "$75.00",
    status: "Pending",
  },
];

export default function InvoicesTab() {
  return (
    <div className="p-4">
      <ScrollArea className="border rounded h-[300px]">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Invoice ID</th>
              <th className="p-2 text-left">Service</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-t">
                <td className="p-2">{invoice.id}</td>
                <td className="p-2">{invoice.service}</td>
                <td className="p-2">{invoice.date}</td>
                <td className="p-2">{invoice.total}</td>
                <td className="p-2">{invoice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      {/* Save Button */}
      <SaveChangesButton />
    </div>
  );
}
