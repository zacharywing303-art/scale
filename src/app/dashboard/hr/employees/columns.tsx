"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { EditButton } from "./EditButton";

// Replace 'any' with your backend employee type if available
export const employeeColumns: ColumnDef<any>[] = [
  {
    accessorKey: "edit",
    header: "Edit",
    cell: ({ row }) => <EditButton employeeId={row.original.id} />,
    enableSorting: false,
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
      // Prefer firstName + lastName, fallback to name
      if (employee.firstName && employee.lastName) {
        return `${employee.lastName}, ${employee.firstName}`;
      }
      return employee.name || "—";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "employeeID", // ✅ match your schema (capital D)
    header: "Employee ID",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "hireDate",
    header: "Hire Date",
    cell: ({ row }) => {
      const date = row.original.hireDate;
      if (!date) return "—";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.original.endDate;
      if (!date) return "—";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated As Of",
    cell: ({ row }) => {
      const date = row.original.updatedAt;
      if (!date) return "—";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
];
