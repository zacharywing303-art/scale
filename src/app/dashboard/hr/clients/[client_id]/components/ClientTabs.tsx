"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GeneralTab from "./GeneralTab";
import ProgramTab from "./ProgramTab";
import ScheduleTab from "./ScheduleTab";
import InvoicesTab from "./InvoicesTab";
import AnalyticsTab from "./AnalyticsTab";

export default function ClientTabs({ clientId }: { clientId: string }) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="program">Program</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <GeneralTab />
      </TabsContent>
      <TabsContent value="program">
        <ProgramTab />
      </TabsContent>
      <TabsContent value="schedule">
        <ScheduleTab />
      </TabsContent>
      <TabsContent value="invoices">
        <InvoicesTab />
      </TabsContent>
      <TabsContent value="analytics">
        <AnalyticsTab />
      </TabsContent>
    </Tabs>
  );
}
