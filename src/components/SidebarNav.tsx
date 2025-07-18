"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { dashboardNavigation } from "@/lib/navigation";
import clsx from "clsx";
import { ChevronDownIcon } from "lucide-react";

export default function SidebarNav({ collapsed }: { collapsed: boolean }) {
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
    <nav className="bg-[#007AFF] flex-1 p-2 space-y-2 overflow-y-auto text-white">
      {dashboardNavigation.map((item) => (
        <div key={item.label}>
          {item.children ? (
            <div className="w-full">
              <div
                className={clsx(
                  "flex items-center justify-between px-2 py-2 font-semibold rounded transition cursor-pointer",
                  {
                    "bg-[#007AFF] text-white": true,
                    "hover:bg-[#005FCC]": true,
                  }
                )}
                onClick={() => toggleSection(item.label)}
              >
                <div className="flex items-center gap-2">
                  {item.icon && <item.icon className="w-4 h-4 text-white" />}
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && (
                  <ChevronDownIcon
                    className={clsx(
                      "w-4 h-4 transition-transform text-white",
                      openSections[item.label] ? "rotate-180" : "rotate-0"
                    )}
                  />
                )}
              </div>

              {!collapsed && openSections[item.label] && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((sub) =>
                    "children" in sub && Array.isArray(sub.children) ? (
                      <div key={sub.label}>
                        <div
                          className={clsx(
                            "flex items-center justify-between px-2 py-1 text-sm font-medium rounded transition cursor-pointer",
                            {
                              "hover:bg-[#005FCC]": true,
                            }
                          )}
                          onClick={() => toggleSection(sub.label)}
                        >
                          <span>{sub.label}</span>
                          <ChevronDownIcon
                            className={clsx(
                              "w-4 h-4 transition-transform text-white",
                              openSections[sub.label]
                                ? "rotate-180"
                                : "rotate-0"
                            )}
                          />
                        </div>
                        {openSections[sub.label] && (
                          <div className="ml-4 mt-1 space-y-1">
                            {sub.children.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                  "block text-sm px-2 py-1 rounded transition",
                                  {
                                    "bg-[#32D74B] text-white": isExactActive(
                                      link.href
                                    ),
                                    "hover:underline text-white":
                                      !isExactActive(link.href),
                                  }
                                )}
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={clsx(
                          "block text-sm px-2 py-1 rounded transition",
                          {
                            "bg-[#32D74B] text-white": isExactActive(sub.href),
                            "hover:underline text-white": !isExactActive(
                              sub.href
                            ),
                          }
                        )}
                      >
                        {sub.label}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link
              href={item.href ?? "#"}
              className={clsx(
                "flex items-center gap-2 font-semibold px-2 py-2 rounded transition",
                {
                  "bg-[#32D74B] text-white": isExactActive(item.href),
                  "hover:bg-[#005FCC] text-white": !isExactActive(item.href),
                }
              )}
            >
              {item.icon && <item.icon className="w-4 h-4 text-white" />}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
