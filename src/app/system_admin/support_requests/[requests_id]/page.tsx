// app/system_admin/support_requests/[request_id]/page.tsx

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import GoBackButton from "@/components/custom/GoBackButton";

interface SupportResponse {
  id: string;
  responder: string;
  message: string;
  createdAt: string;
  attachments?: string[];
}

interface SupportRequest {
  id: string;
  agencyName: string;
  subject: string;
  description: string;
  createdAt: string;
  assignedTo?: string;
  status: "Open" | "In Progress" | "Resolved";
  history: SupportResponse[];
}

const mockSupportRequest: SupportRequest = {
  id: "SR-001",
  agencyName: "Sunrise Homecare",
  subject: "Issue with billing export",
  description: "The billing export crashes when filtering by date.",
  createdAt: "2025-07-21 10:14AM",
  status: "Open",
  assignedTo: "Hassan",
  history: [
    {
      id: "resp-1",
      responder: "System Admin",
      message: "Thanks for reporting! We're looking into this.",
      createdAt: "2025-07-21 11:30AM",
      attachments: [],
    },
  ],
};

export default function SupportRequestPage() {
  const { request_id } = useParams();
  const [response, setResponse] = useState("");
  const [assignedTo, setAssignedTo] = useState(mockSupportRequest.assignedTo);
  const [files, setFiles] = useState<FileList | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSendResponse = () => {
    console.log("Submitting response:", response, files);
    setResponse("");
    setFiles(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">
        Support Request: {mockSupportRequest.subject}
      </h1>

      <GoBackButton
        hasUnsavedChanges={false}
        onTriggerModal={function (): void {
          throw new Error("Function not implemented.");
        }}
      />

      <Card>
        <CardContent className="space-y-4 py-6">
          <div>
            <Label className="mb-1">Agency</Label>
            <p>{mockSupportRequest.agencyName}</p>
          </div>
          <div>
            <Label className="mb-1">Created At</Label>
            <p>{mockSupportRequest.createdAt}</p>
          </div>
          <div>
            <Label className="mb-1">Description</Label>
            <p>{mockSupportRequest.description}</p>
          </div>
          <div>
            <Label className="mb-1">Status</Label>
            <p>{mockSupportRequest.status}</p>
          </div>
          <div>
            <Label className="mb-1">Assigned To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Assign a team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hassan">Hassan</SelectItem>
                <SelectItem value="Person2">Person 2</SelectItem>
                <SelectItem value="Person3">Person 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Send Response</h2>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your reply here..."
        />
        <Input type="file" multiple onChange={handleFileUpload} />
        <Button onClick={handleSendResponse}>Send Response</Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Response History</h2>
        {mockSupportRequest.history.map((resp) => (
          <div key={resp.id} className="border p-4 rounded-md bg-muted">
            <p className="text-sm text-muted-foreground">
              <strong>{resp.responder}</strong> - {resp.createdAt}
            </p>
            <p>{resp.message}</p>
            {(resp.attachments?.length ?? 0) > 0 && (
              <div className="mt-2">
                <Label className="text-xs">Attachments:</Label>
                <ul className="list-disc list-inside text-sm">
                  {(resp.attachments ?? []).map((file, i) => (
                    <li
                      key={i}
                      className="text-blue-600 underline cursor-pointer"
                    >
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
