"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ViewHistoryModal from "../modals/ViewHistoryModal";

export function ClientHeader({ clientId }: { clientId: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Clients
        </button>
        <h2 className="text-xl font-semibold mt-2">
          Client Name (Client ID: {clientId})
        </h2>
        <p className="text-sm text-muted-foreground">Medicaid ID: 12345</p>
      </div>
      <ViewHistoryModal />
    </div>
  );
}
