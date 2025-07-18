"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Employee } from "./employee";
import { Button } from "@/components/ui/button";

export const employeeColumns: ColumnDef<Employee>[] = [
  {
    accessorKey: "edit",
    header: "",
    cell: () => (
      <Button variant="link" className="text-blue-600">
        Edit
      </Button>
    ),
  },
  {
    accessorKey: "viewSchedule",
    header: "",
    cell: () => (
      <Button variant="link" className="text-green-600">
        View Schedule
      </Button>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const employee = row.original;
      return `${employee.lastName}, ${employee.firstName}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "employeeId",
    header: "Employee ID",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "hireDate",
    header: "Hire Date",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated As Of",
  },
];
