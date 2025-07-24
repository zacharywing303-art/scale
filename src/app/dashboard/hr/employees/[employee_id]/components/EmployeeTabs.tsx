"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GeneralTab from "./GeneralTab";
import EmploymentInfoTab from "./EmploymentInfoTab";
import ScheduleTab from "./ScheduleTab";
import AnalyticsTab from "./AnalyticsTab";

export default function EmployeeTabs({ employeeId }: { employeeId: string }) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="employment_info">Employment Info</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <GeneralTab />
      </TabsContent>
      <TabsContent value="employment_info">
        <EmploymentInfoTab />
      </TabsContent>
      <TabsContent value="schedule">
        <ScheduleTab />
      </TabsContent>
      <TabsContent value="analytics">
        <AnalyticsTab />
      </TabsContent>
    </Tabs>
  );
}
