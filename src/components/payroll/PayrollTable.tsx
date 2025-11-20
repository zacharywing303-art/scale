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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type PayrollRow = {
  employeeId: string;
  employeeCode?: string;
  name: string;

  visitHours: number;
  visitRate: number;

  facilityHours: number;
  facilityRate: number;

  officeHours: number;
  officeRate: number;

  mileage: number;
  mileageRate: number;

  overtimeHours: number;
};

interface PayrollTableProps {
  employees: PayrollRow[];
  loading?: boolean;
  includeVisits: boolean;
  includeFacility: boolean;
  includeOffice: boolean;
  includeMileage: boolean;
  onChangeField: (
    employeeId: string,
    field: keyof PayrollRow,
    value: number
  ) => void;
  onRateChange: (
    employeeId: string,
    employeeCode: string,
    field: keyof PayrollRow,
    value: number
  ) => void;
  onOpenTimecard: (emp: PayrollRow) => void;
}

export default function PayrollTable({
  employees,
  loading,
  includeVisits,
  includeFacility,
  includeOffice,
  includeMileage,
  onChangeField,
  onRateChange,
  onOpenTimecard,
}: PayrollTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Code</TableHead>

            <TableHead>Visit Hours</TableHead>
            <TableHead>Visit Rate ($)</TableHead>

            <TableHead>Facility Hours</TableHead>
            <TableHead>Facility Rate ($)</TableHead>

            <TableHead>Office Hours</TableHead>
            <TableHead>Office Rate ($)</TableHead>

            <TableHead>Mileage</TableHead>
            <TableHead>Mileage Rate ($)</TableHead>

            <TableHead>OT Hours</TableHead>
            <TableHead>Timecard</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4">
                Loading payroll...
              </TableCell>
            </TableRow>
          )}
          {!loading && employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4">
                No employees found for this period.
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            employees.map((emp) => (
              <TableRow key={emp.employeeId}>
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell>{emp.employeeCode ?? "—"}</TableCell>

                {/* Visit Hours */}
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={!includeVisits}
                    value={emp.visitHours}
                    onChange={(e) =>
                      onChangeField(
                        emp.employeeId,
                        "visitHours",
                        parseFloat(e.target.value || "0")
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={emp.visitRate}
                    onChange={(e) =>
                      onRateChange(
                        emp.employeeId,
                        emp.employeeCode || emp.employeeId,
                        "visitRate",
                        parseFloat(e.target.value || "0")
                      )
                    }
                  />
                </TableCell>

                {/* Facility */}
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={!includeFacility}
                    value={emp.facilityHours}
                    onChange={(e) =>
                      onChangeField(
                        emp.employeeId,
                        "facilityHours",
                        parseFloat(e.target.value || "0")
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={emp.facilityRate}
                    onChange={(e) =>
                      onRateChange(
                        emp.employeeId,
                        emp.employeeCode || emp.employeeId,
                        "facilityRate",
                        parseFloat(e.target.value || "0")
                      )
                    }
                  />
                </TableCell>

                {/* Office */}
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={!includeOffice}
                    value={emp.officeHours}
                    onChange={(e) =>
                      onChangeField(
                        emp.employeeId,
                        "officeHours",
                        parseFloat(e.target.value || "0")
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={emp.officeRate}
                    onChange={(e) =>
                      onRateChange(
                        emp.employeeId,
                        emp.employeeCode || emp.employeeId,
                        "officeRate",
                        parseFloat(e.target.value || "0")
                      )
                    }
                  />
                </TableCell>

                {/* Mileage */}
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={!includeMileage}
                    value={emp.mileage}
                    onChange={(e) =>
                      onChangeField(
                        emp.employeeId,
                        "mileage",
                        parseFloat(e.target.value || "0")
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={emp.mileageRate}
                    onChange={(e) =>
                      onRateChange(
                        emp.employeeId,
                        emp.employeeCode || emp.employeeId,
                        "mileageRate",
                        parseFloat(e.target.value || "0")
                      )
                    }
                  />
                </TableCell>

                {/* OT */}
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={emp.overtimeHours}
                    onChange={(e) =>
                      onChangeField(
                        emp.employeeId,
                        "overtimeHours",
                        parseFloat(e.target.value || "0")
                      )
                    }
                  />
                </TableCell>

                {/* Timecard */}
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenTimecard(emp)}
                  >
                    Timecard
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
// "use client";
// import React from "react";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";

// interface Employee {
//   id: number;
//   name: string;
//   visitHours: number;
//   visitRate: number;
//   facilityHours: number;
//   facilityRate: number;
//   officeHours: number;
//   officeRate: number;
//   mileage: number;
//   overtimeHours: number;
// }

// interface PayrollTableProps {
//   employees: Employee[];
//   calculateTotalPay: (emp: Employee) => string;
// }

// export default function PayrollTable({
//   employees,
//   calculateTotalPay,
// }: PayrollTableProps) {
//   return (
//     <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm overflow-x-auto">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Employee</TableHead>
//             <TableHead>Visit Hours</TableHead>
//             <TableHead>Visit Rate ($)</TableHead>
//             <TableHead>Facility Hours</TableHead>
//             <TableHead>Facility Rate ($)</TableHead>
//             <TableHead>Office Hours</TableHead>
//             <TableHead>Office Rate ($)</TableHead>
//             <TableHead>Mileage</TableHead>
//             <TableHead>Overtime (hrs)</TableHead>
//             <TableHead>Total Pay ($)</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {employees.map((emp) => (
//             <TableRow key={emp.id}>
//               <TableCell>{emp.name}</TableCell>
//               <TableCell>{emp.visitHours}</TableCell>
//               <TableCell>{emp.visitRate}</TableCell>
//               <TableCell>{emp.facilityHours}</TableCell>
//               <TableCell>{emp.facilityRate}</TableCell>
//               <TableCell>{emp.officeHours}</TableCell>
//               <TableCell>{emp.officeRate}</TableCell>
//               <TableCell>{emp.mileage}</TableCell>
//               <TableCell>{emp.overtimeHours}</TableCell>
//               <TableCell className="font-semibold">
//                 ${calculateTotalPay(emp)}
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }
