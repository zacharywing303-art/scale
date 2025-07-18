"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Payer {
  id: number;
  name: string;
  santraxName: string;
  isTpl: boolean;
  dateCreated: string;
}

const samplePayers: Payer[] = [
  {
    id: 1,
    name: "AmeriHealth Caritas",
    santraxName: "AMERIHEALTH",
    isTpl: false,
    dateCreated: "2024-02-15 10:32 AM",
  },
  {
    id: 2,
    name: "Keystone First",
    santraxName: "KEYFIRST",
    isTpl: true,
    dateCreated: "2024-03-12 3:45 PM",
  },
  {
    id: 3,
    name: "Aetna Better Health",
    santraxName: "AETNA",
    isTpl: false,
    dateCreated: "2024-05-01 9:00 AM",
  },
];

export default function PayersPage() {
  const [payers, setPayers] = useState<Payer[]>([]);
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    // Simulate fetching payers
    setPayers(samplePayers);

    const now = new Date();
    const formatted = now.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    setTimestamp(formatted);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Payers</h1>
      <p className="text-gray-600">Payers as of: {timestamp}</p>

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-2 border-r">Edit</th>
              <th className="px-4 py-2 border-r">Name</th>
              <th className="px-4 py-2 border-r">Santrax Name</th>
              <th className="px-4 py-2 border-r">Is TPL</th>
              <th className="px-4 py-2">Date Created</th>
            </tr>
          </thead>
          <tbody>
            {payers.map((payer) => (
              <tr key={payer.id} className="border-t">
                <td className="px-4 py-2 border-r">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </td>
                <td className="px-4 py-2 border-r">{payer.name}</td>
                <td className="px-4 py-2 border-r">{payer.santraxName}</td>
                <td className="px-4 py-2 border-r">
                  {payer.isTpl ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2">{payer.dateCreated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
