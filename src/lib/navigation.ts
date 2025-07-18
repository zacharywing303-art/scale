// // lib/navigation.ts
import {
  CalendarDays,
  Users,
  FileText,
  HelpCircle,
  Settings,
  BarChart,
  UserCog,
  DollarSign,
  Cog,
} from "lucide-react";

export const dashboardNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: BarChart,
  },
  {
    label: "Scheduling",
    icon: CalendarDays,
    children: [
      { label: "View Schedule", href: "/dashboard/scheduling/schedule-view" },
      {
        label: "Create Schedule",
        href: "/dashboard/scheduling/schedule-create",
      },
      { label: "Edit Schedule", href: "/dashboard/scheduling/schedule-edit" },
    ],
  },
  {
    label: "Visits",
    icon: FileText,
    href: "/dashboard/visits",
  },
  {
    label: "Billing",
    icon: DollarSign,
    children: [
      {
        label: "Create Invoice",
        href: "/dashboard/billing/create-invoice",
      },
      {
        label: "Submit Invoice",
        href: "/dashboard/billing/submit-invoice",
      },
      {
        label: "Submitted",
        href: "/dashboard/billing/submitted",
      },
      {
        label: "Payers",
        href: "/dashboard/billing/payers",
      },
    ],
  },
  {
    label: "Clients",
    icon: Users,
    href: "/dashboard/hr/clients",
  },
  {
    label: "Employees",
    icon: UserCog,
    href: "/dashboard/hr/employees",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/dashboard/reports",
  },
  {
    label: "Training",
    icon: Settings,
    href: "/dashboard/training",
  },
  {
    label: "Manage Users",
    icon: Cog,
    href: "/dashboard/hr/users",
  },
  {
    label: "Contact Support",
    icon: HelpCircle,
    href: "/support/contact",
  },
];
