"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GeneralTab from "./GeneralTab";
import ClientTab from "./ClientTab";
import EmployeeTab from "./EmployeeTab";
import AuthorizationsTab from "./AuthorizationsTab";
import CallLogTab from "./CallLogTab";
import ExceptionsTab from "./ExceptionsTab";
import GPSTab from "./GPSTab";
import NotesTab from "./NoteTab";
import ClaimsTab from "./ClaimsTab";
import HistoryTab from "./HistoryTab";

export default function TabNavigation({ visit }: { visit: any }) {
  return (
    <Tabs defaultValue="general" className="flex-1 flex flex-col">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="client">Client</TabsTrigger>
        <TabsTrigger value="employee">Employee</TabsTrigger>
        <TabsTrigger value="authorizations">Authorizations</TabsTrigger>
        <TabsTrigger value="callLog">Call Log</TabsTrigger>
        <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
        <TabsTrigger value="gps">GPS</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="claims">Claims</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <div className="overflow-y-auto pr-2 flex-1">
        <TabsContent value="general">
          <GeneralTab visit={visit} />
        </TabsContent>
        <TabsContent value="client">
          <ClientTab visit={visit} />
        </TabsContent>
        <TabsContent value="employee">
          <EmployeeTab visit={visit} />
        </TabsContent>
        <TabsContent value="authorizations">
          <AuthorizationsTab visit={visit} />
        </TabsContent>
        <TabsContent value="callLog">
          <CallLogTab visit={visit} />
        </TabsContent>
        <TabsContent value="exceptions">
          <ExceptionsTab visit={visit} />
        </TabsContent>
        <TabsContent value="gps">
          <GPSTab visit={visit} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab visit={visit} />
        </TabsContent>
        <TabsContent value="claims">
          <ClaimsTab visit={visit} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab visit={visit} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
