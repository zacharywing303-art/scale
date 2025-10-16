"use client";
import React, { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PayrollFilters from "@/components/payroll/PayrollFilters";
import PayrollTable from "@/components/payroll/PayrollTable";
import PayrollSummary from "@/components/payroll/PayrollSummary";

export default function PayrollPage() {
  const [payFrequency, setPayFrequency] = useState("Weekly");
  const [mileageRate, setMileageRate] = useState(0.65);
  const [mileageCap, setMileageCap] = useState(500);
  const [includeMileage, setIncludeMileage] = useState(true);
  const [includeVisits, setIncludeVisits] = useState(true);
  const [includeFacility, setIncludeFacility] = useState(true);
  const [includeOffice, setIncludeOffice] = useState(true);

  const employees = [
    {
      id: 1,
      name: "Sarah Johnson",
      visitHours: 35,
      visitRate: 25,
      facilityHours: 10,
      facilityRate: 20,
      officeHours: 5,
      officeRate: 18,
      mileage: 120,
      overtimeHours: 3,
    },
    {
      id: 2,
      name: "Michael Davis",
      visitHours: 40,
      visitRate: 26,
      facilityHours: 0,
      facilityRate: 0,
      officeHours: 8,
      officeRate: 18,
      mileage: 60,
      overtimeHours: 0,
    },
  ];

  const calculateTotalPay = (emp: any) => {
    let total = 0;
    if (includeVisits) total += emp.visitHours * emp.visitRate;
    if (includeFacility) total += emp.facilityHours * emp.facilityRate;
    if (includeOffice) total += emp.officeHours * emp.officeRate;
    if (includeMileage)
      total += Math.min(emp.mileage, mileageCap) * mileageRate;
    total += emp.overtimeHours * emp.visitRate * 1.5;
    return total.toFixed(2);
  };

  const totalPayroll = employees
    .reduce((sum, emp) => sum + Number(calculateTotalPay(emp)), 0)
    .toFixed(2);

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Payroll Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Review employee hours, mileage, and rates. Adjust options and
            frequency before running payroll.
          </p>

          <PayrollFilters
            payFrequency={payFrequency}
            setPayFrequency={setPayFrequency}
            mileageRate={mileageRate}
            setMileageRate={setMileageRate}
            mileageCap={mileageCap}
            setMileageCap={setMileageCap}
            includeVisits={includeVisits}
            setIncludeVisits={setIncludeVisits}
            includeFacility={includeFacility}
            setIncludeFacility={setIncludeFacility}
            includeOffice={includeOffice}
            setIncludeOffice={setIncludeOffice}
            includeMileage={includeMileage}
            setIncludeMileage={setIncludeMileage}
          />

          <PayrollTable
            employees={employees}
            calculateTotalPay={calculateTotalPay}
          />

          <PayrollSummary totalPayroll={totalPayroll} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
