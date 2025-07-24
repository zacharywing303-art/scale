"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ViewHistoryModal from "../modals/ViewHistoryModal";

export function EmployeeHeader({ employeeId }: { employeeId: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Employees
        </button>
        <h2 className="text-xl font-semibold mt-2">
          Employee Name (Employee ID: {employeeId})
        </h2>
      </div>
      <ViewHistoryModal />
    </div>
  );
}
