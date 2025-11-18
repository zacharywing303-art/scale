"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GeneralTab from "./GeneralTab";
import EmploymentInfoTab from "./EmploymentInfoTab";
import ScheduleTab from "./ScheduleTab";
import AnalyticsTab from "./AnalyticsTab";

export default function EmployeeTabs({ employee }: { employee: any }) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="employment_info">Employment Info</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <GeneralTab employee={employee} />
      </TabsContent>
      <TabsContent value="employment_info">
        <EmploymentInfoTab employee={employee} />
      </TabsContent>
      <TabsContent value="schedule">
        <ScheduleTab employee={employee} />
      </TabsContent>
      <TabsContent value="analytics">
        <AnalyticsTab employee={employee} />
      </TabsContent>
    </Tabs>
  );
}
