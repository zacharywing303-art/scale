"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import React from "react";
import InboxSummary from "@/components/dashboard/inbox-summary";
import TaskList from "@/components/dashboard/tasks";
import ExceptionsSummary from "@/components/dashboard/exceptions";
import Alerts from "@/components/dashboard/alerts";
import DailySchedule from "@/components/dashboard/daily-schedule";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
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
