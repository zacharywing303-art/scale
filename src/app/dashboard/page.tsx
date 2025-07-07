"use client";
import SidebarNav from "@/components/SidebarNav";
import { cn } from "@/lib/utils";
import { Link } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiX, FiMenu } from "react-icons/fi";
import React from "react";
import InboxSummary from "@/components/dashboard/inbox-summary";
import TaskList from "@/components/dashboard/tasks";
import ExceptionsSummary from "@/components/dashboard/exceptions";
import Alerts from "@/components/dashboard/alerts";
import DailySchedule from "@/components/dashboard/daily-schedule";

type NavigationItem = {
  name: string;
  href: string;
};

type NavigationSection = {
  section: string;
  items: NavigationItem[];
};

const navigation: NavigationSection[] = [
  {
    section: "General",
    items: [
      { name: "Home", href: "/dashboard" },
      { name: "Profile", href: "/dashboard/profile" },
    ],
  },
  {
    section: "Management",
    items: [
      { name: "Users", href: "/dashboard/users" },
      { name: "Settings", href: "/dashboard/settings" },
    ],
  },
];

export default function DashboardPage() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-[#007AFF]">My Agency</h1>
        </div>
        <SidebarNav />
      </aside>

      {/* Mobile sidebar toggle */}
      <div className="md:hidden flex flex-col w-full">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h1 className="text-xl font-bold text-[#007AFF]">My Agency</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 focus:outline-none"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        {sidebarOpen && (
          <nav className="bg-white border-b p-4 space-y-4">
            {navigation.map((section) => (
              <div key={section.section}>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  {section.section}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm font-medium",
                          pathname === item.href
                            ? "bg-[#007AFF] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Welcome to your dashboard. Select a module from the sidebar.
        </p>

        {/* Top Section: Exceptions + Daily Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ExceptionsSummary />
          </div>
          <div className="lg:col-span-2">
            <DailySchedule />
          </div>
        </div>

        {/* Middle Section: Inbox + Tasks + Alerts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InboxSummary />
          <TaskList />
          <Alerts />
        </div>
      </main>
    </div>
  );
}
