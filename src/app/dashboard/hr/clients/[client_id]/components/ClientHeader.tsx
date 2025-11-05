"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ViewHistoryModal from "../modals/ViewHistoryModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function ClientHeader({ client }: { client: any }) {
  const [status, setStatus] = useState(client.status);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Clients
          </button>
          <h2 className="text-xl font-semibold mt-2">{client.name}</h2>
          <p className="text-sm text-muted-foreground">
            Medicaid ID: {client.medicaidID} • Client ID: {client.clientID}
          </p>
        </div>
        <Select onValueChange={updateStatus} value={status}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Change Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ViewHistoryModal clientId={client.id} />
    </div>
  );
}
