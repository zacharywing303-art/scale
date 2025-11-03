"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GeneralTab from "./GeneralTab";
import ProgramTab from "./ProgramTab";
import ScheduleTab from "./ScheduleTab";
import InvoicesTab from "./InvoicesTab";
import AnalyticsTab from "./AnalyticsTab";

export default function ClientTabs({ client }: { client: any }) {
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
        <GeneralTab client={client} />
      </TabsContent>
      <TabsContent value="program">
        <ProgramTab client={client} />
      </TabsContent>
      <TabsContent value="schedule">
        <ScheduleTab client={client} />
      </TabsContent>
      <TabsContent value="invoices">
        <InvoicesTab client={client} />
      </TabsContent>
      <TabsContent value="analytics">
        <AnalyticsTab client={client} />
      </TabsContent>
    </Tabs>
  );
}
