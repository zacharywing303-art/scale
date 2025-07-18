import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

// Example client type (adjust fields if needed)
export type Client = {
  id: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  status: "pending" | "active" | "inactive";
  supervisor: string;
  medicaidId: string;
  payerId: string;
  serviceStartDate: string;
  serviceEndDate: string;
  services: string[]; // Example: ['IHCS', 'PAS']
};

export const columns: ColumnDef<Client>[] = [
  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => (
      <button className="text-blue-600 underline">Edit</button>
    ),
    enableSorting: false,
  },
  {
    id: "addProgram",
    header: "Add Program",
    cell: ({ row }) => (
      <button className="text-green-600 underline">Add</button>
    ),
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
  },
  {
    accessorKey: "medicaidId",
    header: "Medicaid ID",
  },
  {
    accessorKey: "id",
    header: "Client ID",
  },
  {
    accessorKey: "payerId",
    header: "Payer ID",
  },
  {
    accessorKey: "serviceStartDate",
    header: "Service Start Date",
    cell: ({ getValue }) =>
      format(new Date(getValue() as string), "MM/dd/yyyy"),
  },
  {
    accessorKey: "serviceEndDate",
    header: "Service End Date",
    cell: ({ getValue }) =>
      format(new Date(getValue() as string), "MM/dd/yyyy"),
  },
  {
    accessorKey: "services",
    header: "Services",
    cell: ({ getValue }) => (getValue() as string[]).join(", "),
  },
];
