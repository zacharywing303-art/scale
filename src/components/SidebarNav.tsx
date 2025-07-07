"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { dashboardNavigation } from "@/lib/navigation";
import clsx from "clsx";

export default function SidebarNav() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (href?: string) => {
    return href && pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r h-full p-4 space-y-2">
      {dashboardNavigation.map((item) => (
        <div key={item.label}>
          {item.children ? (
            <>
              <button
                onClick={() => toggleSection(item.label)}
                className={clsx(
                  "w-full text-left font-semibold px-2 py-2 rounded transition",
                  {
                    "bg-[#007AFF] text-white": item.children.some((child) =>
                      isActive(child.href ?? "")
                    ),
                    "hover:bg-gray-100 dark:hover:bg-gray-800":
                      !item.children.some((child) =>
                        isActive(child.href ?? "")
                      ),
                  }
                )}
              >
                {item.label}
              </button>

              {openSections[item.label] && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((sub) =>
                    sub.children ? (
                      <div key={sub.label}>
                        <button
                          onClick={() => toggleSection(sub.label)}
                          className={clsx(
                            "w-full text-left text-sm font-medium px-2 py-1 rounded transition",
                            {
                              "bg-[#007AFF] text-white": sub.children.some(
                                (link) => isActive(link.href)
                              ),
                              "hover:bg-gray-100 dark:hover:bg-gray-800":
                                !sub.children.some((link) =>
                                  isActive(link.href)
                                ),
                            }
                          )}
                        >
                          {sub.label}
                        </button>
                        {openSections[sub.label] && (
                          <div className="ml-4 mt-1 space-y-1">
                            {sub.children.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                  "block text-sm px-2 py-1 rounded transition",
                                  {
                                    "bg-[#007AFF] text-white": isActive(
                                      link.href
                                    ),
                                    "text-gray-600 dark:text-gray-300 hover:underline":
                                      !isActive(link.href),
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
                            "bg-[#007AFF] text-white": isActive(sub.href),
                            "text-gray-700 dark:text-gray-300 hover:underline":
                              !isActive(sub.href),
                          }
                        )}
                      >
                        {sub.label}
                      </Link>
                    )
                  )}
                </div>
              )}
            </>
          ) : (
            <Link
              href={item.href}
              className={clsx(
                "block font-semibold px-2 py-2 rounded transition",
                {
                  "bg-[#007AFF] text-white": isActive(item.href),
                  "hover:bg-gray-100 dark:hover:bg-gray-800": !isActive(
                    item.href
                  ),
                }
              )}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </aside>
  );
}
