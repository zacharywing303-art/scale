"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { EditButton } from "./EditButton";
// Example client type (adjust fields if needed)
export type Client = {
  id: string;
  clientID: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  status: string;
  supervisor: string;
  medicaidId: string;
  payerId: string;
  startDate: string;
  endDate: string;
  services: string[]; // Example: ['IHCS', 'PAS']
  program: string;
};

export const columns: ColumnDef<Client>[] = [
  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => <EditButton clientId={row.original.id} />,
    enableSorting: false,
  },
  {
    id: "program",
    header: "Program",
    enableSorting: false,
  },
  {
    accessorKey: "clientName",
    header: "Client Name",
    cell: ({ row }) => {
      const { firstName, middleInitial, lastName } = row.original;
      return (
        <span>
          {firstName} {middleInitial ? `${middleInitial}. ` : ""}
          {lastName}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const color =
        status === "active"
          ? "text-green-600"
          : status === "inactive"
          ? "text-red-600"
          : "text-yellow-600";
      return <span className={color}>{status}</span>;
    },
  },
  {
    accessorKey: "supervisor",
    header: "Supervisor",
    cell: ({ getValue }) => {
      const supervisor = getValue() as string;
      return (
        <span>{supervisor === "all" ? "All Supervisors" : supervisor}</span>
      );
    },
  },
  {
    accessorKey: "medicaidId",
    header: "Medicaid ID",
  },
  {
    accessorKey: "clientID",
    header: "Client ID",
  },
  {
    accessorKey: "payerId",
    header: "Payer ID",
  },
  {
    accessorKey: "startDate",
    header: "Service Start Date",
    cell: ({ getValue }) => {
      const val = getValue() as string;
      if (!val) return "—";
      try {
        return format(new Date(val), "MM/dd/yyyy");
      } catch {
        return "—";
      }
    },
  },
  {
    accessorKey: "serviceEndDate",
    header: "Service End Date",
    cell: ({ getValue }) => {
      const val = getValue() as string;
      if (!val) return "—";
      try {
        return format(new Date(val), "MM/dd/yyyy");
      } catch {
        return "—";
      }
    },
  },
  {
    accessorKey: "services",
    header: "Services",
    cell: ({ getValue }) => (getValue() as string[]).join(", "),
  },
];
