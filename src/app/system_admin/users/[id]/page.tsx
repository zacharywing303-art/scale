"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Mocked data fetching (replace with real API call)
const fetchUserById = async (id: string) => {
  console.log("Fetching user:", id);
  await new Promise((resolve) => setTimeout(resolve, 500)); // simulate delay
  return {
    id,
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Active" as "Active" | "Inactive" | "Suspended",
    createdAt: "2023-01-01T12:00:00Z",
    lastLogin: "2024-12-01T10:20:00Z",
  };
};

// Mock for checking if the current user is the main admin
const isMainAdmin = true; // TODO: replace with actual auth check

export default function SystemUserDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Suspended">(
    "Active"
  );

  useEffect(() => {
    if (id) {
      fetchUserById(String(id)).then((data) => {
        setUser(data);
        setName(data.name);
        setEmail(data.email);
        setStatus(data.status);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSave = () => {
    // TODO: send updated data to backend
    toast.success("User updated successfully");
    console.log("Updated User:", { id: id, name, email, status });
  };

  if (loading) {
    return <div className="p-6">Loading user data...</div>;
  }
  if (!user) {
    return <div className="p-6">User not found.</div>; // only shown if loading is false AND user is still null
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">System User Details</h1>

      <Card className="p-6 space-y-4">
        <div>
          <Label htmlFor="name" className="mb-2">
            Full Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isMainAdmin}
          />
        </div>

        <div>
          <Label htmlFor="email" className="mb-2">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isMainAdmin}
          />
        </div>

        <div>
          <Label htmlFor="status" className="mb-2">
            Status
          </Label>
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as any)}
            disabled={!isMainAdmin}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Created:</strong>{" "}
            {new Date(user.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Last Login:</strong>{" "}
            {new Date(user.lastLogin).toLocaleString()}
          </p>
        </div>

        {isMainAdmin && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => history.back()}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
