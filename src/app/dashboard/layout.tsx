"use client";

import SidebarNav from "@/components/SidebarNav";
import Topbar from "@/components/TopBar";
import { ReactNode, useState } from "react";
import Image from "next/image";
import { MenuIcon } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-64"
        } hidden md:flex flex-col bg-white border-r transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="bg-[#007AFF] h-16 flex items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Image src="/favicon.ico" alt="Logo" width={24} height={24} />
            {!collapsed && (
              <h1 className="text-xl font-bold text-[#FFFFFF]">My Agency</h1>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Toggle Sidebar"
          >
            <MenuIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* SidebarNav */}
        <SidebarNav collapsed={collapsed} />
      </aside>

      {/* Main area: Topbar + Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
