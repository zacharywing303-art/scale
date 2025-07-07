// lib/navigation.ts
export const dashboardNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "layout-dashboard",
  },
  {
    label: "EVV",
    children: [
      {
        label: "Scheduling",
        children: [
          {
            label: "View Schedule",
            href: "/dashboard/scheduling/schedule-view",
          },
          {
            label: "Edit Schedule",
            href: "/dashboard/scheduling/schedule-edit",
          },
          {
            label: "Create Schedule",
            href: "/dashboard/scheduling/schedule-create",
          },
        ],
      },
      {
        label: "Visits",
        href: "/dashboard/visits",
      },
      {
        label: "Billing",
        href: "/dashboard/billing",
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
      },
      {
        label: "Training",
        href: "/dashboard/training",
      },
    ],
  },
  {
    label: "HR",
    children: [
      { label: "Clients", href: "/dashboard/hr/clients" },
      { label: "Employees", href: "/dashboard/hr/employees" },
      { label: "Manage Users", href: "/dashboard/hr/users" },
    ],
  },
  {
    label: "Help",
    children: [
      { label: "Contact Support", href: "/dashboard/help/contact" },
      { label: "Manual", href: "/dashboard/help/manual" },
    ],
  },
];
