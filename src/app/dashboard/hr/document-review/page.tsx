"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import TimelyAuditCard from "@/components/document-review/TimelyAuditCard";
import EmployeeMileageCard from "@/components/document-review/EmployeeMileageCard";
import HoursWorkedCard from "@/components/document-review/HoursWorkedCard";
import VisitExceptionsCard from "@/components/document-review/VisitExceptionsCard";
import ClientQuarterlyReviewsCard from "@/components/document-review/ClientQuarterlyReviewsCard";
import EmployeeQuarterlyReviewsCard from "@/components/document-review/EmployeeQuarterlyReviewsCard";
import BillingSummaryCard from "@/components/document-review/BillingSummaryCard";
import GPSExceptionsCard from "@/components/document-review/GPSExceptionsCard";
import ReviewModal from "@/components/document-review/ReviewModal";
import GenerateAuditModal from "@/components/document-review/GenerateAuditModal";

export default function DocumentReviewPage() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<string | null>(null);

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
      <div className="min-h-screen flex bg-gray-50">
        <main className="flex-1 p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Document Review
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Review key compliance and operational records for your agency.
          </p>

          {/* Top section: Timely audits + mileage + hours worked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TimelyAuditCard onClick={() => setOpenModal("audit")} />
            <EmployeeMileageCard onClick={() => setOpenModal("mileage")} />
            <HoursWorkedCard onClick={() => setOpenModal("hours")} />
          </div>

          {/* Middle section: visit exceptions + quarterly reviews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <VisitExceptionsCard
              onClick={() => router.push("/visits/exceptions")}
            />
            <GPSExceptionsCard
              onClick={() =>
                router.push("/document-review/GPSException-review")
              }
            />

            <ClientQuarterlyReviewsCard
              onClick={() => setOpenModal("clientQuarterly")}
            />
          </div>

          {/* Bottom section: billing summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <EmployeeQuarterlyReviewsCard
              onClick={() => setOpenModal("employeeQuarterly")}
            />
            <BillingSummaryCard onClick={() => router.push("/billing")} />
          </div>
        </main>

        {/* Mock Modal */}
        {/* <Dialog open={!!openModal} onOpenChange={() => setOpenModal(null)}>
          <DialogContent>
            <ReviewModal
              section={openModal}
              onClose={() => setOpenModal(null)}
            />
          </DialogContent>
        </Dialog> */}
        <Dialog open={!!openModal} onOpenChange={() => setOpenModal(null)}>
          <DialogContent className="max-w-md">
            {openModal === "audit" ? (
              <GenerateAuditModal onClose={() => setOpenModal(null)} />
            ) : (
              <ReviewModal
                section={openModal}
                onClose={() => setOpenModal(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
