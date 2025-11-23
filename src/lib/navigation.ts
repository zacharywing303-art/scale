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
  Building2,
  LifeBuoy,
  ShieldCheck,
  BarChart2,
  Plus,
  RefreshCcw,
  Briefcase,
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
      // {
      //   label: "Submit Invoice",
      //   href: "/dashboard/billing/submit-invoice",
      // },
      // {
      //   label: "Submitted",
      //   href: "/dashboard/billing/submitted",
      // },
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
    label: "Office",
    icon: Briefcase,
    children: [
      { label: "Statistics", href: "/dashboard/hr/statistics" },
      {
        label: "Document Review",
        href: "/dashboard/hr/document-review",
      },
      {
        label: "Payroll",
        href: "/dashboard/hr/payroll",
      },
      { label: "Employee Requests", href: "/dashboard/hr/requests" },
    ],
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

export const systemAdminNavigation = [
  {
    label: "Dashboard",
    href: "/system_admin",
    icon: BarChart,
  },
  {
    label: "Agencies",
    icon: Building2,
    href: "/system_admin/agencies",
  },
  // {
  //   label: "Add Agency",
  //   icon: Plus,
  //   href: "/system_admin/add_agency",
  // },
  {
    label: "Support Requests",
    icon: LifeBuoy,
    href: "/system_admin/support_requests",
  },
  // {
  //   label: "Reset Passwords",
  //   icon: RefreshCcw,
  //   href: "/system_admin/reset_passwords",
  // },
  {
    label: "Agency Settings",
    icon: Settings,
    href: "/system_admin/agency_settings",
  },
  {
    label: "Agency Statistics",
    icon: BarChart2,
    href: "/system_admin/statistics",
  },
  {
    label: "System Users",
    icon: Users,
    href: "/system_admin/users",
  },
  {
    label: "Billing Agencies",
    icon: DollarSign,
    href: "/system_admin/billing_agencies",
  },
  {
    label: "Permissions",
    icon: ShieldCheck,
    href: "/system_admin/permissions",
  },
];
