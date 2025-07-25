"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { systemAdminNavigation } from "@/lib/navigation";
import clsx from "clsx";
import { ChevronDownIcon } from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: Array<{
    label: string;
    href: string;
  }>;
};

export default function SysAdminSideBarNav({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isExactActive = (href?: string) => {
    return href && pathname === href;
  };

  return (
    <nav className="bg-[#111827] flex-1 p-2 space-y-2 overflow-y-auto text-white">
      {systemAdminNavigation.map((item) => (
        <Link
          key={item.label}
          href={item.href ?? "#"}
          className={clsx(
            "flex items-center gap-2 font-semibold px-2 py-2 rounded transition",
            {
              "bg-[#32D74B] text-white": isExactActive(item.href),
              "hover:bg-gray-800 text-white": !isExactActive(item.href),
            }
          )}
        >
          {item.icon && <item.icon className="w-4 h-4 text-white" />}
          {!collapsed && <span>{item.label}</span>}
        </Link>
      ))}
    </nav>
  );
}
