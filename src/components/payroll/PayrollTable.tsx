"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface Employee {
  id: number;
  name: string;
  visitHours: number;
  visitRate: number;
  facilityHours: number;
  facilityRate: number;
  officeHours: number;
  officeRate: number;
  mileage: number;
  overtimeHours: number;
}

interface PayrollTableProps {
  employees: Employee[];
  calculateTotalPay: (emp: Employee) => string;
}

export default function PayrollTable({
  employees,
  calculateTotalPay,
}: PayrollTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Visit Hours</TableHead>
            <TableHead>Visit Rate ($)</TableHead>
            <TableHead>Facility Hours</TableHead>
            <TableHead>Facility Rate ($)</TableHead>
            <TableHead>Office Hours</TableHead>
            <TableHead>Office Rate ($)</TableHead>
            <TableHead>Mileage</TableHead>
            <TableHead>Overtime (hrs)</TableHead>
            <TableHead>Total Pay ($)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell>{emp.name}</TableCell>
              <TableCell>{emp.visitHours}</TableCell>
              <TableCell>{emp.visitRate}</TableCell>
              <TableCell>{emp.facilityHours}</TableCell>
              <TableCell>{emp.facilityRate}</TableCell>
              <TableCell>{emp.officeHours}</TableCell>
              <TableCell>{emp.officeRate}</TableCell>
              <TableCell>{emp.mileage}</TableCell>
              <TableCell>{emp.overtimeHours}</TableCell>
              <TableCell className="font-semibold">
                ${calculateTotalPay(emp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
